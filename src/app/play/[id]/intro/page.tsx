'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface WorldCup {
    id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    profiles: {
        nickname: string | null;
    } | null;
}

export default function IntroPage() {
    const params = useParams();
    const id = params.id as string;
    const [worldcup, setWorldcup] = useState<WorldCup | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchWorldCup = async () => {
            const { data, error } = await supabase
                .from('worldcups')
                .select(`
                    *,
                    profiles (
                        nickname
                    )
                `)
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching worldcup:', error);
                // Handle error (e.g., redirect to 404)
            } else {
                setWorldcup(data as any); // Type cast for now due to join complexity
            }
            setLoading(false);
        };

        fetchWorldCup();
    }, [id]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!worldcup) {
        return <div className="flex h-screen items-center justify-center">WorldCup not found</div>;
    }

    return (
        <div className="container mx-auto flex h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
            <div className="mb-8 relative h-64 w-64 overflow-hidden rounded-xl shadow-2xl md:h-96 md:w-96">
                <Image
                    src={worldcup.thumbnail_url || 'https://placehold.co/600x400/png?text=No+Image'}
                    alt={worldcup.title}
                    fill
                    className="object-cover"
                />
            </div>

            <h1 className="mb-4 text-center text-3xl font-bold md:text-5xl">{worldcup.title}</h1>

            {worldcup.description && (
                <p className="mb-6 text-center text-lg text-muted-foreground max-w-2xl">
                    {worldcup.description}
                </p>
            )}

            <div className="mb-8 text-sm text-muted-foreground">
                Created by {worldcup.profiles?.nickname || 'Unknown'}
            </div>

            <Button
                size="lg"
                className="text-xl px-12 py-6 animate-pulse"
                onClick={() => router.push(`/play/${id}`)}
            >
                Start Game
            </Button>
        </div>
    );
}
