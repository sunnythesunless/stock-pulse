'use client';

import { useState } from 'react';
import { createAlert } from '@/lib/actions/alert.actions';
import { toast } from 'sonner';
import { Bell, TrendingUp, TrendingDown } from 'lucide-react';

interface AlertFormProps {
    symbol: string;
    company: string;
    onSuccess?: () => void;
}

export default function AlertForm({ symbol, company, onSuccess }: AlertFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [alertType, setAlertType] = useState<'upper' | 'lower'>('upper');
    const [targetPrice, setTargetPrice] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetPrice || isNaN(Number(targetPrice))) {
            toast.error('Please enter a valid price');
            return;
        }

        setIsLoading(true);
        try {
            const result = await createAlert({
                symbol,
                company,
                alertType,
                targetPrice: Number(targetPrice),
            });

            if (result.success) {
                toast.success(`Alert created! You'll be notified when ${symbol} goes ${alertType === 'upper' ? 'above' : 'below'} $${targetPrice}`);
                setTargetPrice('');
                onSuccess?.();
            } else {
                toast.error(result.error || 'Failed to create alert');
            }
        } catch (err) {
            toast.error('Failed to create alert');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-white">Set Price Alert for {symbol}</h3>
            </div>

            <div className="grid gap-4">
                {/* Alert Type Toggle */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setAlertType('upper')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${alertType === 'upper'
                                ? 'bg-green-500/20 text-green-500 border border-green-500'
                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Above
                    </button>
                    <button
                        type="button"
                        onClick={() => setAlertType('lower')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${alertType === 'lower'
                                ? 'bg-red-500/20 text-red-500 border border-red-500'
                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}
                    >
                        <TrendingDown className="w-4 h-4" />
                        Below
                    </button>
                </div>

                {/* Target Price */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Target Price ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        placeholder="Enter price..."
                        className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-yellow-500 text-black font-medium py-2 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Creating...' : 'Create Alert'}
                </button>
            </div>
        </form>
    );
}
