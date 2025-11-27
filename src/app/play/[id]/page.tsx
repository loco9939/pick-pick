'use client';

import React, { useEffect, useLayoutEffect, useState } from 'react';
import useGameLogic, { Candidate } from '@/hooks/useGameLogic';
import GameCard from '@/components/game/GameCard';
import RoundTransition from '@/components/game/RoundTransition';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function GamePlayPage() {
    const params = useParams();
    const id = params.id as string;
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const { gameState, getCurrentPair, getNextPair, selectWinner, sessionStats } = useGameLogic(candidates);
    const router = useRouter();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showRoundTransition, setShowRoundTransition] = useState(false);
    const [previousRound, setPreviousRound] = useState<string>('');

    // Handle round transition
    useLayoutEffect(() => {
        if (gameState.round && previousRound && gameState.round !== previousRound && !gameState.winner) {
            setShowRoundTransition(true);
            const timer = setTimeout(() => {
                setShowRoundTransition(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
        setPreviousRound(gameState.round);
    }, [gameState.round, previousRound, gameState.winner]);

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

    const handleSelect = (id: string) => {
        if (selectedId) return; // Prevent double clicks
        setSelectedId(id);

        // Preload next images
        const nextPair = getNextPair();
        if (nextPair) {
            nextPair.forEach(candidate => {
                const img = new Image();
                img.src = candidate.image_url;
            });
        }

        // Wait for animation
        setTimeout(() => {
            selectWinner(id);
            setSelectedId(null);
        }, 800); // 800ms animation duration
    };

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
            <AnimatePresence>
                {showRoundTransition && (
                    <RoundTransition round={gameState.round} />
                )}
            </AnimatePresence>

            {/* Round Indicator */}
            <div className="absolute top-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-background/80 px-6 py-2 text-lg font-bold backdrop-blur shadow-sm border">
                {gameState.round} <span className="text-sm font-normal text-muted-foreground ml-2">({gameState.currentMatch} / {gameState.totalMatches})</span>
            </div>

            {/* VS Badge */}
            <div className="absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-background font-black text-2xl shadow-xl border-4 border-primary/20">
                VS
            </div>

            {!showRoundTransition && (
                <div className="relative flex h-full w-full flex-col md:flex-row">
                    <AnimatePresence mode="popLayout">
                        {(!selectedId || selectedId === left.id) && (
                            <motion.div
                                layout
                                key="left-card"
                                className={`
                                    ${selectedId === left.id ? 'absolute inset-0 z-20 h-full w-full p-4' : 'relative h-1/2 w-full md:h-full md:w-1/2 p-2 md:p-4'}
                                `}
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                                transition={{
                                    layout: { duration: 0.5, type: "spring", bounce: 0.2 },
                                    opacity: { duration: 0.3 }
                                }}
                            >
                                <GameCard
                                    candidate={left}
                                    onClick={() => handleSelect(left.id)}
                                    isSelected={selectedId === left.id}
                                    isUnselected={selectedId !== null && selectedId !== left.id}
                                />
                            </motion.div>
                        )}
                        {(!selectedId || selectedId === right.id) && (
                            <motion.div
                                layout
                                key="right-card"
                                className={`
                                    ${selectedId === right.id ? 'absolute inset-0 z-20 h-full w-full p-4' : 'relative h-1/2 w-full md:h-full md:w-1/2 p-2 md:p-4'}
                                `}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                                transition={{
                                    layout: { duration: 0.5, type: "spring", bounce: 0.2 },
                                    opacity: { duration: 0.3 }
                                }}
                            >
                                <GameCard
                                    candidate={right}
                                    onClick={() => handleSelect(right.id)}
                                    isSelected={selectedId === right.id}
                                    isUnselected={selectedId !== null && selectedId !== right.id}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
