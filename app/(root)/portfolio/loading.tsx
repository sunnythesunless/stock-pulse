export default function PortfolioLoading() {
    return (
        <div className="min-h-screen animate-pulse">
            <div className="h-9 w-40 bg-gray-800 rounded-lg mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
                        <div className="h-4 w-24 bg-gray-800 rounded mb-2" />
                        <div className="h-8 w-32 bg-gray-800 rounded" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="h-6 w-24 bg-gray-800 rounded mb-4" />
                    <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 h-64" />
                </div>
                <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 h-96" />
            </div>
        </div>
    );
}
