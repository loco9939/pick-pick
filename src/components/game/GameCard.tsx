import React from 'react';
import Image from 'next/image';
import { Candidate } from '@/hooks/useGameLogic';

interface GameCardProps {
    candidate: Candidate;
    onClick: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ candidate, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
            <div className="relative flex-1 w-full overflow-hidden">
                <Image
                    src={candidate.image_url}
                    alt={candidate.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <div className="relative z-10 flex h-16 w-full items-center justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
                <h3 className="text-lg font-semibold tracking-tight">{candidate.name}</h3>
            </div>
        </button>
    );
};

export default GameCard;
