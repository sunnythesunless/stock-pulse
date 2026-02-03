'use client';

import { useState } from 'react';
import { addTransaction } from '@/lib/actions/portfolio.actions';
import { toast } from 'sonner';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';

interface TransactionFormProps {
    defaultSymbol?: string;
    defaultCompany?: string;
    onSuccess?: () => void;
}

export default function TransactionForm({ defaultSymbol = '', defaultCompany = '', onSuccess }: TransactionFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [type, setType] = useState<'buy' | 'sell'>('buy');
    const [symbol, setSymbol] = useState(defaultSymbol);
    const [company, setCompany] = useState(defaultCompany);
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!symbol || !quantity || !price) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            const result = await addTransaction({
                symbol,
                company: company || symbol,
                type,
                quantity: Number(quantity),
                price: Number(price),
                notes: notes || undefined,
            });

            if (result.success) {
                toast.success(`${type === 'buy' ? 'Bought' : 'Sold'} ${quantity} shares of ${symbol}`);
                setSymbol(defaultSymbol);
                setCompany(defaultCompany);
                setQuantity('');
                setPrice('');
                setNotes('');
                onSuccess?.();
            } else {
                toast.error(result.error || 'Failed to add transaction');
            }
        } catch (err) {
            toast.error('Failed to add transaction');
        } finally {
            setIsLoading(false);
        }
    };

    const totalValue = Number(quantity) * Number(price);

    return (
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-white">Add Transaction</h3>
            </div>

            <div className="grid gap-4">
                {/* Transaction Type Toggle */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setType('buy')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${type === 'buy'
                                ? 'bg-green-500/20 text-green-500 border border-green-500'
                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Buy
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('sell')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${type === 'sell'
                                ? 'bg-red-500/20 text-red-500 border border-red-500'
                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}
                    >
                        <TrendingDown className="w-4 h-4" />
                        Sell
                    </button>
                </div>

                {/* Symbol */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Stock Symbol *</label>
                    <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        placeholder="AAPL"
                        className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none uppercase"
                        required
                    />
                </div>

                {/* Company Name */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                    <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Apple Inc."
                        className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                    />
                </div>

                {/* Quantity and Price */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Quantity *</label>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="10"
                            className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Price ($) *</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="150.00"
                            className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                            required
                        />
                    </div>
                </div>

                {/* Total Value Preview */}
                {quantity && price && (
                    <div className="bg-[#0f0f0f] rounded-lg p-3 text-center">
                        <span className="text-gray-400 text-sm">Total Value: </span>
                        <span className={`font-semibold ${type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                )}

                {/* Notes */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Notes (optional)</label>
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Earnings play..."
                        className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-yellow-500 text-black font-medium py-2 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Adding...' : `Add ${type === 'buy' ? 'Buy' : 'Sell'} Transaction`}
                </button>
            </div>
        </form>
    );
}
