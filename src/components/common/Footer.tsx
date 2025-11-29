'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Footer() {
    const pathname = usePathname();

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
                    © 2025 PickPick. All rights reserved.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Link href="mailto:hifiju5047@gmail.com" className="hover:text-primary transition-colors">
                        Contact: hifiju5047@gmail.com
                    </Link>
                </div>
            </div>
        </footer>
    );
}
