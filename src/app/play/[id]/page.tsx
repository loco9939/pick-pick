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
        <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-background">
            <AnimatePresence>
                {showRoundTransition && (
                    <RoundTransition round={gameState.round} />
                )}
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 z-[60] h-1 bg-slate-800">
                <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(gameState.currentMatch / gameState.totalMatches) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Round Indicator */}
            <div className="absolute top-4 left-1/2 z-[60] -translate-x-1/2 flex flex-col items-center justify-center rounded-lg bg-slate-900/80 px-3 py-1.5 md:top-6 md:px-4 md:py-2 backdrop-blur-md border border-slate-700 shadow-lg text-center">
                <p className="text-lg font-bold text-white tracking-wider md:text-xl">{gameState.round}</p>
                <p className="text-[10px] font-medium text-slate-400 md:text-xs">Match {gameState.currentMatch} / {gameState.totalMatches}</p>
            </div>

            {!showRoundTransition && (
                <div className="relative flex h-full w-full flex-col md:flex-row">
                    <AnimatePresence mode="popLayout">
                        {(!selectedId || selectedId === left.id) && (
                            <motion.div
                                layout
                                key={left.id}
                                className={`
                                    relative flex-1 w-full md:h-full
                                    ${selectedId === left.id ? 'absolute inset-0 z-30 h-full' : ''}
                                `}
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)", transition: { duration: 0.3 } }}
                                transition={{
                                    layout: { duration: 0.5, type: "spring", bounce: 0.2 },
                                    opacity: { duration: 0.3 }
                                }}
                            >
                                <div className="h-full w-full p-2 md:p-0">
                                    <GameCard
                                        candidate={left}
                                        onClick={() => handleSelect(left.id)}
                                        isSelected={selectedId === left.id}
                                        isUnselected={selectedId !== null && selectedId !== left.id}
                                        side="left"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* VS Badge */}
                        <div className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                            <div className="relative flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-slate-900 border-4 border-slate-700 shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                                <span className="text-2xl md:text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-rose-500">
                                    VS
                                </span>
                                <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-tr from-cyan-500/20 to-rose-500/20 blur-xl" />
                            </div>
                        </div>

                        {(!selectedId || selectedId === right.id) && (
                            <motion.div
                                layout
                                key={right.id}
                                className={`
                                    relative flex-1 w-full md:h-full
                                    ${selectedId === right.id ? 'absolute inset-0 z-30 h-full' : ''}
                                `}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)", transition: { duration: 0.3 } }}
                                transition={{
                                    layout: { duration: 0.5, type: "spring", bounce: 0.2 },
                                    opacity: { duration: 0.3 }
                                }}
                            >
                                <div className="h-full w-full p-2 md:p-0">
                                    <GameCard
                                        candidate={right}
                                        onClick={() => handleSelect(right.id)}
                                        isSelected={selectedId === right.id}
                                        isUnselected={selectedId !== null && selectedId !== right.id}
                                        side="right"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
