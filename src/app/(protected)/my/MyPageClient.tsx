'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';
import { useUser } from '@/context/UserContext';
import Loading from '@/components/common/Loading';
import { Edit } from 'lucide-react';
import WorldCupList from '@/components/worldcup/WorldCupList';

export default function MyPageClient() {
    const router = useRouter();
    const { user, isLoading: isUserLoading } = useUser();
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

            setIsDataLoading(true);

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

    if (isUserLoading || (isDataLoading && !profile)) {
        return <Loading fullScreen={false} />;
    }

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
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 bg-slate-800/50 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                                    title="Edit Profile"
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <h1 className="mb-8 text-3xl font-bold">My WorldCups</h1>

            {user && <WorldCupList mode="my" userId={user.id} baseUrl="/my" />}
        </div>
    );
}
