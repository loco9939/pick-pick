'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';
import { useRouter } from '@/navigation';
import { useGlobalAlert } from '@/components/common/GlobalAlertProvider';
import { useTranslations } from 'next-intl';
import WorldCupForm, { WorldCupFormData } from '@/components/worldcup/WorldCupForm';

type WorldCup = Database['public']['Tables']['worldcups']['Row'];
type Candidate = Database['public']['Tables']['candidates']['Row'];

interface EditFormProps {
    worldcup: WorldCup;
    candidates: Candidate[];
}

export default function EditForm({ worldcup, candidates: initialCandidates }: EditFormProps) {
    const t = useTranslations();
    const router = useRouter();
    const { showAlert } = useGlobalAlert();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Determine initial round size based on existing candidates (round up to nearest power of 2)
    const initialRound = [4, 8, 16, 32, 64].find(r => r >= initialCandidates.length) || 64;

    const initialData: WorldCupFormData = {
        title: worldcup.title,
        description: worldcup.description || '',
        category: worldcup.category,
        visibility: (worldcup.visibility as 'public' | 'private') || (worldcup.is_public ? 'public' : 'private'),
        selectedRound: initialRound,
        candidates: initialCandidates.map(c => ({
            id: c.id,
            name: c.name,
            url: c.image_url
        }))
    };

    const handleSubmit = async (data: WorldCupFormData, status: 'draft' | 'published') => {
        try {
            setIsSubmitting(true);

            const validCandidates = data.candidates.filter(c => c.name.trim());

            // 1. Update WorldCup
            const { error: worldcupError } = await supabase
                .from('worldcups')
                .update({
                    title: data.title,
                    description: data.description,
                    thumbnail_url: validCandidates[0]?.url || '',
                    candidate_count: data.selectedRound,
                    category: data.category,
                    is_public: status === 'published' && data.visibility === 'public',
                    visibility: data.visibility,
                    status: status
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
        <WorldCupForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="edit"
        />
    );
}
