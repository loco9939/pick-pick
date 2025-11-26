'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Mock Data (duplicated from GamePlayPage for now, ideally shared)
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

import CommentList from '@/components/comment/CommentList';

// ... (MOCK_CANDIDATES remains the same)

function ResultContent() {
    const searchParams = useSearchParams();
    const winnerId = searchParams.get('winnerId');
    // We need worldcupId, but it's not in searchParams.
    // It should be passed from the page component which gets it from params.
    // However, ResultContent is inside ResultPage which gets params.
    // But ResultContent uses useSearchParams which is client side.
    // Let's pass params to ResultContent.
    // Wait, ResultPage is a client component, so it receives params.
    // But ResultContent is just a helper function.
    // Let's move ResultContent inside or pass props.

    // Actually, I can get params from the parent component.
    // But ResultContent is defined outside.
    // Let's move ResultContent inside or pass props.
    return null;
}

export default function ResultPage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResultContentWrapper params={params} />
        </Suspense>
    );
}

function ResultContentWrapper({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const winnerId = searchParams.get('winnerId');
    const winner = MOCK_CANDIDATES.find((c) => c.id === winnerId);

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

    return (
        <div className="container mx-auto max-w-4xl py-8 px-4">
            <div className="flex flex-col items-center justify-center mb-12">
                <h1 className="mb-8 text-4xl font-bold animate-bounce">Winner!</h1>
                <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-xl border shadow-2xl">
                    <img
                        src={winner.image_url}
                        alt={winner.name}
                        className="h-full w-full object-cover"
                    />
                </div>
                <h2 className="mt-6 text-3xl font-bold">{winner.name}</h2>
                <div className="mt-8 flex gap-4">
                    <Link
                        href="/"
                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>

            <div className="border-t pt-8">
                <CommentList worldcupId={params.id} />
            </div>
        </div>
    );
}
