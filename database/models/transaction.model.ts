import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface ITransaction extends Document {
    userId: string;
    symbol: string;
    company: string;
    type: 'buy' | 'sell';
    quantity: number;
    price: number;
    date: Date;
    notes?: string;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        userId: { type: String, required: true, index: true },
        symbol: { type: String, required: true, uppercase: true, trim: true },
        company: { type: String, required: true, trim: true },
        type: { type: String, enum: ['buy', 'sell'], required: true },
        quantity: { type: Number, required: true, min: 0 },
        price: { type: Number, required: true, min: 0 },
        date: { type: Date, required: true, default: Date.now },
        notes: { type: String, trim: true },
    },
    { timestamps: true }
);

// Index for efficient portfolio queries
TransactionSchema.index({ userId: 1, symbol: 1, date: -1 });

export const Transaction: Model<ITransaction> =
    (models?.Transaction as Model<ITransaction>) || model<ITransaction>('Transaction', TransactionSchema);
