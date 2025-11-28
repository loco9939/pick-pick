'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

const Header: React.FC = () => {
    const router = useRouter();
    const { user, isLoading } = useUser();

    const handleLogout = async () => {
        if (!window.confirm('Are you sure you want to log out?')) return;
        await supabase.auth.signOut();
        router.replace('/');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <Image
                            src="/pick-pick(192x58).png"
                            alt="PickPick Logo"
                            width={120}
                            height={36}
                            priority
                            className="h-9 w-auto"
                        />
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 justify-end">
                    <nav className="flex items-center space-x-4">
                        {isLoading ? (
                            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                        ) : user ? (
                            <>
                                <Link
                                    href="/create"
                                    className="text-sm font-medium text-slate-300 transition-all duration-300 hover:text-fuchsia-400 hover:drop-shadow-[0_0_8px_rgba(232,121,249,0.5)] hover:scale-105"
                                >
                                    Create Worldcup
                                </Link>
                                <Link
                                    href="/my"
                                    className="text-sm font-medium text-slate-300 transition-all duration-300 hover:text-fuchsia-400 hover:drop-shadow-[0_0_8px_rgba(232,121,249,0.5)] hover:scale-105"
                                >
                                    My Page
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium text-slate-300 transition-all duration-300 hover:text-fuchsia-400 hover:drop-shadow-[0_0_8px_rgba(232,121,249,0.5)] hover:scale-105"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="text-sm font-medium text-slate-300 transition-all duration-300 hover:text-fuchsia-400 hover:drop-shadow-[0_0_8px_rgba(232,121,249,0.5)] hover:scale-105"
                            >
                                Sign In
                            </Link>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
