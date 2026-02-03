'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Alert } from '@/database/models/alert.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export type AlertData = {
    id: string;
    symbol: string;
    company: string;
    alertType: 'upper' | 'lower';
    targetPrice: number;
    triggered: boolean;
    createdAt: Date;
    triggeredAt?: Date;
};

export async function createAlert(data: {
    symbol: string;
    company: string;
    alertType: 'upper' | 'lower';
    targetPrice: number;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

        await connectToDatabase();

        // Check if user already has an alert for this symbol
        const existing = await Alert.findOne({
            userId: session.user.id,
            symbol: data.symbol.toUpperCase(),
            triggered: false,
        });

        if (existing) {
            return { success: false, error: 'You already have an active alert for this stock' };
        }

        await Alert.create({
            userId: session.user.id,
            symbol: data.symbol.toUpperCase(),
            company: data.company,
            alertType: data.alertType,
            targetPrice: data.targetPrice,
            triggered: false,
        });

        revalidatePath('/alerts');
        revalidatePath(`/stocks/${data.symbol}`);
        return { success: true };
    } catch (err) {
        console.error('createAlert error:', err);
        return { success: false, error: 'Failed to create alert' };
    }
}

export async function getUserAlerts(): Promise<AlertData[]> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) return [];

        await connectToDatabase();
        const alerts = await Alert.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();

        return alerts.map((alert) => ({
            id: String(alert._id),
            symbol: alert.symbol,
            company: alert.company,
            alertType: alert.alertType,
            targetPrice: alert.targetPrice,
            triggered: alert.triggered,
            createdAt: alert.createdAt,
            triggeredAt: alert.triggeredAt,
        }));
    } catch (err) {
        console.error('getUserAlerts error:', err);
        return [];
    }
}

export async function deleteAlert(alertId: string): Promise<{ success: boolean }> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) return { success: false };

        await connectToDatabase();
        await Alert.deleteOne({ _id: alertId, userId: session.user.id });

        revalidatePath('/alerts');
        return { success: true };
    } catch (err) {
        console.error('deleteAlert error:', err);
        return { success: false };
    }
}

// Get all pending alerts for a specific symbol (used by cron job)
export async function getPendingAlertsForSymbol(symbol: string) {
    try {
        await connectToDatabase();
        return await Alert.find({
            symbol: symbol.toUpperCase(),
            triggered: false,
        }).lean();
    } catch (err) {
        console.error('getPendingAlertsForSymbol error:', err);
        return [];
    }
}

// Mark alert as triggered
export async function triggerAlert(alertId: string): Promise<{ success: boolean }> {
    try {
        await connectToDatabase();
        await Alert.updateOne(
            { _id: alertId },
            { $set: { triggered: true, triggeredAt: new Date() } }
        );
        return { success: true };
    } catch (err) {
        console.error('triggerAlert error:', err);
        return { success: false };
    }
}

// Get all pending (untriggered) alerts - used by cron job
export async function getAllPendingAlerts() {
    try {
        await connectToDatabase();
        return await Alert.find({ triggered: false }).lean();
    } catch (err) {
        console.error('getAllPendingAlerts error:', err);
        return [];
    }
}
