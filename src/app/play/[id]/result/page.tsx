'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
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

    useEffect(() => {
        const fetchWinner = async () => {
            if (!winnerId) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('candidates')
                .select('*')
                .eq('id', winnerId)
                .single();

            if (error) {
                console.error('Error fetching winner:', error);
            } else {
                setWinner(data);
            }
            setLoading(false);
        };

        fetchWinner();
    }, [winnerId]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!winner) {
        return (
            <div className="container flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
                <h1 className="text-2xl font-bold">Winner not found</h1>
                <Link href="/" className="mt-4 text-primary hover:underline">
                    Back to Home
                </Link>
            </div>
        );
    }

    const winRate = winner.match_expose_count > 0
        ? ((winner.match_win_count / winner.match_expose_count) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="container mx-auto max-w-4xl py-8 px-4">
            <div className="flex flex-col items-center justify-center mb-12">
                <h1 className="mb-8 text-4xl font-bold animate-bounce text-primary">Winner!</h1>
                <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-xl border-4 border-primary/20 shadow-2xl mb-6">
                    <img
                        src={winner.image_url}
                        alt={winner.name}
                        className="h-full w-full object-cover"
                    />
                </div>
                <h2 className="text-3xl font-bold mb-2">{winner.name}</h2>

                <div className="flex gap-8 text-muted-foreground mb-8">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{winner.win_count}</div>
                        <div className="text-sm">Final Wins</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{winRate}%</div>
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

            <div className="border-t pt-8">
                <h3 className="text-2xl font-bold mb-6">Comments</h3>
                <CommentList worldcupId={id} />
            </div>
        </div>
    );
}
