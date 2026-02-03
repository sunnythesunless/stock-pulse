import { getPortfolioHoldings, getTransactionHistory, deleteTransaction, getPortfolioStats } from '@/lib/actions/portfolio.actions';
import { exportPortfolioCSV, exportTransactionsCSV } from '@/lib/actions/export.actions';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { Briefcase, TrendingUp, Trash2, DollarSign, PieChart, History } from 'lucide-react';
import TransactionForm from '@/components/TransactionForm';
import ExportButton from '@/components/ExportButton';

async function handleDelete(formData: FormData) {
    'use server';
    const transactionId = formData.get('transactionId') as string;
    await deleteTransaction(transactionId);
    revalidatePath('/portfolio');
}

const PortfolioPage = async () => {
    const [holdings, transactions, stats] = await Promise.all([
        getPortfolioHoldings(),
        getTransactionHistory(),
        getPortfolioStats(),
    ]);

    return (
        <div className="min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">My Portfolio</h1>
                <div className="flex items-center gap-2">
                    {holdings.length > 0 && (
                        <ExportButton exportFn={exportPortfolioCSV} label="Export Holdings" />
                    )}
                    {transactions.length > 0 && (
                        <ExportButton exportFn={exportTransactionsCSV} label="Export Transactions" />
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-yellow-500" />
                        <span className="text-gray-400 text-sm">Total Invested</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                        ${stats.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <PieChart className="w-5 h-5 text-yellow-500" />
                        <span className="text-gray-400 text-sm">Holdings</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.holdingsCount} stocks</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <History className="w-5 h-5 text-yellow-500" />
                        <span className="text-gray-400 text-sm">Transactions</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{transactions.length} total</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Holdings */}
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-yellow-500" />
                        Holdings
                    </h2>

                    {holdings.length === 0 ? (
                        <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-gray-800">
                            <Briefcase className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-400 mb-2">No holdings yet</h3>
                            <p className="text-gray-500">Add your first transaction to start tracking</p>
                        </div>
                    ) : (
                        <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-[#0f0f0f]">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Stock</th>
                                        <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Qty</th>
                                        <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Avg Price</th>
                                        <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {holdings.map((holding) => (
                                        <tr key={holding.symbol} className="border-t border-gray-800 hover:bg-[#0f0f0f]/50">
                                            <td className="px-4 py-3">
                                                <Link href={`/stocks/${holding.symbol}`} className="hover:text-yellow-500">
                                                    <span className="font-semibold text-white">{holding.symbol}</span>
                                                    <span className="text-gray-500 text-sm block">{holding.company}</span>
                                                </Link>
                                            </td>
                                            <td className="text-right px-4 py-3 text-white">{holding.quantity}</td>
                                            <td className="text-right px-4 py-3 text-white">${holding.avgPrice.toFixed(2)}</td>
                                            <td className="text-right px-4 py-3 text-white font-semibold">
                                                ${holding.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Recent Transactions */}
                    {transactions.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <History className="w-5 h-5 text-yellow-500" />
                                Recent Transactions
                            </h2>
                            <div className="grid gap-2">
                                {transactions.slice(0, 10).map((t) => (
                                    <div key={t.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'
                                                }`}>
                                                <TrendingUp className={`w-4 h-4 ${t.type === 'buy' ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
                                            </div>
                                            <div>
                                                <span className="text-white font-medium">{t.type === 'buy' ? 'Bought' : 'Sold'} {t.quantity} {t.symbol}</span>
                                                <span className="text-gray-500 text-sm block">@ ${t.price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`font-semibold ${t.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                                                ${(t.quantity * t.price).toFixed(2)}
                                            </span>
                                            <form action={handleDelete}>
                                                <input type="hidden" name="transactionId" value={t.id} />
                                                <button type="submit" className="p-1 text-gray-500 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Transaction Form */}
                <div>
                    <TransactionForm />
                </div>
            </div>
        </div>
    );
};

export default PortfolioPage;
