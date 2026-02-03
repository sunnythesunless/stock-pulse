export default function WatchlistLoading() {
    return (
        <div className="min-h-screen animate-pulse">
            <div className="flex items-center justify-between mb-8">
                <div className="h-9 w-48 bg-gray-800 rounded-lg" />
                <div className="h-6 w-20 bg-gray-800 rounded-lg" />
            </div>
            <div className="grid gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-800" />
                            <div>
                                <div className="h-5 w-24 bg-gray-800 rounded mb-2" />
                                <div className="h-4 w-32 bg-gray-800 rounded" />
                            </div>
                        </div>
                        <div className="h-4 w-28 bg-gray-800 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
