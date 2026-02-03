'use server';

import { getUserWatchlist } from '@/lib/actions/watchlist.actions';
import { getPortfolioHoldings, getTransactionHistory } from '@/lib/actions/portfolio.actions';

function convertToCSV(data: Record<string, unknown>[], headers: string[]): string {
    const headerRow = headers.join(',');
    const rows = data.map(item =>
        headers.map(header => {
            const value = item[header];
            // Handle strings with commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return String(value ?? '');
        }).join(',')
    );
    return [headerRow, ...rows].join('\n');
}

export async function exportWatchlistCSV(): Promise<{ data: string; filename: string } | null> {
    try {
        const watchlist = await getUserWatchlist();

        if (watchlist.length === 0) return null;

        const data = watchlist.map(item => ({
            symbol: item.symbol,
            company: item.company,
            addedAt: new Date(item.addedAt).toISOString().split('T')[0],
        }));

        const csv = convertToCSV(data, ['symbol', 'company', 'addedAt']);
        const today = new Date().toISOString().split('T')[0];

        return { data: csv, filename: `stockpulse-watchlist-${today}.csv` };
    } catch (err) {
        console.error('exportWatchlistCSV error:', err);
        return null;
    }
}

export async function exportPortfolioCSV(): Promise<{ data: string; filename: string } | null> {
    try {
        const holdings = await getPortfolioHoldings();

        if (holdings.length === 0) return null;

        const data = holdings.map(item => ({
            symbol: item.symbol,
            company: item.company,
            quantity: item.quantity,
            avgPrice: item.avgPrice,
            totalCost: item.totalCost,
        }));

        const csv = convertToCSV(data, ['symbol', 'company', 'quantity', 'avgPrice', 'totalCost']);
        const today = new Date().toISOString().split('T')[0];

        return { data: csv, filename: `stockpulse-portfolio-${today}.csv` };
    } catch (err) {
        console.error('exportPortfolioCSV error:', err);
        return null;
    }
}

export async function exportTransactionsCSV(): Promise<{ data: string; filename: string } | null> {
    try {
        const transactions = await getTransactionHistory();

        if (transactions.length === 0) return null;

        const data = transactions.map(item => ({
            date: new Date(item.date).toISOString().split('T')[0],
            type: item.type,
            symbol: item.symbol,
            company: item.company,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price,
            notes: item.notes || '',
        }));

        const csv = convertToCSV(data, ['date', 'type', 'symbol', 'company', 'quantity', 'price', 'total', 'notes']);
        const today = new Date().toISOString().split('T')[0];

        return { data: csv, filename: `stockpulse-transactions-${today}.csv` };
    } catch (err) {
        console.error('exportTransactionsCSV error:', err);
        return null;
    }
}
