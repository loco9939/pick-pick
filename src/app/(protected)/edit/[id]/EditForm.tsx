'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';

type WorldCup = Database['public']['Tables']['worldcups']['Row'];
type Candidate = Database['public']['Tables']['candidates']['Row'];

interface EditFormProps {
    worldcup: WorldCup;
    candidates: Candidate[];
}

interface FormCandidate {
    id?: string;
    name: string;
    url: string;
}

export default function EditForm({ worldcup, candidates: initialCandidates }: EditFormProps) {
    const router = useRouter();
    const [title, setTitle] = useState(worldcup.title);
    const [description, setDescription] = useState(worldcup.description || '');
    const [candidates, setCandidates] = useState<FormCandidate[]>(
        initialCandidates.map(c => ({ id: c.id, name: c.name, url: c.image_url }))
    );
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCandidateChange = (index: number, field: keyof FormCandidate, value: string) => {
        const newCandidates = [...candidates];
        // @ts-ignore
        newCandidates[index][field] = value;
        setCandidates(newCandidates);
    };

    const addCandidate = () => {
        setCandidates([...candidates, { name: '', url: '' }]);
    };

    const removeCandidate = (index: number) => {
        if (candidates.length <= 2) {
            setError('At least 2 candidates are required');
            return;
        }
        const newCandidates = candidates.filter((_, i) => i !== index);
        setCandidates(newCandidates);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        const validCandidates = candidates.filter(c => c.name.trim() && c.url.trim());
        if (validCandidates.length < candidates.length) {
            setError('All candidates must have a name and image URL');
            return;
        }

        if (validCandidates.length < 2) {
            setError('At least 2 candidates are required');
            return;
        }

        try {
            setIsSubmitting(true);

            // 1. Update WorldCup
            const { error: worldcupError } = await supabase
                .from('worldcups')
                .update({
                    title,
                    description,
                    thumbnail_url: validCandidates[0].url, // Update thumbnail to first candidate
                })
                .eq('id', worldcup.id);

            if (worldcupError) throw worldcupError;

            // 2. Handle Candidates
            // Identify candidates to delete
            const currentIds = validCandidates.map(c => c.id).filter(id => id) as string[];
            const originalIds = initialCandidates.map(c => c.id);
            const idsToDelete = originalIds.filter(id => !currentIds.includes(id));

            if (idsToDelete.length > 0) {
                const { error: deleteError } = await supabase
                    .from('candidates')
                    .delete()
                    .in('id', idsToDelete);
                if (deleteError) throw deleteError;
            }

            // Upsert candidates (update existing, insert new)
            const candidatesToUpsert = validCandidates.map(c => ({
                id: c.id, // If id exists, it updates; if undefined, it inserts (but we need to handle insert carefully)
                worldcup_id: worldcup.id,
                name: c.name,
                image_url: c.url,
            }));

            // Separate insert and update because upsert with undefined ID might be tricky depending on RLS/Schema
            // Actually, for upsert to work for insert, we shouldn't pass 'id' if it's undefined.
            const toInsert = candidatesToUpsert.filter(c => !c.id).map(({ id, ...rest }) => rest);
            const toUpdate = candidatesToUpsert.filter(c => c.id);

            if (toInsert.length > 0) {
                const { error: insertError } = await supabase
                    .from('candidates')
                    .insert(toInsert);
                if (insertError) throw insertError;
            }

            if (toUpdate.length > 0) {
                // Supabase upsert requires primary key match.
                // We can do individual updates or upsert. Upsert is better if we trust IDs.
                const { error: updateError } = await supabase
                    .from('candidates')
                    .upsert(toUpdate);
                if (updateError) throw updateError;
            }

            // 3. Redirect
            router.push('/my');
            router.refresh();
        } catch (error: any) {
            console.error('Error updating WorldCup:', error);
            setError(error.message || 'Failed to update WorldCup');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container max-w-4xl py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Edit WorldCup</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
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

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Candidates
                        </label>
                        <button
                            type="button"
                            onClick={addCandidate}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3"
                        >
                            Add Candidate
                        </button>
                    </div>

                    <div className="rounded-md border">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[200px]">Candidate Name</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Image URL</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground w-[100px]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {candidates.map((candidate, index) => (
                                    <tr key={index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
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
                                        <td className="p-4 align-middle text-right">
                                            <button
                                                type="button"
                                                onClick={() => removeCandidate(index)}
                                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-destructive/90 hover:text-destructive-foreground h-8 w-8 text-destructive"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
