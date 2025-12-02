import React from 'react';
import { Link } from '@/navigation';
import WorldCupThumbnail from './WorldCupThumbnail';
import { useTranslations } from 'next-intl';

interface WorldCupCardProps {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    totalPlays?: number;
    candidateCount?: number;
    actions?: React.ReactNode;
    isPublic?: boolean;
    visibility?: 'public' | 'private';
    status?: 'draft' | 'published';
    author?: string;
    hasDraftData?: boolean;
}

export default function WorldCupCard({ id, title, description, thumbnailUrl, totalPlays, candidateCount = 0, actions, isPublic = true, visibility, status = 'published', author, hasDraftData = false }: WorldCupCardProps) {
    const t = useTranslations();
    return (
        <div className="group relative block overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 text-slate-300 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:border-primary/50">
            {/* Draft(임시저장)된 요소는 클릭이 불가능 -> 수정: 마이페이지에서는 가능해야 함 */}
            {isPublic || visibility === 'private' || status === 'draft' ? (
                <Link href={`/play/${id}/intro`} className="block">
                    <CardContent
                        title={title}
                        thumbnailUrl={thumbnailUrl}
                        totalPlays={totalPlays}
                        candidateCount={candidateCount}
                        isPublic={isPublic}
                        visibility={visibility}
                        status={status}
                        description={description}
                        author={author}
                        hasDraftData={hasDraftData}
                        t={t}
                    />
                </Link>
            ) : (
                <div className="block cursor-default">
                    <CardContent
                        title={title}
                        thumbnailUrl={thumbnailUrl}
                        totalPlays={totalPlays}
                        candidateCount={candidateCount}
                        isPublic={isPublic}
                        visibility={visibility}
                        status={status}
                        description={description}
                        author={author}
                        hasDraftData={hasDraftData}
                        t={t}
                    />
                </div>
            )}
            <div className="px-4 pb-4">
                {/* Action Buttons */}
                {actions}
            </div>
        </div>
    );
};

const CardContent = ({ title, thumbnailUrl, totalPlays, candidateCount, isPublic, description, author, visibility, status, hasDraftData, t }: any) => (
    <>
        <div className="relative aspect-video overflow-hidden bg-slate-800">
            <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
                <WorldCupThumbnail title={title} thumbnailUrl={thumbnailUrl} />
            </div>

            {/* Live/Plays Badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm border border-white/10">
                <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPublic ? 'bg-red-400' : 'bg-gray-400'} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isPublic ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                </span>
                {totalPlays ? totalPlays.toLocaleString() : 0} {t('플레이 횟수')}
            </div>

            {/* Visibility Badges */}
            <div className="absolute top-2 right-2 flex gap-1">
                {(status === 'draft' || hasDraftData) && (
                    <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-500 backdrop-blur-sm border border-yellow-500/30">
                        {t('작성중')}
                    </span>
                )}
                {visibility === 'private' && (
                    <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-xs font-medium text-slate-400 backdrop-blur-sm border border-slate-700">
                        {t('비공개')}
                    </span>
                )}
            </div>

            {/* Best Ribbon (Mock logic: > 100 plays) */}
            {isPublic && (totalPlays || 0) > 100 && (
                <div className="absolute top-3 -right-8 w-32 rotate-45 bg-yellow-500 py-0.5 text-center text-[10px] font-bold text-black shadow-sm">
                    {t('베스트')}
                </div>
            )}
        </div>
        <div className="p-4 pb-0">
            <div className="flex items-start justify-between mb-2 gap-2">
                <h3 className="text-lg font-extrabold leading-tight text-white group-hover:text-primary line-clamp-2 min-h-[3rem] transition-colors">{title}</h3>
                <span className="text-sm text-slate-400 whitespace-nowrap">{t('강', { count: candidateCount })}</span>
            </div>
            <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem] mb-4">{description}</p>
            {author && (
                <p className="text-xs text-slate-500 text-right mb-2">
                    by. {author}
                </p>
            )}
        </div>
    </>
);


