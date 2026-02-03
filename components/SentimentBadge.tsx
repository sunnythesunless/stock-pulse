'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type SentimentData = {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    score: number;
    summary: string;
};

interface SentimentBadgeProps {
    data: SentimentData | null;
    loading?: boolean;
}

const SentimentBadge = ({ data, loading }: SentimentBadgeProps) => {
    if (loading) {
        return (
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-700 rounded w-32"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
                <p className="text-sm text-gray-500">Sentiment analysis unavailable</p>
            </div>
        );
    }

    const { sentiment, score, summary } = data;

    const config = {
        bullish: {
            icon: TrendingUp,
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30',
            textColor: 'text-green-500',
            label: 'Bullish',
            barColor: 'bg-green-500',
        },
        bearish: {
            icon: TrendingDown,
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30',
            textColor: 'text-red-500',
            label: 'Bearish',
            barColor: 'bg-red-500',
        },
        neutral: {
            icon: Minus,
            bgColor: 'bg-gray-500/10',
            borderColor: 'border-gray-500/30',
            textColor: 'text-gray-400',
            label: 'Neutral',
            barColor: 'bg-gray-500',
        },
    };

    const { icon: Icon, bgColor, borderColor, textColor, label, barColor } = config[sentiment];

    return (
        <div className={`${bgColor} rounded-lg border ${borderColor} p-4`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">AI Sentiment</span>
                <div className={`flex items-center gap-1.5 ${textColor}`}>
                    <Icon className="w-4 h-4" />
                    <span className="font-semibold">{label}</span>
                </div>
            </div>

            {/* Score Bar */}
            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                <div
                    className={`absolute left-0 top-0 h-full ${barColor} transition-all duration-500`}
                    style={{ width: `${score}%` }}
                />
            </div>

            {/* Score Value */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Bearish</span>
                <span className={`text-lg font-bold ${textColor}`}>{score}%</span>
                <span className="text-xs text-gray-500">Bullish</span>
            </div>

            {/* Summary */}
            <p className="text-sm text-gray-300 mt-3">{summary}</p>
        </div>
    );
};

export default SentimentBadge;
