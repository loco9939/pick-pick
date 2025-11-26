import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface Candidate {
    id: string;
    name: string;
    image_url: string;
}

interface GameState {
    round: string;
    totalCandidates: number;
    currentMatch: number;
    totalMatches: number;
    winner?: Candidate;
}

export default function useGameLogic(initialCandidates: Candidate[]) {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [nextRoundCandidates, setNextRoundCandidates] = useState<Candidate[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [winner, setWinner] = useState<Candidate | undefined>(undefined);
    const [sessionStats, setSessionStats] = useState<Record<string, { match_win: number; match_expose: number }>>({});

    // Initialize and shuffle
    useEffect(() => {
        if (initialCandidates.length > 0 && candidates.length === 0) {
            const shuffled = [...initialCandidates].sort(() => Math.random() - 0.5);
            setCandidates(shuffled);

            // Initialize session stats
            const initialStats: Record<string, { match_win: number; match_expose: number }> = {};
            initialCandidates.forEach(c => {
                initialStats[c.id] = { match_win: 0, match_expose: 0 };
            });
            setSessionStats(initialStats);
        }
    }, [initialCandidates]);

    const getCurrentPair = useCallback((): [Candidate, Candidate] => {
        return [candidates[currentMatchIndex * 2], candidates[currentMatchIndex * 2 + 1]];
    }, [candidates, currentMatchIndex]);

    const selectWinner = useCallback(async (winnerId: string) => {
        const currentPair = getCurrentPair();
        const winner = currentPair.find((c) => c.id === winnerId);
        const loser = currentPair.find((c) => c.id !== winnerId);

        if (winner && loser) {
            // Update local stats
            setSessionStats(prev => ({
                ...prev,
                [winner.id]: {
                    match_win: (prev[winner.id]?.match_win || 0) + 1,
                    match_expose: (prev[winner.id]?.match_expose || 0) + 1
                },
                [loser.id]: {
                    ...prev[loser.id],
                    match_expose: (prev[loser.id]?.match_expose || 0) + 1
                }
            }));

            setNextRoundCandidates((prev) => [...prev, winner]);
        }

        // Check if round is finished
        if (currentMatchIndex * 2 + 2 >= candidates.length) {
            // Move to next round
            const newRoundCandidates = [...nextRoundCandidates, winner!];

            if (newRoundCandidates.length === 1) {
                setWinner(newRoundCandidates[0]);
            } else {
                setCandidates(newRoundCandidates);
                setNextRoundCandidates([]);
                setCurrentMatchIndex(0);
            }
        } else {
            // Next match
            setCurrentMatchIndex((prev) => prev + 1);
        }
    }, [candidates, currentMatchIndex, nextRoundCandidates, getCurrentPair]);

    const getRoundName = (count: number) => {
        if (count === 2) return '결승';
        return `${count}강`;
    };

    const gameState: GameState = {
        round: getRoundName(candidates.length),
        totalCandidates: candidates.length,
        currentMatch: currentMatchIndex + 1,
        totalMatches: Math.floor(candidates.length / 2),
        winner,
    };

    return {
        gameState,
        getCurrentPair,
        selectWinner,
        sessionStats
    };
}
