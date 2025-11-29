'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase/client';
import WorldCupCard from '@/components/worldcup/WorldCupCard';
import { Database } from '@/lib/supabase/database.types';
import Loading from '@/components/common/Loading';
import { Edit, Trash2, Play } from 'lucide-react';
import CategoryChips from '@/components/home/CategoryChips';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/home/EmptyState';
import { Link, useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';

type WorldCup = Database['public']['Tables']['worldcups']['Row'];

const ITEMS_PER_PAGE = 12;

interface WorldCupListProps {
    mode: 'home' | 'my';
    userId?: string; // Required if mode is 'my'
    baseUrl: string;
}

import { useGlobalAlert } from '@/components/common/GlobalAlertProvider';
import { useUser } from '@/context/UserContext';

export default function WorldCupList({ mode, userId, baseUrl }: WorldCupListProps) {
    const t = useTranslations();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showAlert, showConfirm } = useGlobalAlert();
    const [worldcups, setWorldcups] = useState<WorldCup[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);

    const category = searchParams.get('category') || 'all';
    const page = Number(searchParams.get('page')) || 1;

    useEffect(() => {
        const fetchData = async () => {
            setIsDataLoading(true);

            let query = supabase
                .from('worldcups')
                .select('*', { count: 'exact' })
                .eq('is_deleted', false);

            // Mode specific logic
            if (mode === 'my') {
                if (!userId) return;
                query = query.eq('owner_id', userId).order('created_at', { ascending: false });
            } else {
                // Home mode
                query = query.order('total_plays', { ascending: false });
            }

            // Category filter
            if (category && category !== 'all') {
                query = query.eq('category', category);
            }

            // Pagination
            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data: wcData, count, error: wcError } = await query.range(from, to);

            if (wcError) {
                console.error('Error fetching worldcups:', wcError);
            } else {
                setWorldcups(wcData || []);
                setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
            }

            setIsDataLoading(false);
        };

        fetchData();
    }, [mode, userId, category, page]);

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm(t('이 월드컵을 삭제하시겠습니까?'));
        if (!confirmed) return;

        const { error: wcError } = await supabase
            .from('worldcups')
            .update({ is_deleted: true })
            .eq('id', id);

        if (wcError) {
            console.error('Error deleting worldcup:', wcError);
            await showAlert(t('월드컵 삭제 실패'));
        } else {
            setWorldcups((prev) => prev.filter((wc) => wc.id !== id));
        }
    };

    const { user } = useUser();

    const handleCreateClick = async () => {
        if (!user) {
            await showAlert(t('로그인이 필요합니다 먼저 로그인해주세요'));
            router.push('/auth/login');
            return;
        }
        router.push('/create');
    };

    return (
        <div>
            <CategoryChips baseUrl={baseUrl} />

            {isDataLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loading fullScreen={false} />
                </div>
            ) : worldcups.length === 0 ? (
                mode === 'my' ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/10">
                        <p className="text-muted-foreground mb-4">
                            {category === 'all'
                                ? t('아직 생성한 월드컵이 없습니다')
                                : t('이 카테고리에는 월드컵이 없습니다')}
                        </p>
                        <button
                            onClick={handleCreateClick}
                            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                        >
                            {t('월드컵 만들기')}
                        </button>
                    </div>
                ) : (
                    <EmptyState />
                )
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {worldcups.map((wc) => (
                            <WorldCupCard
                                key={wc.id}
                                id={wc.id}
                                title={wc.title}
                                description={wc.description || ''}
                                thumbnailUrl={wc.thumbnail_url || ''}
                                totalPlays={wc.total_plays}
                                candidateCount={wc.candidate_count || 0}
                                actions={
                                    mode === 'my' ? (
                                        <div className="flex justify-between">
                                            <Link
                                                href={`/play/${wc.id}/result`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                                {t('랭킹 보기')}
                                            </Link>
                                            <div className='flex gap-2'>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        router.push(`/edit/${wc.id}`);
                                                    }}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 bg-slate-800/50 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDelete(wc.id);
                                                    }}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 bg-slate-800/50 text-slate-400 transition-colors hover:border-red-900/50 hover:bg-red-900/20 hover:text-red-400"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 mt-auto">
                                            <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary/10 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors">
                                                <Play size={16} />
                                                {t('시작하기')}
                                            </button>
                                            <Link
                                                href={`/play/${wc.id}/result`}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                                {t('랭킹 보기')}
                                            </Link>
                                        </div>
                                    )
                                }
                            />
                        ))}
                    </div>
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        baseUrl={baseUrl}
                        searchParams={Object.fromEntries(searchParams.entries())}
                    />
                </>
            )}
        </div>
    );
}
