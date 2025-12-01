'use client';

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import ImagePreviewModal from '@/components/common/ImagePreviewModal';
import CandidateFormList from '@/components/worldcup/CandidateFormList';
import WorldCupBasicInfo from '@/components/worldcup/WorldCupBasicInfo';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';
import { useRouter } from '@/navigation';

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

import { useGlobalAlert } from '@/components/common/GlobalAlertProvider';
import { useTranslations } from 'next-intl';

export default function EditForm({ worldcup, candidates: initialCandidates }: EditFormProps) {
    const t = useTranslations();
    const router = useRouter();
    const { showAlert } = useGlobalAlert();
    const [title, setTitle] = useState(worldcup.title);
    const [description, setDescription] = useState(worldcup.description || '');
    const [category, setCategory] = useState(worldcup.category || 'all');
    // Determine initial round size based on existing candidates (round up to nearest power of 2)
    const initialRound = [4, 8, 16, 32, 64].find(r => r >= initialCandidates.length) || 64;
    const [selectedRound, setSelectedRound] = useState<number>(initialRound);
    const [candidates, setCandidates] = useState<FormCandidate[]>(
        initialCandidates.map(c => ({ id: c.id, name: c.name, url: c.image_url }))
    );
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize candidates based on selected round
    React.useEffect(() => {
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

    const handleCandidateChange = (index: number, field: keyof FormCandidate, value: string) => {
        const newCandidates = [...candidates];
        // @ts-ignore
        newCandidates[index][field] = value;
        setCandidates(newCandidates);
    };

    const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
        e.preventDefault();

        if (!title.trim()) {
            await showAlert(t('제목은 필수입니다'));
            return;
        }

        const validCandidates = candidates.filter(c => c.name.trim());

        // Only validate candidate count if not a draft
        if (!isDraft && validCandidates.length !== selectedRound) {
            await showAlert(t('{count}명의 후보를 모두 입력해주세요', { count: selectedRound }));
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
                    thumbnail_url: validCandidates[0]?.url || '',
                    candidate_count: selectedRound,
                    category,
                    is_public: !isDraft
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
                id: c.id,
                worldcup_id: worldcup.id,
                name: c.name,
                image_url: c.url,
            }));

            const toInsert = candidatesToUpsert.filter(c => !c.id).map(({ id, ...rest }) => rest);
            const toUpdate = candidatesToUpsert.filter(c => c.id);

            if (toInsert.length > 0) {
                const { error: insertError } = await supabase
                    .from('candidates')
                    .insert(toInsert);
                if (insertError) throw insertError;
            }

            if (toUpdate.length > 0) {
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
            await showAlert(error.message || t('월드컵 수정 실패'));
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
                <h1 className="text-3xl font-bold tracking-tight">{t('월드컵 수정')}</h1>
                <p className="text-muted-foreground">{t('월드컵 정보를 수정하세요')}</p>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
                <WorldCupBasicInfo
                    title={title}
                    onTitleChange={setTitle}
                    description={description}
                    onDescriptionChange={setDescription}
                    category={category}
                    onCategoryChange={setCategory}
                    selectedRound={selectedRound}
                    onRoundChange={setSelectedRound}
                />

                <CandidateFormList
                    candidates={candidates}
                    selectedRound={selectedRound}
                    onCandidateChange={handleCandidateChange}
                    onPreviewImage={setPreviewImage}
                />

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
                    >
                        {t('취소')}
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, true)}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
                    >
                        {isSubmitting ? t('저장 중') : t('임시 저장')}
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
                    >
                        {isSubmitting ? t('저장 중') : t('변경사항 저장')}
                    </button>
                </div>
            </form>
        </div>
    );
}
