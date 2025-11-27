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
                // Sort by win count (desc), then win rate (desc)
                const sorted = (candidatesData || []).sort((a, b) => {
                    if (a.win_count !== b.win_count) return b.win_count - a.win_count;
                    const rateA = a.match_expose_count > 0 ? a.match_win_count / a.match_expose_count : 0;
                    const rateB = b.match_expose_count > 0 ? b.match_win_count / b.match_expose_count : 0;
                    return rateB - rateA;
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
                <div className="flex flex-col items-center justify-center mb-16 relative">
                    {/* Confetti Background */}
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                        {/* Confetti logic is handled by canvas-confetti, but we can add some glow here */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full animate-pulse" />
                    </div>

                    <h1 className="mb-8 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 animate-bounce">Winner!</h1>

                    <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-2xl border-4 border-primary/50 shadow-[0_0_50px_rgba(139,92,246,0.3)] mb-8 flex items-center justify-center bg-slate-800 group">
                        {!imageError && isValidUrl ? (
                            <Image
                                src={winner.image_url}
                                alt={winner.name}
                                fill
                                className="object-contain transition-transform duration-700 group-hover:scale-105"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-4 text-center">
                                <span className="text-4xl font-bold text-slate-500">{winner.name}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                            <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{winner.name}</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 w-full max-w-2xl mb-10">
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm text-center">
                            <div className="text-4xl font-black text-white mb-1">{winner.win_count}</div>
                            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Final Wins</div>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm text-center">
                            <div className="text-4xl font-black text-primary mb-1">
                                {winner.match_expose_count > 0
                                    ? ((winner.match_win_count / winner.match_expose_count) * 100).toFixed(1)
                                    : '0.0'}%
                            </div>
                            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Win Rate</div>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <Button
                            size="lg"
                            onClick={() => router.push(`/play/${id}/intro`)}
                            className="px-8 py-6 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                        >
                            Replay Game
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={handleShare}
                            className="px-8 py-6 text-lg border-slate-600 hover:bg-slate-800"
                        >
                            Share Result
                        </Button>
                        <Button
                            size="lg"
                            variant="ghost"
                            onClick={() => router.push('/')}
                            className="px-8 py-6 text-lg hover:bg-slate-800"
                        >
                            Back to Home
                        </Button>
                    </div>
                </div>
            )}

            <div className="mb-16">
                <h3 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
                    <span className="text-primary">🏆</span> Hall of Fame
                </h3>

                {/* Top 3 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {ranking.slice(0, 3).map((candidate, index) => {
                        const winRate = candidate.match_expose_count > 0
                            ? ((candidate.match_win_count / candidate.match_expose_count) * 100).toFixed(1)
                            : '0.0';
                        const isFirst = index === 0;

                        return (
                            <div
                                key={candidate.id}
                                className={`relative overflow-hidden rounded-xl border bg-slate-800/50 backdrop-blur-sm p-4 flex flex-col ${isFirst ? 'md:col-span-2 md:row-span-2 border-primary/50 bg-primary/5' : 'border-slate-700'}`}
                            >
                                <div className="absolute top-3 left-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 font-bold text-white border border-white/10">
                                    {index + 1}
                                </div>
                                <div className={`relative w-full ${isFirst ? 'h-64 md:h-80' : 'h-40'} mb-4 rounded-lg overflow-hidden bg-black flex items-center justify-center`}>
                                    <CandidateThumbnail candidate={candidate} />
                                </div>
                                <div className="mt-auto">
                                    <h4 className={`font-bold text-white mb-2 ${isFirst ? 'text-2xl' : 'text-lg'} line-clamp-1`}>{candidate.name}</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Win Rate</span>
                                            <span className={`font-bold ${Number(winRate) >= 50 ? 'text-green-400' : 'text-rose-400'}`}>{winRate}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${Number(winRate) >= 50 ? 'bg-green-500' : 'bg-rose-500'}`}
                                                style={{ width: `${winRate}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-sm pt-1">
                                            <span className="text-slate-400">Wins</span>
                                            <span className="font-bold text-white">{candidate.win_count}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Rest List */}
                <div className="space-y-3">
                    {ranking.slice(3).map((candidate, index) => {
                        const winRate = candidate.match_expose_count > 0
                            ? ((candidate.match_win_count / candidate.match_expose_count) * 100).toFixed(1)
                            : '0.0';
                        const realIndex = index + 4;

                        return (
                            <div key={candidate.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-colors">
                                <div className="flex-shrink-0 w-8 text-center font-bold text-slate-500">
                                    {realIndex}
                                </div>
                                <div className="relative h-12 w-12 overflow-hidden rounded-md bg-black">
                                    <CandidateThumbnail candidate={candidate} />
                                </div>
                                <div className="flex-grow font-medium text-slate-300">
                                    {candidate.name}
                                </div>
                                <div className="flex flex-col items-end w-32 gap-1">
                                    <div className="flex items-center gap-2 w-full justify-end">
                                        <span className={`text-sm font-bold ${Number(winRate) >= 50 ? 'text-green-400' : 'text-rose-400'}`}>{winRate}%</span>
                                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${Number(winRate) >= 50 ? 'bg-green-500' : 'bg-rose-500'}`}
                                                style={{ width: `${winRate}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-500">{candidate.win_count} Wins</span>
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

function CandidateThumbnail({ candidate }: { candidate: Candidate }) {
    const [error, setError] = useState(false);

    const isValidUrl = React.useMemo(() => {
        if (!candidate.image_url) return false;
        try {
            new URL(candidate.image_url);
            return true;
        } catch {
            return candidate.image_url.startsWith('/');
        }
    }, [candidate.image_url]);

    if (error || !isValidUrl) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-bold text-muted-foreground">
                {candidate.name.slice(0, 2)}
            </div>
        );
    }

    return (
        <Image
            src={candidate.image_url}
            alt={candidate.name}
            fill
            className="object-contain"
            onError={() => setError(true)}
        />
    );
}
