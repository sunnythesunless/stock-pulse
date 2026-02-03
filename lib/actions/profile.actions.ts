'use server';

import { connectToDatabase } from '@/database/mongoose';
import { UserPreferences } from '@/database/models/userPreferences.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export type UserProfileData = {
    name: string;
    email: string;
    country: string;
    investmentGoals: string;
    riskTolerance: string;
    preferredIndustry: string;
    emailNotifications: boolean;
    dailyNewsEnabled: boolean;
};

export async function getUserProfile(): Promise<UserProfileData | null> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return null;

        await connectToDatabase();

        // Get user preferences
        const existingPrefs = await UserPreferences.findOne({ userId: session.user.id }).lean();

        // If no prefs exist, create default ones
        if (!existingPrefs) {
            const newPrefs = await UserPreferences.create({
                userId: session.user.id,
                country: 'US',
                investmentGoals: 'Growth',
                riskTolerance: 'Medium',
                preferredIndustry: 'Technology',
                emailNotifications: true,
                dailyNewsEnabled: true,
            });

            return {
                name: session.user.name || '',
                email: session.user.email || '',
                country: newPrefs.country,
                investmentGoals: newPrefs.investmentGoals,
                riskTolerance: newPrefs.riskTolerance,
                preferredIndustry: newPrefs.preferredIndustry,
                emailNotifications: newPrefs.emailNotifications,
                dailyNewsEnabled: newPrefs.dailyNewsEnabled,
            };
        }

        return {
            name: session.user.name || '',
            email: session.user.email || '',
            country: existingPrefs.country,
            investmentGoals: existingPrefs.investmentGoals,
            riskTolerance: existingPrefs.riskTolerance,
            preferredIndustry: existingPrefs.preferredIndustry,
            emailNotifications: existingPrefs.emailNotifications,
            dailyNewsEnabled: existingPrefs.dailyNewsEnabled,
        };
    } catch (err) {
        console.error('getUserProfile error:', err);
        return null;
    }
}

export async function updateUserProfile(data: Partial<Omit<UserProfileData, 'name' | 'email'>>): Promise<{ success: boolean }> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) return { success: false };

        await connectToDatabase();

        await UserPreferences.findOneAndUpdate(
            { userId: session.user.id },
            { $set: data },
            { upsert: true, new: true }
        );

        revalidatePath('/profile');
        return { success: true };
    } catch (err) {
        console.error('updateUserProfile error:', err);
        return { success: false };
    }
}
