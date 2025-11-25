import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="font-bold sm:inline-block">PickPick</span>
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <nav className="flex items-center">
                        <Link
                            href="/auth/login"
                            className="text-sm font-medium transition-colors hover:text-primary"
                        >
                            Login
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
