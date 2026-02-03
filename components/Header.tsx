import Link from "next/link";
import Image from "next/image";
import NavItems from "@/components/NavItems";
import UserDropdown from "@/components/UserDropdown";
import MobileNav from "@/components/MobileNav";
import { searchStocks } from "@/lib/actions/finnhub.actions";

const Header = async ({ user }: { user: User }) => {
    const initialStocks = await searchStocks();

    return (
        <header className="sticky top-0 header">
            <div className="container header-wrapper">
                <Link href="/">
                    <Image src="/assets/icons/logo.svg" alt="StockPulse logo" width={140} height={32} className="h-8 w-auto cursor-pointer" style={{ width: 'auto' }} />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:block">
                    <NavItems initialStocks={initialStocks} />
                </nav>

                <div className="flex items-center gap-3">
                    <UserDropdown user={user} initialStocks={initialStocks} />
                    {/* Mobile Menu */}
                    <MobileNav initialStocks={initialStocks} />
                </div>
            </div>
        </header>
    )
}
export default Header
