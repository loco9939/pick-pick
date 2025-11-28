'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';
import ImagePreviewModal from '@/components/common/ImagePreviewModal';
import Loading from '@/components/common/Loading';
import CandidateFormList from '@/components/worldcup/CandidateFormList';
import WorldCupBasicInfo from '@/components/worldcup/WorldCupBasicInfo';

interface Candidate {
    name: string;
    url: string;
}

export default function CreateForm() {
    const router = useRouter();
    const { user, isLoading: isUserLoading } = useUser();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedRound, setSelectedRound] = useState<number>(4);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [error, setError] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, isUserLoading, router]);

    // Initialize candidates based on selected round
    useEffect(() => {
        setCandidates(prev => {
            const currentCount = prev.length;
            if (currentCount === selectedRound) return prev;

            if (currentCount < selectedRound) {
                const toAdd = selectedRound - currentCount;
                return [...prev, ...Array.from({ length: toAdd }, () => ({ name: '', url: '' }))];
            } else {
                return prev.slice(0, selectedRound);
            }
        });
    }, [selectedRound]);

    if (isUserLoading) {
        return <Loading />;
    }

    if (!user) {
        return null; // Don't render anything while redirecting
    }

    const handleCandidateChange = (index: number, field: keyof Candidate, value: string) => {
        const newCandidates = [...candidates];
        newCandidates[index][field] = value;
        setCandidates(newCandidates);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        const validCandidates = candidates.filter(c => c.name.trim());
        if (validCandidates.length !== selectedRound) {
            setError(`Please fill in all ${selectedRound} candidates.`);
            return;
        }

        try {
            setIsSubmitting(true);

            // 1. Insert WorldCup
            const { data: worldcup, error: worldcupError } = await supabase
                .from('worldcups')
                .insert({
                    title,
                    description,
                    owner_id: user.id,
                    thumbnail_url: validCandidates[0]?.url || '', // Use first candidate as thumbnail, or empty string
                    candidate_count: selectedRound,
                })
                .select()
                .single();

            if (worldcupError) throw worldcupError;

            // 2. Insert Candidates
            const candidatesToInsert = validCandidates.map(c => ({
                worldcup_id: worldcup.id,
                name: c.name,
                image_url: c.url,
            }));

            const { error: candidatesError } = await supabase
                .from('candidates')
                .insert(candidatesToInsert);

            if (candidatesError) throw candidatesError;

            // 3. Redirect
            router.push(`/play/${worldcup.id}`);
            router.refresh();
        } catch (error: any) {
            console.error('Error creating WorldCup:', error);
            setError(error.message || 'Failed to create WorldCup');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto max-w-4xl py-12 px-6">
            {/* Image Preview Modal */}
            <ImagePreviewModal
                isOpen={!!previewImage}
                imageUrl={previewImage}
                onClose={() => setPreviewImage(null)}
            />

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Create New WorldCup</h1>
                <p className="text-muted-foreground">Create your own ideal type worldcup tournament.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive text-red-500">
                        {error}
                    </div>
                )}
                <WorldCupBasicInfo
                    title={title}
                    onTitleChange={setTitle}
                    description={description}
                    onDescriptionChange={setDescription}
                    selectedRound={selectedRound}
                    onRoundChange={setSelectedRound}
                />

                <CandidateFormList
                    candidates={candidates}
                    selectedRound={selectedRound}
                    onCandidateChange={handleCandidateChange}
                    onPreviewImage={setPreviewImage}
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
                >
                    {isSubmitting ? 'Creating...' : 'Create WorldCup'}
                </button>
            </form>
        </div>
    );
}
