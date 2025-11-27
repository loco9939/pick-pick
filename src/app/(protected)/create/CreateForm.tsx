'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';

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
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
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
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Title
                    </label>
                    <input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="e.g. K-Pop Female Idol WorldCup"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Describe your WorldCup..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Tournament Size
                    </label>
                    <select
                        value={selectedRound}
                        onChange={(e) => setSelectedRound(Number(e.target.value))}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {[4, 8, 16, 32, 64].map(size => (
                            <option key={size} value={size}>{size}강 (Requires {size} candidates)</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Candidates ({candidates.filter(c => c.name && c.url).length} / {selectedRound})
                        </label>
                    </div>

                    <div className="rounded-md border">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">#</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-1/2 min-w-[150px]">Candidate Name</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-1/2 min-w-[150px]">Image URL</th>
                                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground w-[150px]">Preview</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {candidates.map((candidate, index) => (
                                    <tr key={index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {index + 1}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <input
                                                value={candidate.name}
                                                onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Candidate Name"
                                            />
                                        </td>
                                        <td className="p-4 align-middle">
                                            <input
                                                value={candidate.url}
                                                onChange={(e) => handleCandidateChange(index, 'url', e.target.value)}
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="https://example.com/image.jpg"
                                            />
                                        </td>
                                        <td className="p-4 align-middle text-center">
                                            <img
                                                src={candidate.url}
                                                alt={candidate.name}
                                                className="w-16 h-16 object-cover rounded mx-auto"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

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
