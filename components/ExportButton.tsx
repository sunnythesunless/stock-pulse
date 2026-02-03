'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonProps {
    exportFn: () => Promise<{ data: string; filename: string } | null>;
    label?: string;
}

export default function ExportButton({ exportFn, label = 'Export CSV' }: ExportButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const result = await exportFn();

            if (!result) {
                toast.error('No data to export');
                return;
            }

            // Create blob and download
            const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = result.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Downloaded successfully!');
        } catch (err) {
            toast.error('Failed to export');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
        >
            <Download className="w-4 h-4" />
            {isLoading ? 'Exporting...' : label}
        </button>
    );
}
