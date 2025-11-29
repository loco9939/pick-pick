'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import WorldCupThumbnail from '@/components/worldcup/WorldCupThumbnail';
import Loading from '@/components/common/Loading';
import { useTranslations } from 'next-intl';

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
    const t = useTranslations();

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
        return <Loading />;
    }

    if (!worldcup) {
        return <div className="flex h-screen items-center justify-center">{t('월드컵을 찾을 수 없습니다')}</div>;
    }


    const thumbnail = worldcup.thumbnail_url || '';

    return (
        <div className="container mx-auto flex h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
            <WorldCupThumbnail
                title={worldcup.title}
                thumbnailUrl={thumbnail}
                className="mb-8 h-64 w-64 rounded-xl shadow-2xl md:h-96 md:w-96"
            />

            <h1 className="mb-4 text-center text-3xl font-bold md:text-5xl">{worldcup.title}</h1>

            {worldcup.description && (
                <p className="mb-6 text-center text-lg text-muted-foreground max-w-2xl">
                    {worldcup.description}
                </p>
            )}

            <div className="mb-8 text-sm text-muted-foreground">
                {t('제작자')}: {worldcup.profiles?.nickname || t('알 수 없음')}
            </div>

            <Button
                size="lg"
                className="w-full text-lg py-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 animate-pulse"
                onClick={() => router.push(`/play/${id}`)}
            >
                {t('게임 시작')}
            </Button>
        </div>
    );
}
