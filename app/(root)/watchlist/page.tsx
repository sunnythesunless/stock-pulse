import { getUserWatchlist, removeFromWatchlist } from '@/lib/actions/watchlist.actions';
import { exportWatchlistCSV } from '@/lib/actions/export.actions';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { Trash2, TrendingUp } from 'lucide-react';
import ExportButton from '@/components/ExportButton';

async function handleRemove(formData: FormData) {
    'use server';
    const symbol = formData.get('symbol') as string;
    await removeFromWatchlist(symbol);
    revalidatePath('/watchlist');
}

const WatchlistPage = async () => {
    const watchlist = await getUserWatchlist();

    return (
        <div className="min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
                <div className="flex items-center gap-4">
                    {watchlist.length > 0 && (
                        <ExportButton exportFn={exportWatchlistCSV} label="Export" />
                    )}
                    <span className="text-gray-400">{watchlist.length} stocks</span>
                </div>
            </div>

            {watchlist.length === 0 ? (
                <div className="text-center py-20">
                    <TrendingUp className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-400 mb-2">Your watchlist is empty</h2>
                    <p className="text-gray-500 mb-6">Search for stocks and add them to your watchlist to track them here.</p>
                    <Link href="/" className="inline-block px-6 py-3 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors">
                        Explore Stocks
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {watchlist.map((item) => (
                        <div key={item.symbol} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                            <Link href={`/stocks/${item.symbol}`} className="flex-1">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                        <span className="text-yellow-500 font-bold text-lg">{item.symbol[0]}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white hover:text-yellow-500 transition-colors">{item.symbol}</h3>
                                        <p className="text-gray-400 text-sm">{item.company}</p>
                                    </div>
                                </div>
                            </Link>
                            <div className="flex items-center gap-4">
                                <span className="text-gray-500 text-sm">
                                    Added {new Date(item.addedAt).toLocaleDateString()}
                                </span>
                                <form action={handleRemove}>
                                    <input type="hidden" name="symbol" value={item.symbol} />
                                    <button
                                        type="submit"
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Remove from watchlist"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WatchlistPage;
