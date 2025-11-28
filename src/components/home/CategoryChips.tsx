'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/constants/categories';



export default function CategoryChips() {
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
        router.push(`/?${params.toString()}`);
    };

    return (
        <div className="mb-8 w-full overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex space-x-3 px-1">
                {CATEGORIES.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => handleSelect(category.id)}
                        className={`
                            whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200
                            ${selected === category.id
                                ? 'border-2 border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.3)]'
                                : 'border border-input bg-background text-muted-foreground hover:border-fuchsia-500/50 hover:text-foreground'
                            }
                        `}
                    >
                        {category.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
