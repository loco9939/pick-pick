import React from 'react';
import Link from 'next/link';
import WorldCupThumbnail from './WorldCupThumbnail';

interface WorldCupCardProps {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    totalPlays?: number;
    candidateCount?: number;
    actions?: React.ReactNode;
}

const WorldCupCard: React.FC<WorldCupCardProps> = ({ id, title, description, thumbnailUrl, totalPlays, candidateCount = 0, actions }) => {
    return (
        <div className="group relative block overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 text-slate-300 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:border-primary/50">
            <Link href={`/play/${id}/intro`} className="block">
                <div className="relative aspect-video overflow-hidden bg-slate-800">
                    <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
                        <WorldCupThumbnail title={title} thumbnailUrl={thumbnailUrl} />
                    </div>

                    {/* Live/Plays Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm border border-white/10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        {totalPlays ? totalPlays.toLocaleString() : 0} Plays
                    </div>

                    {/* Best Ribbon (Mock logic: > 100 plays) */}
                    {(totalPlays || 0) > 100 && (
                        <div className="absolute top-3 -right-8 w-32 rotate-45 bg-yellow-500 py-0.5 text-center text-[10px] font-bold text-black shadow-sm">
                            BEST
                        </div>
                    )}
                </div>
                <div className="p-4 pb-0">
                    <div className="flex items-start justify-between mb-2 gap-2">
                        <h3 className="text-lg font-extrabold leading-tight text-white group-hover:text-primary line-clamp-2 min-h-[3rem] transition-colors">{title}</h3>
                        <span className="text-sm text-slate-400 whitespace-nowrap">{candidateCount} 강</span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem] mb-4">{description}</p>
                </div>
            </Link>
            <div className="px-4 pb-4">
                {/* Action Buttons */}
                {actions}
            </div>
        </div>
    );
};

export default WorldCupCard;
