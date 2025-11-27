'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import WorldCupCard from '@/components/worldcup/WorldCupCard';
import { Database } from '@/lib/supabase/database.types';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

type WorldCup = Database['public']['Tables']['worldcups']['Row'];

export default function MyPageClient() {
    const router = useRouter();
    const { user, isLoading: isUserLoading } = useUser();
    const [worldcups, setWorldcups] = useState<WorldCup[]>([]);
    const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [newNickname, setNewNickname] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/auth/login');
            return;
        }

        const fetchData = async () => {
            if (!user) return;

            // Fetch WorldCups
            const { data: wcData, error: wcError } = await supabase
                .from('worldcups')
                .select('*')
                .eq('owner_id', user.id)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (wcError) console.error('Error fetching worldcups:', wcError);
            else setWorldcups(wcData || []);

            // Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) console.error('Error fetching profile:', profileError);
            else {
                setProfile(profileData);
                setNewNickname(profileData.nickname || '');
            }

            setIsDataLoading(false);
        };

        if (!isUserLoading && user) {
            fetchData();
        }
    }, [user, isUserLoading, router]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this WorldCup?')) return;

        // 1. Soft delete WorldCup
        const { error: wcError } = await supabase
            .from('worldcups')
            .update({ is_deleted: true })
            .eq('id', id);

        if (wcError) {
            console.error('Error deleting worldcup:', wcError);
            alert('Failed to delete WorldCup');
        } else {
            setWorldcups((prev) => prev.filter((wc) => wc.id !== id));
        }
    };

    const handleUpdateProfile = async () => {
        if (!user || !newNickname.trim()) return;

        setIsSavingProfile(true);
        const { error } = await supabase
            .from('profiles')
            .update({ nickname: newNickname.trim() })
            .eq('id', user.id);

        if (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } else {
            setProfile(prev => prev ? { ...prev, nickname: newNickname.trim() } : null);
            setIsEditingProfile(false);
        }
        setIsSavingProfile(false);
    };

    if (isUserLoading || isDataLoading) {
        return <div className="container py-8 text-center">Loading...</div>;
    }


    console.log('====worldcups: ', worldcups)
    return (
        <div className="container mx-auto py-8 px-4">
            {/* Profile Section */}
            <div className="mb-12 rounded-lg border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-bold">Profile</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <div className="mt-1 text-lg">{user?.email}</div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Nickname</label>
                        {isEditingProfile ? (
                            <div className="mt-1 flex gap-2">
                                <input
                                    value={newNickname}
                                    onChange={(e) => setNewNickname(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder="Enter nickname"
                                />
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={isSavingProfile}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                                >
                                    {isSavingProfile ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditingProfile(false);
                                        setNewNickname(profile?.nickname || '');
                                    }}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="mt-1 flex items-center gap-2">
                                <span className="text-lg">{profile?.nickname || 'No nickname set'}</span>
                                <button
                                    onClick={() => setIsEditingProfile(true)}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                            thumbnailUrl={wc.thumbnail_url || ''}
                            totalPlays={wc.total_plays}
                            candidateCount={wc.candidate_count || 0}
                            actions={
                                <div className="flex justify-between">
                                    <div>
                                        <Link href={`/play/${wc.id}/result`} className="text-sm font-medium text-primary hover:underline">
                                            View Stats
                                        </Link>
                                    </div>
                                    <div className='flex gap-4'>
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
                                </div>
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
