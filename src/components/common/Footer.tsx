'use client';

import React from 'react';
import { Link, usePathname } from '@/navigation';
import { useTranslations } from 'next-intl';

export default function Footer() {
    const pathname = usePathname();
    const t = useTranslations();

    // Hide footer ONLY on the game page (e.g., /play/123) to prevent scrolling during gameplay
    // Show on /play/123/intro, /play/123/result, etc.
    const isGamePage = /^\/play\/[^/]+$/.test(pathname || '');

    if (isGamePage) {
        return null;
    }

    return (
        <footer className="w-full border-t border-border/40 bg-background/95 py-6">
            <div className="container mx-auto flex flex-col items-center justify-center gap-2 px-4 text-center md:flex-row md:justify-between md:text-left">
                <p className="text-sm text-muted-foreground">
                    {t('copyright')}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Link href="mailto:hifiju5047@gmail.com" className="hover:text-primary transition-colors">
                        {t('contact')}: hifiju5047@gmail.com
                    </Link>
                </div>
            </div>
        </footer>
    );
}
