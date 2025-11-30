'use client';

import React from 'react';
import { Link, useRouter } from '@/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';

import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

import { useGlobalAlert } from '@/components/common/GlobalAlertProvider';
import { Menu, Trophy, User, LogOut, LogIn } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

const Header: React.FC = () => {
    const router = useRouter();
    const { user, isLoading } = useUser();
    const t = useTranslations();
    const { showAlert, showConfirm } = useGlobalAlert();

    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const closeMenu = () => setIsMenuOpen(false);

    const handleLogout = async () => {
        const confirmed = await showConfirm(t('로그아웃 하시겠습니까?'));
        if (!confirmed) return;
        await supabase.auth.signOut();
        router.replace('/');
        closeMenu();
    };

    const handleCreateClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) {
            await showAlert(t('로그인이 필요합니다 먼저 로그인해주세요'));
            router.push('/auth/login');
            closeMenu();
            return;
        }
        router.push('/create');
        closeMenu();
    };

    const handleLinkClick = () => {
        closeMenu();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 justify-between">
                <div className="flex items-center">
                    <Link href="/" className="mr-6 flex items-center space-x-2" onClick={handleLinkClick}>
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

                {/* Desktop Navigation */}
                <div className="hidden md:flex flex-1 items-center justify-end space-x-2">
                    <LanguageSwitcher />
                    <nav className="flex items-center space-x-4">
                        <button
                            onClick={handleCreateClick}
                            className="text-sm font-medium text-slate-300 transition-all duration-300 hover:text-fuchsia-400 hover:drop-shadow-[0_0_8px_rgba(232,121,249,0.5)] hover:scale-105"
                        >
                            {t('월드컵 만들기')}
                        </button>
                        {isLoading ? (
                            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                        ) : user ? (
                            <>
                                <Link
                                    href="/my"
                                    className="text-sm font-medium text-slate-300 transition-all duration-300 hover:text-fuchsia-400 hover:drop-shadow-[0_0_8px_rgba(232,121,249,0.5)] hover:scale-105"
                                >
                                    {t('마이페이지')}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium text-slate-300 transition-all duration-300 hover:text-fuchsia-400 hover:drop-shadow-[0_0_8px_rgba(232,121,249,0.5)] hover:scale-105"
                                >
                                    {t('로그아웃')}
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="text-sm font-medium text-slate-300 transition-all duration-300 hover:text-fuchsia-400 hover:drop-shadow-[0_0_8px_rgba(232,121,249,0.5)] hover:scale-105"
                            >
                                {t('로그인')}
                            </Link>
                        )}
                    </nav>
                </div>

                {/* Mobile Hamburger Button with Shadcn Sheet */}
                <div className="flex md:hidden items-center">
                    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <div className="flex justify-end">
                            <LanguageSwitcher />
                        </div>
                        <SheetTrigger asChild>
                            <button
                                className="p-2 text-slate-300 hover:text-fuchsia-400 transition-colors"
                                aria-label="Toggle menu"
                            >
                                <Menu size={24} />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle>{t('메뉴')}</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col">
                                <nav className="flex flex-col space-y-2 mt-2">
                                    <button
                                        onClick={handleCreateClick}
                                        className="flex items-center space-x-3 w-full p-3 rounded-md text-slate-300 hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        <Trophy size={20} />
                                        <span className="font-medium">{t('월드컵 만들기')}</span>
                                    </button>
                                    {isLoading ? (
                                        <div className="h-10 w-full animate-pulse rounded bg-muted" />
                                    ) : user ? (
                                        <>
                                            <Link
                                                href="/my"
                                                onClick={handleLinkClick}
                                                className="flex items-center space-x-3 w-full p-3 rounded-md text-slate-300 hover:bg-accent hover:text-accent-foreground transition-colors"
                                            >
                                                <User size={20} />
                                                <span className="font-medium">{t('마이페이지')}</span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-3 w-full p-3 rounded-md text-slate-300 hover:bg-accent hover:text-accent-foreground transition-colors"
                                            >
                                                <LogOut size={20} />
                                                <span className="font-medium">{t('로그아웃')}</span>
                                            </button>
                                        </>
                                    ) : (
                                        <Link
                                            href="/auth/login"
                                            onClick={handleLinkClick}
                                            className="flex items-center space-x-3 w-full p-3 rounded-md text-slate-300 hover:bg-accent hover:text-accent-foreground transition-colors"
                                        >
                                            <LogIn size={20} />
                                            <span className="font-medium">{t('로그인')}</span>
                                        </Link>
                                    )}
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};

export default Header;
