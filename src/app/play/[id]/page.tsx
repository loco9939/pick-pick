'use client';

import React, { useEffect } from 'react';
import useGameLogic from '@/hooks/useGameLogic';
import GameCard from '@/components/game/GameCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock Data for now
const MOCK_CANDIDATES = [
    { id: '1', name: 'Candidate 1', image_url: 'https://placehold.co/600x400/png?text=1' },
    { id: '2', name: 'Candidate 2', image_url: 'https://placehold.co/600x400/png?text=2' },
    { id: '3', name: 'Candidate 3', image_url: 'https://placehold.co/600x400/png?text=3' },
    { id: '4', name: 'Candidate 4', image_url: 'https://placehold.co/600x400/png?text=4' },
    { id: '5', name: 'Candidate 5', image_url: 'https://placehold.co/600x400/png?text=5' },
    { id: '6', name: 'Candidate 6', image_url: 'https://placehold.co/600x400/png?text=6' },
    { id: '7', name: 'Candidate 7', image_url: 'https://placehold.co/600x400/png?text=7' },
    { id: '8', name: 'Candidate 8', image_url: 'https://placehold.co/600x400/png?text=8' },
];

export default function GamePlayPage({ params }: { params: { id: string } }) {
    const { gameState, getCurrentPair, selectWinner } = useGameLogic(MOCK_CANDIDATES);
    const router = useRouter();

    useEffect(() => {
        if (gameState.winner) {
            router.push(`/play/${params.id}/result?winnerId=${gameState.winner.id}`);
        }
    }, [gameState.winner, params.id, router]);

    if (gameState.winner) return null; // Redirecting...

    const [left, right] = getCurrentPair();

    if (!left || !right) return null;

    return (
        <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
            {/* Round Indicator */}
            <div className="absolute top-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-background/80 px-6 py-2 text-lg font-bold backdrop-blur shadow-sm border">
                {gameState.round} <span className="text-sm font-normal text-muted-foreground ml-2">({gameState.currentMatch} / {gameState.totalMatches})</span>
            </div>

            {/* VS Badge */}
            <div className="absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-background font-black text-2xl shadow-xl border-4 border-primary/20">
                VS
            </div>

            <div className="flex h-full w-full flex-col md:flex-row">
                <div className="relative h-1/2 w-full md:h-full md:w-1/2 p-2 md:p-4">
                    <GameCard candidate={left} onClick={() => selectWinner(left.id)} />
                </div>
                <div className="relative h-1/2 w-full md:h-full md:w-1/2 p-2 md:p-4">
                    <GameCard candidate={right} onClick={() => selectWinner(right.id)} />
                </div>
            </div>
        </div>
    );
}
