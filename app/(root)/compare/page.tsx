'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, TrendingUp, ArrowLeftRight } from 'lucide-react';
import TradingViewWidget from '@/components/TradingViewWidget';
import SearchCommand from '@/components/SearchCommand';
import { searchStocks } from '@/lib/actions/finnhub.actions';

const COMPARE_CHART_CONFIG = (symbols: string[]) => ({
    symbols: symbols.map(s => ({ s: `NASDAQ:${s}`, d: s })),
    chartOnly: false,
    width: '100%',
    height: 500,
    locale: 'en',
    colorTheme: 'dark',
    autosize: false,
    showVolume: false,
    showMA: false,
    hideDateRanges: false,
    hideMarketStatus: false,
    hideSymbolLogo: false,
    scalePosition: 'right',
    scaleMode: 'Normal',
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, sans-serif',
    fontSize: '10',
    noTimeScale: false,
    valuesTracking: '1',
    changeMode: 'price-and-percent',
    chartType: 'area',
    lineWidth: 2,
    lineType: 0,
    dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D', '60m|1W', 'all|1M'],
    isTransparent: true,
});

export default function ComparePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get symbols from URL params
    const initialSymbols = searchParams.get('symbols')?.split(',').filter(Boolean) || [];
    const [symbols, setSymbols] = useState<string[]>(initialSymbols.slice(0, 4));
    const [initialStocks, setInitialStocks] = useState<StockWithWatchlistStatus[]>([]);

    // Load initial stocks for SearchCommand
    useEffect(() => {
        searchStocks().then(setInitialStocks).catch(() => setInitialStocks([]));
    }, []);

    const addSymbol = useCallback((stock: StockWithWatchlistStatus) => {
        const upper = stock.symbol.toUpperCase();
        if (!symbols.includes(upper) && symbols.length < 4) {
            const newSymbols = [...symbols, upper];
            setSymbols(newSymbols);
            router.push(`/compare?symbols=${newSymbols.join(',')}`, { scroll: false });
        }
    }, [symbols, router]);

    const removeSymbol = useCallback((symbol: string) => {
        const newSymbols = symbols.filter(s => s !== symbol);
        setSymbols(newSymbols);
        router.push(`/compare?symbols=${newSymbols.join(',')}`, { scroll: false });
    }, [symbols, router]);

    const stockColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <ArrowLeftRight className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold text-white">Compare Stocks</h1>
            </div>

            {/* Add stocks using existing SearchCommand */}
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6 mb-8">
                <div className="flex flex-wrap gap-4 items-center">
                    {symbols.length < 4 ? (
                        <SearchCommand
                            renderAs="button"
                            label="Add Stock to Compare"
                            initialStocks={initialStocks}
                            onSelect={addSymbol}
                        />
                    ) : (
                        <p className="text-yellow-500 text-sm">Maximum 4 stocks reached</p>
                    )}
                </div>

                {/* Selected symbols */}
                {symbols.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-4">
                        {symbols.map((symbol, index) => (
                            <div
                                key={symbol}
                                className="flex items-center gap-2 px-4 py-2 rounded-full border"
                                style={{
                                    borderColor: stockColors[index],
                                    backgroundColor: `${stockColors[index]}20`
                                }}
                            >
                                <TrendingUp className="w-4 h-4" style={{ color: stockColors[index] }} />
                                <span className="font-medium text-white">{symbol}</span>
                                <button
                                    onClick={() => removeSymbol(symbol)}
                                    className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {symbols.length === 0 && (
                    <p className="text-gray-500 mt-4">Add up to 4 stocks to compare their performance</p>
                )}
            </div>

            {/* Comparison Chart */}
            {symbols.length >= 2 && (
                <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-white mb-4">Price Comparison</h2>
                    <TradingViewWidget
                        scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"
                        config={COMPARE_CHART_CONFIG(symbols)}
                        height={500}
                    />
                </div>
            )}

            {/* Individual Stock Charts */}
            {symbols.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {symbols.map((symbol, index) => (
                        <div key={symbol} className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: stockColors[index] }}
                                />
                                <h3 className="font-semibold text-white">{symbol}</h3>
                            </div>
                            <TradingViewWidget
                                scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js"
                                config={{
                                    symbol: symbol,
                                    width: '100%',
                                    height: 220,
                                    locale: 'en',
                                    dateRange: '12M',
                                    colorTheme: 'dark',
                                    isTransparent: true,
                                    autosize: false,
                                    chartOnly: false,
                                    noTimeScale: false,
                                }}
                                height={220}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {symbols.length < 2 && (
                <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-gray-800">
                    <ArrowLeftRight className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-400 mb-2">
                        {symbols.length === 0 ? 'No stocks selected' : 'Add at least 2 stocks'}
                    </h2>
                    <p className="text-gray-500">
                        {symbols.length === 0
                            ? 'Click "Add Stock to Compare" to start'
                            : 'Add one more stock to see the comparison chart'
                        }
                    </p>
                </div>
            )}
        </div>
    );
}
