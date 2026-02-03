import { getUserAlerts, deleteAlert, AlertData } from '@/lib/actions/alert.actions';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { Bell, Trash2, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import AlertForm from '@/components/AlertForm';

async function handleDelete(formData: FormData) {
    'use server';
    const alertId = formData.get('alertId') as string;
    await deleteAlert(alertId);
    revalidatePath('/alerts');
}

const AlertsPage = async () => {
    const alerts = await getUserAlerts();
    const activeAlerts = alerts.filter(a => !a.triggered);
    const triggeredAlerts = alerts.filter(a => a.triggered);

    return (
        <div className="min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Price Alerts</h1>
                <span className="text-gray-400">{activeAlerts.length} active</span>
            </div>

            {/* Create Alert Info */}
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Bell className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-lg font-semibold text-white">How to Create Alerts</h2>
                </div>
                <p className="text-gray-400 mb-4">
                    Go to any stock's detail page and use the alert form to set up price notifications.
                    You'll receive an email when the stock price crosses your target.
                </p>
                <Link
                    href="/"
                    className="inline-block px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                >
                    Browse Stocks
                </Link>
            </div>

            {/* Active Alerts */}
            {activeAlerts.length === 0 ? (
                <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-gray-800">
                    <Bell className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-400 mb-2">No active alerts</h2>
                    <p className="text-gray-500">Create alerts from stock details pages to get notified</p>
                </div>
            ) : (
                <div className="grid gap-4 mb-8">
                    <h2 className="text-lg font-semibold text-white">Active Alerts</h2>
                    {activeAlerts.map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-gray-800">
                            <Link href={`/stocks/${alert.symbol}`} className="flex-1">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alert.alertType === 'upper' ? 'bg-green-500/20' : 'bg-red-500/20'
                                        }`}>
                                        {alert.alertType === 'upper' ? (
                                            <TrendingUp className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <TrendingDown className="w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{alert.symbol}</h3>
                                        <p className="text-sm text-gray-400">
                                            {alert.alertType === 'upper' ? 'Above' : 'Below'} ${alert.targetPrice.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                            <div className="flex items-center gap-4">
                                <span className="text-gray-500 text-sm">
                                    {new Date(alert.createdAt).toLocaleDateString()}
                                </span>
                                <form action={handleDelete}>
                                    <input type="hidden" name="alertId" value={alert.id} />
                                    <button
                                        type="submit"
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Delete alert"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Triggered Alerts History */}
            {triggeredAlerts.length > 0 && (
                <div className="grid gap-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Triggered Alerts
                    </h2>
                    {triggeredAlerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-4 bg-[#1a1a1a]/50 rounded-lg border border-gray-800/50 opacity-60">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{alert.symbol}</h3>
                                    <p className="text-sm text-gray-500">
                                        Triggered ${alert.targetPrice.toFixed(2)} on {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <form action={handleDelete}>
                                <input type="hidden" name="alertId" value={alert.id} />
                                <button
                                    type="submit"
                                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                    title="Remove"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AlertsPage;
