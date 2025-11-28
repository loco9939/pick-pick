'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { Plus } from 'lucide-react';

const EmptyState = () => {
    const router = useRouter();
    const { user } = useUser();

    const handleCreateClick = () => {
        if (!user) {
            alert('Login required. Please login first.');
            router.push('/auth/login');
            return;
        }
        router.push('/create');
    };

    return (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <h3 className="mb-2 text-xl font-bold text-white">
                No WorldCups Found
            </h3>
            <p className="max-w-sm text-slate-400">
                There are no WorldCups in this category yet.
            </p>
            <p className="mb-8 max-w-sm text-slate-400">
                Be the first to create one!
            </p>
            <button
                onClick={handleCreateClick}
                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(192,38,211,0.5)] active:scale-95"
            >
                <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                Create WorldCup
            </button>
        </div>
    );
};

export default EmptyState;
