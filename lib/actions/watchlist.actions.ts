'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Better Auth stores users in the "user" collection
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function getUserWatchlist(): Promise<{ symbol: string; company: string; addedAt: Date }[]> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return [];

    await connectToDatabase();
    const items = await Watchlist.find({ userId: session.user.id }).sort({ addedAt: -1 }).lean();

    return items.map((item) => ({
      symbol: String(item.symbol),
      company: String(item.company),
      addedAt: item.addedAt,
    }));
  } catch (err) {
    console.error('getUserWatchlist error:', err);
    return [];
  }
}

export async function removeFromWatchlist(symbol: string): Promise<{ success: boolean }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false };

    await connectToDatabase();
    await Watchlist.deleteOne({ userId: session.user.id, symbol: symbol.toUpperCase() });

    return { success: true };
  } catch (err) {
    console.error('removeFromWatchlist error:', err);
    return { success: false };
  }
}

export async function addToWatchlist(symbol: string, company: string): Promise<{ success: boolean }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false };

    await connectToDatabase();

    // Check if already exists
    const existing = await Watchlist.findOne({ userId: session.user.id, symbol: symbol.toUpperCase() });
    if (existing) return { success: true }; // Already in watchlist

    await Watchlist.create({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
      company: company,
      addedAt: new Date(),
    });

    return { success: true };
  } catch (err) {
    console.error('addToWatchlist error:', err);
    return { success: false };
  }
}
