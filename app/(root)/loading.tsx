export default function DashboardLoading() {
    return (
        <div className="flex min-h-screen home-wrapper animate-pulse">
            <section className="grid w-full gap-8 home-section">
                <div className="md:col-span-1 xl:col-span-1">
                    <div className="h-[600px] bg-gray-800 rounded-lg" />
                </div>
                <div className="md-col-span xl:col-span-2">
                    <div className="h-[600px] bg-gray-800 rounded-lg" />
                </div>
            </section>
            <section className="grid w-full gap-8 home-section mt-8">
                <div className="h-full md:col-span-1 xl:col-span-1">
                    <div className="h-[600px] bg-gray-800 rounded-lg" />
                </div>
                <div className="h-full md:col-span-1 xl:col-span-2">
                    <div className="h-[600px] bg-gray-800 rounded-lg" />
                </div>
            </section>
        </div>
    );
}
