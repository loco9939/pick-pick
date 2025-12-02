'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import CategoryChips from './CategoryChips';

export default function HomeSearchSection() {
    const t = useTranslations();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm.trim()) {
            params.set('q', searchTerm.trim());
        } else {
            params.delete('q');
        }
        // Reset page when searching
        params.delete('page');
        router.push(`/?${params.toString()}`);
    };

    return (
        <div className="flex flex-col items-center justify-center text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white">
                {t.rich('모든 것에서 당신의 이상형을 찾아보세요', {
                    highlight: (chunks) => <span className="text-fuchsia-500">{chunks}</span>,
                    br: () => <br />
                })}
            </h1>

            <div className="flex flex-col space-y-2">
                <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl">
                    {t('K-Pop 스타부터 야식 메뉴까지')}
                </p>
                <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl">
                    {t('나만의 토너먼트를 만들거나 수천 개의 커뮤니티 월드컵을 즐겨보세요')}
                </p>
            </div>

            <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('월드컵 검색')}
                        className="w-full h-14 pl-12 pr-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-lg transition-all hover:shadow-md"
                    />
                </div>
            </form>

            <div className="w-full max-w-4xl pt-8">
                <CategoryChips baseUrl="/" />
            </div>
        </div>
    );
}
