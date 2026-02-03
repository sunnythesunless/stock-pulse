import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface IAlert extends Document {
    userId: string;
    symbol: string;
    company: string;
    alertType: 'upper' | 'lower';
    targetPrice: number;
    triggered: boolean;
    createdAt: Date;
    triggeredAt?: Date;
}

const AlertSchema = new Schema<IAlert>(
    {
        userId: { type: String, required: true, index: true },
        symbol: { type: String, required: true, uppercase: true, trim: true },
        company: { type: String, required: true, trim: true },
        alertType: { type: String, enum: ['upper', 'lower'], required: true },
        targetPrice: { type: Number, required: true },
        triggered: { type: Boolean, default: false },
        triggeredAt: { type: Date },
    },
    { timestamps: true }
);

// Compound index for efficient queries
AlertSchema.index({ userId: 1, symbol: 1, triggered: 1 });

export const Alert: Model<IAlert> =
    (models?.Alert as Model<IAlert>) || model<IAlert>('Alert', AlertSchema);
