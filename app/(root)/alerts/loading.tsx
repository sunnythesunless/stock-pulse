export default function AlertsLoading() {
    return (
        <div className="min-h-screen animate-pulse">
            <div className="flex items-center justify-between mb-8">
                <div className="h-9 w-40 bg-gray-800 rounded-lg" />
                <div className="h-6 w-20 bg-gray-800 rounded-lg" />
            </div>
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6 mb-8">
                <div className="h-6 w-48 bg-gray-800 rounded mb-4" />
                <div className="h-4 w-full bg-gray-800 rounded mb-2" />
                <div className="h-4 w-3/4 bg-gray-800 rounded mb-4" />
                <div className="h-10 w-32 bg-gray-800 rounded" />
            </div>
            <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-[#1a1a1a] rounded-lg border border-gray-800" />
                ))}
            </div>
        </div>
    );
}
