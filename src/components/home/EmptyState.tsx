'use client';

import React from 'react';
import { useRouter } from '@/navigation';
import { useUser } from '@/context/UserContext';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useGlobalAlert } from '@/components/common/GlobalAlertProvider';

const EmptyState = () => {
    const router = useRouter();
    const { user } = useUser();
    const t = useTranslations();
    const { showAlert } = useGlobalAlert();

    const handleCreateClick = async () => {
        if (!user) {
            await showAlert(t('로그인이 필요합니다 먼저 로그인해주세요'));
            router.push('/auth/login');
            return;
        }
        router.push('/create');
    };

    return (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <h3 className="mb-2 text-xl font-bold text-white">
                {t('월드컵을 찾을 수 없습니다')}
            </h3>
            <p className="max-w-sm text-slate-400">
                {t('이 카테고리에는 아직 월드컵이 없습니다')}
            </p>
            <p className="mb-8 max-w-sm text-slate-400">
                {t('가장 먼저 만들어보세요!')}
            </p>
            <button
                onClick={handleCreateClick}
                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(192,38,211,0.5)] active:scale-95"
            >
                <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                {t('월드컵 만들기')}
            </button>
        </div>
    );
};

export default EmptyState;
