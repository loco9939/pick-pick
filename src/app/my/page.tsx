'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import WorldCupCard from '@/components/worldcup/WorldCupCard';
import { Database } from '@/lib/supabase/database.types';

type WorldCup = Database['public']['Tables']['worldcups']['Row'];

export default function MyPage() {
    const router = useRouter();
    const [worldcups, setWorldcups] = useState<WorldCup[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data, error } = await supabase
                .from('worldcups')
                .select('*')
                .eq('owner_id', user.id)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching worldcups:', error);
            } else {
                setWorldcups(data || []);
            }
            setIsLoading(false);
        };

        checkAuthAndFetchData();
    }, [router]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this WorldCup?')) return;

        const { error } = await (supabase
            .from('worldcups') as any)
            .update({ is_deleted: true })
            .eq('id', id);

        if (error) {
            console.error('Error deleting worldcup:', error);
            alert('Failed to delete WorldCup');
        } else {
            setWorldcups((prev) => prev.filter((wc) => wc.id !== id));
        }
    };

    if (isLoading) {
        return <div className="container py-8 text-center">Loading...</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="mb-8 text-3xl font-bold">My WorldCups</h1>

            {worldcups.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/10">
                    <p className="text-muted-foreground mb-4">You haven't created any WorldCups yet.</p>
                    <button
                        onClick={() => router.push('/create')}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                    >
                        Create New WorldCup
                    </button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {worldcups.map((wc) => (
                        <WorldCupCard
                            key={wc.id}
                            id={wc.id}
                            title={wc.title}
                            description={wc.description || ''}
                            thumbnailUrl={wc.thumbnail_url || 'https://placehold.co/600x400/png?text=No+Image'}
                            actions={
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => router.push(`/edit/${wc.id}`)}
                                        className="text-sm font-medium text-primary hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(wc.id)}
                                        className="text-sm font-medium text-destructive hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
