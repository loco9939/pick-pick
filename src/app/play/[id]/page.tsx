'use client';

import React, { useEffect, useState } from 'react';
import useGameLogic, { Candidate } from '@/hooks/useGameLogic';
import GameCard from '@/components/game/GameCard';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function GamePlayPage() {
    const params = useParams();
    const id = params.id as string;
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const { gameState, getCurrentPair, selectWinner, sessionStats } = useGameLogic(candidates);
    const router = useRouter();

    useEffect(() => {
        const fetchCandidates = async () => {
            if (!id) return;

            const { data, error } = await supabase
                .from('candidates')
                .select('id, name, image_url')
                .eq('worldcup_id', id);

            if (error) {
                console.error('Error fetching candidates:', error);
            } else {
                setCandidates(data || []);
            }
            setLoading(false);
        };

        fetchCandidates();
    }, [id]);

    useEffect(() => {
        if (gameState.winner) {
            // Update stats before redirecting
            const updateStats = async () => {
                // Prepare batch updates
                const updates = Object.entries(sessionStats).map(([candidateId, stats]) => ({
                    id: candidateId,
                    match_win_count: stats.match_win,
                    match_expose_count: stats.match_expose,
                    win_count: candidateId === gameState.winner!.id ? 1 : 0
                }));

                console.log('Batch updates payload:', updates);

                // Batch update candidate stats
                const { error } = await supabase.rpc('batch_update_candidate_stats', { updates });

                if (error) {
                    console.error('Error updating candidate stats:', error);
                } else {
                    console.log('Candidate stats updated successfully');
                }

                // Increment total_plays for the worldcup
                await supabase.rpc('increment_worldcup_stats', { worldcup_id: id });
            };

            updateStats().then(() => {
                router.push(`/play/${id}/result?winnerId=${gameState.winner!.id}`);
            });
        }
    }, [gameState.winner, id, router, sessionStats]);

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (candidates.length === 0) return <div className="flex h-screen items-center justify-center">No candidates found</div>;
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
