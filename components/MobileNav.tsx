'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import SearchCommand from '@/components/SearchCommand';

interface MobileNavProps {
    initialStocks: StockWithWatchlistStatus[];
}

const MobileNav = ({ initialStocks }: MobileNavProps) => {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
                    <Menu className="h-6 w-6" />
                </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-[#0a0a0a] border-l border-gray-800 p-0">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                        <span className="text-lg font-semibold text-white">Menu</span>
                        <SheetClose asChild>
                            <button className="p-2 text-gray-400 hover:text-white transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </SheetClose>
                    </div>

                    {/* Navigation - only close sheet on link clicks, not search */}
                    <nav className="flex-1 p-4">
                        <ul className="flex flex-col gap-4 font-medium">
                            {NAV_ITEMS.map(({ href, label }) => {
                                if (href === '/search') {
                                    return (
                                        <li key="search-trigger">
                                            <SearchCommand
                                                renderAs="text"
                                                label="Search"
                                                initialStocks={initialStocks}
                                            />
                                        </li>
                                    );
                                }

                                return (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            onClick={() => setOpen(false)}
                                            className={`block py-2 hover:text-yellow-500 transition-colors ${isActive(href) ? 'text-yellow-500' : 'text-gray-300'
                                                }`}
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default MobileNav;
