'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Transaction } from '@/database/models/transaction.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export type TransactionData = {
    id: string;
    symbol: string;
    company: string;
    type: 'buy' | 'sell';
    quantity: number;
    price: number;
    date: Date;
    notes?: string;
};

export type PortfolioHolding = {
    symbol: string;
    company: string;
    quantity: number;
    avgPrice: number;
    totalCost: number;
    currentValue?: number;
    pnl?: number;
    pnlPercent?: number;
};

export async function addTransaction(data: {
    symbol: string;
    company: string;
    type: 'buy' | 'sell';
    quantity: number;
    price: number;
    date?: Date;
    notes?: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

        await connectToDatabase();

        await Transaction.create({
            userId: session.user.id,
            symbol: data.symbol.toUpperCase(),
            company: data.company,
            type: data.type,
            quantity: data.quantity,
            price: data.price,
            date: data.date || new Date(),
            notes: data.notes,
        });

        revalidatePath('/portfolio');
        return { success: true };
    } catch (err) {
        console.error('addTransaction error:', err);
        return { success: false, error: 'Failed to add transaction' };
    }
}

export async function getTransactionHistory(): Promise<TransactionData[]> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) return [];

        await connectToDatabase();
        const transactions = await Transaction.find({ userId: session.user.id })
            .sort({ date: -1 })
            .limit(50)
            .lean();

        return transactions.map((t) => ({
            id: String(t._id),
            symbol: t.symbol,
            company: t.company,
            type: t.type,
            quantity: t.quantity,
            price: t.price,
            date: t.date,
            notes: t.notes,
        }));
    } catch (err) {
        console.error('getTransactionHistory error:', err);
        return [];
    }
}

export async function getPortfolioHoldings(): Promise<PortfolioHolding[]> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) return [];

        await connectToDatabase();
        const transactions = await Transaction.find({ userId: session.user.id }).lean();

        // Aggregate holdings by symbol
        const holdingsMap = new Map<string, { company: string; buyQty: number; sellQty: number; totalCost: number }>();

        for (const t of transactions) {
            const existing = holdingsMap.get(t.symbol) || {
                company: t.company,
                buyQty: 0,
                sellQty: 0,
                totalCost: 0,
            };

            if (t.type === 'buy') {
                existing.buyQty += t.quantity;
                existing.totalCost += t.quantity * t.price;
            } else {
                existing.sellQty += t.quantity;
                existing.totalCost -= t.quantity * t.price;
            }

            holdingsMap.set(t.symbol, existing);
        }

        // Convert to array and calculate metrics
        const holdings: PortfolioHolding[] = [];
        for (const [symbol, data] of holdingsMap) {
            const quantity = data.buyQty - data.sellQty;
            if (quantity > 0) {
                const avgPrice = data.totalCost / quantity;
                holdings.push({
                    symbol,
                    company: data.company,
                    quantity,
                    avgPrice: Math.round(avgPrice * 100) / 100,
                    totalCost: Math.round(data.totalCost * 100) / 100,
                });
            }
        }

        return holdings.sort((a, b) => b.totalCost - a.totalCost);
    } catch (err) {
        console.error('getPortfolioHoldings error:', err);
        return [];
    }
}

export async function deleteTransaction(transactionId: string): Promise<{ success: boolean }> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) return { success: false };

        await connectToDatabase();
        await Transaction.deleteOne({ _id: transactionId, userId: session.user.id });

        revalidatePath('/portfolio');
        return { success: true };
    } catch (err) {
        console.error('deleteTransaction error:', err);
        return { success: false };
    }
}

export async function getPortfolioStats(): Promise<{
    totalValue: number;
    totalInvested: number;
    holdingsCount: number;
}> {
    try {
        const holdings = await getPortfolioHoldings();
        return {
            totalValue: holdings.reduce((sum, h) => sum + h.totalCost, 0),
            totalInvested: holdings.reduce((sum, h) => sum + h.totalCost, 0),
            holdingsCount: holdings.length,
        };
    } catch (err) {
        console.error('getPortfolioStats error:', err);
        return { totalValue: 0, totalInvested: 0, holdingsCount: 0 };
    }
}
