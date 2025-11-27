import React from 'react';
import Link from 'next/link';
import WorldCupThumbnail from './WorldCupThumbnail';

interface WorldCupCardProps {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    totalPlays?: number;
    actions?: React.ReactNode;
}

const WorldCupCard: React.FC<WorldCupCardProps> = ({ id, title, description, thumbnailUrl, totalPlays, actions }) => {
    return (
        <div className="group relative block overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 text-slate-300 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1">
            <Link href={`/play/${id}/intro`} className="block">
                <div className="relative aspect-video overflow-hidden bg-slate-800">
                    <WorldCupThumbnail title={title} thumbnailUrl={thumbnailUrl} />
                    {/* Live/Plays Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm border border-white/10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        {totalPlays ? totalPlays.toLocaleString() : 0} Plays
                    </div>
                </div>
                <div className="p-4">
                    <h3 className="text-lg font-bold leading-tight text-white group-hover:text-primary transition-colors line-clamp-1">{title}</h3>
                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">{description}</p>
                </div>
            </Link>
            {actions && <div className="border-t border-slate-800 p-4 bg-slate-900/30">{actions}</div>}
        </div>
    );
};

export default WorldCupCard;
