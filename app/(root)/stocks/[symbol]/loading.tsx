export default function StockDetailsLoading() {
    return (
        <div className="flex min-h-screen p-4 md:p-6 lg:p-8 animate-pulse">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* Left column */}
                <div className="flex flex-col gap-6">
                    <div className="h-[170px] bg-gray-800 rounded-lg" />
                    <div className="h-[600px] bg-gray-800 rounded-lg" />
                    <div className="h-[600px] bg-gray-800 rounded-lg" />
                </div>
                {/* Right column */}
                <div className="flex flex-col gap-6">
                    <div className="h-10 w-48 bg-gray-800 rounded-lg" />
                    <div className="h-[400px] bg-gray-800 rounded-lg" />
                    <div className="h-[440px] bg-gray-800 rounded-lg" />
                    <div className="h-[464px] bg-gray-800 rounded-lg" />
                </div>
            </section>
        </div>
    );
}
