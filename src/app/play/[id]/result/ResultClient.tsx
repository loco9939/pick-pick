'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import CommentList from '@/components/comment/CommentList';
import { Button } from '@/components/ui/button';

interface Candidate {
    id: string;
    name: string;
    image_url: string;
    win_count: number;
    match_win_count: number;
    match_expose_count: number;
}

export default function ResultPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <ResultContent />
        </Suspense>
    );
}

function ResultContent() {
    const params = useParams();
    const id = params.id as string;
    const searchParams = useSearchParams();
    const winnerId = searchParams.get('winnerId');
    const [winner, setWinner] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [ranking, setRanking] = useState<Candidate[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Fetch winner if exists
            if (winnerId) {
                const { data: winnerData, error: winnerError } = await supabase
                    .from('candidates')
                    .select('*')
                    .eq('id', winnerId)
                    .single();

                if (winnerError) {
                    console.error('Error fetching winner:', winnerError);
                } else {
                    setWinner(winnerData);
                }
            }

            // Fetch all candidates for ranking
            const { data: candidatesData, error: candidatesError } = await supabase
                .from('candidates')
                .select('*')
                .eq('worldcup_id', id);

            if (candidatesError) {
                console.error('Error fetching candidates:', candidatesError);
            } else {
                // Sort by win rate (desc), then win count (desc)
                const sorted = (candidatesData || []).sort((a, b) => {
                    const rateA = a.match_expose_count > 0 ? a.match_win_count / a.match_expose_count : 0;
                    const rateB = b.match_expose_count > 0 ? b.match_win_count / b.match_expose_count : 0;
                    if (rateA !== rateB) return rateB - rateA;
                    return b.win_count - a.win_count;
                });
                setRanking(sorted);
            }

            setLoading(false);
        };

        fetchData();
    }, [id, winnerId]);

    // Trigger confetti when winner is loaded
    useEffect(() => {
        if (winner) {
            import('canvas-confetti').then((confetti) => {
                confetti.default({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            });
        }
    }, [winner]);

    const [imageError, setImageError] = useState(false);

    const isValidUrl = React.useMemo(() => {
        if (!winner?.image_url) return false;
        try {
            new URL(winner.image_url);
            return true;
        } catch {
            return winner.image_url.startsWith('/');
        }
    }, [winner?.image_url]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <div className="container mx-auto max-w-4xl py-8 px-4">
            {winner && (
                <div className="flex flex-col items-center justify-center mb-12">
                    <h1 className="mb-8 text-4xl font-bold animate-bounce text-primary">Winner!</h1>
                    <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-xl border-4 border-primary/20 shadow-2xl mb-6 flex items-center justify-center bg-muted">
                        {!imageError && isValidUrl ? (
                            <Image
                                src={winner.image_url}
                                alt={winner.name}
                                fill
                                className="object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-4 text-center">
                                <span className="text-4xl font-bold text-muted-foreground">{winner.name}</span>
                            </div>
                        )}
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{winner.name}</h2>

                    <div className="flex gap-8 text-muted-foreground mb-8">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-foreground">{winner.win_count}</div>
                            <div className="text-sm">Final Wins</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-foreground">
                                {winner.match_expose_count > 0
                                    ? ((winner.match_win_count / winner.match_expose_count) * 100).toFixed(1)
                                    : '0.0'}%
                            </div>
                            <div className="text-sm">Win Rate</div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            size="lg"
                            onClick={() => router.push(`/play/${id}/intro`)}
                            className="px-8"
                        >
                            Replay
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={handleShare}
                            className="px-8"
                        >
                            Share
                        </Button>
                        <Button
                            size="lg"
                            variant="secondary"
                            onClick={() => router.push('/')}
                            className="px-8"
                        >
                            Home
                        </Button>
                    </div>
                </div>
            )}

            <div className="mb-12">
                <h3 className="text-2xl font-bold mb-6">Ranking</h3>
                <div className="space-y-4">
                    {ranking.map((candidate, index) => {
                        const winRate = candidate.match_expose_count > 0
                            ? ((candidate.match_win_count / candidate.match_expose_count) * 100).toFixed(1)
                            : '0.0';

                        return (
                            <div key={candidate.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="flex-shrink-0 w-8 text-center font-bold text-lg text-muted-foreground">
                                    {index + 1}
                                </div>
                                <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                                    <Image
                                        src={candidate.image_url}
                                        alt={candidate.name}
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                            // Fallback logic handled by parent or just hide image
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                                <div className="flex-grow font-medium">
                                    {candidate.name}
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-primary">{winRate}%</div>
                                    <div className="text-xs text-muted-foreground">Win Rate</div>
                                </div>
                                <div className="text-right w-20">
                                    <div className="font-bold">{candidate.win_count}</div>
                                    <div className="text-xs text-muted-foreground">Wins</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="border-t pt-8">
                <h3 className="text-2xl font-bold mb-6">Comments</h3>
                <CommentList worldcupId={id} />
            </div>
        </div>
    );
}
