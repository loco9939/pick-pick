'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/constants/categories';



interface CategoryChipsProps {
    baseUrl?: string;
}

export default function CategoryChips({ baseUrl = '/' }: CategoryChipsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selected = searchParams.get('category') || 'all';

    const handleSelect = (id: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (id === 'all') {
            params.delete('category');
        } else {
            params.set('category', id);
        }
        // Reset page when category changes
        params.delete('page');
        router.push(`${baseUrl}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="mb-8 w-full">
            <div className="flex flex-wrap gap-3 justify-center px-1">
                {CATEGORIES.map((category) => {
                    const isSelected = selected === category.id;
                    return (
                        <button
                            key={category.id}
                            onClick={() => handleSelect(category.id)}
                            className={`
                                relative overflow-hidden rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300
                                ${isSelected
                                    ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-white border border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.15)] backdrop-blur-md'
                                    : 'bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-800/60 hover:text-slate-200 hover:border-slate-600 backdrop-blur-sm'
                                }
                            `}
                        >
                            {/* Glass reflection effect */}
                            <div className={`absolute inset-0 -z-10 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'group-hover:opacity-100'}`} />

                            {category.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
