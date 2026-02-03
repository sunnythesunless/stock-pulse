export default function ProfileLoading() {
    return (
        <div className="min-h-screen max-w-3xl mx-auto animate-pulse">
            <div className="h-9 w-36 bg-gray-800 rounded-lg mb-8" />
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-800" />
                    <div>
                        <div className="h-6 w-32 bg-gray-800 rounded mb-2" />
                        <div className="h-4 w-48 bg-gray-800 rounded" />
                    </div>
                </div>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
                <div className="h-6 w-48 bg-gray-800 rounded mb-6" />
                <div className="grid gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 bg-gray-800 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}
