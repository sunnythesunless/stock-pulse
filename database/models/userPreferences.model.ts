import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface IUserPreferences extends Document {
    userId: string;
    country: string;
    investmentGoals: string;
    riskTolerance: string;
    preferredIndustry: string;
    emailNotifications: boolean;
    dailyNewsEnabled: boolean;
    updatedAt: Date;
}

const UserPreferencesSchema = new Schema<IUserPreferences>(
    {
        userId: { type: String, required: true, unique: true, index: true },
        country: { type: String, default: 'US' },
        investmentGoals: { type: String, default: 'Growth' },
        riskTolerance: { type: String, default: 'Medium' },
        preferredIndustry: { type: String, default: 'Technology' },
        emailNotifications: { type: Boolean, default: true },
        dailyNewsEnabled: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const UserPreferences: Model<IUserPreferences> =
    (models?.UserPreferences as Model<IUserPreferences>) || model<IUserPreferences>('UserPreferences', UserPreferencesSchema);
