'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from '@/navigation';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';
import Loading from '@/components/common/Loading';
import { useGlobalAlert } from '@/components/common/GlobalAlertProvider';
import { useTranslations } from 'next-intl';
import WorldCupForm, { WorldCupFormData } from '@/components/worldcup/WorldCupForm';

export default function CreateForm() {
    const router = useRouter();
    const t = useTranslations();
    const { showAlert } = useGlobalAlert();
    const { user, isLoading: isUserLoading } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading) {
        return <Loading />;
    }

    if (!user) {
        return null;
    }

    const handleSubmit = async (data: WorldCupFormData, status: 'draft' | 'published') => {
        try {
            setIsSubmitting(true);

            // 1. Insert WorldCup
            const { data: worldcup, error: worldcupError } = await supabase
                .from('worldcups')
                .insert({
                    title: data.title,
                    description: data.description,
                    owner_id: user.id,
                    thumbnail_url: data.candidates[0]?.url || '',
                    candidate_count: data.selectedRound,
                    category: data.category,
                    is_public: status === 'published' && data.visibility === 'public',
                    visibility: data.visibility,
                    status: status
                })
                .select()
                .single();

            if (worldcupError) throw worldcupError;

            // 2. Insert Candidates
            const validCandidates = data.candidates.filter(c => c.name.trim());
            if (validCandidates.length > 0) {
                const candidatesToInsert = validCandidates.map(c => ({
                    worldcup_id: worldcup.id,
                    name: c.name,
                    image_url: c.url,
                }));

                const { error: candidatesError } = await supabase
                    .from('candidates')
                    .insert(candidatesToInsert);

                if (candidatesError) throw candidatesError;
            }

            // 3. Redirect
            if (status === 'draft') {
                router.push('/my');
            } else {
                router.push(`/play/${worldcup.id}`);
            }
            router.refresh();
        } catch (error: any) {
            console.error('Error creating WorldCup:', error);
            await showAlert(error.message || t('월드컵 생성 실패'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <WorldCupForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="create"
        />
    );
}
