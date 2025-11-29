'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/navigation';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';
import ImagePreviewModal from '@/components/common/ImagePreviewModal';
import Loading from '@/components/common/Loading';
import CandidateFormList from '@/components/worldcup/CandidateFormList';
import { useGlobalAlert } from '@/components/common/GlobalAlertProvider';
import WorldCupBasicInfo from '@/components/worldcup/WorldCupBasicInfo';
import { useTranslations } from 'next-intl';

interface Candidate {
    name: string;
    url: string;
}

export default function CreateForm() {
    const router = useRouter();
    const t = useTranslations();
    const { showAlert } = useGlobalAlert();
    const { user, isLoading: isUserLoading } = useUser();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('all');
    const [selectedRound, setSelectedRound] = useState<number>(4);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
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

        if (!title.trim()) {
            await showAlert(t('제목은 필수입니다'));
            return;
        }

        const validCandidates = candidates.filter(c => c.name.trim());
        if (validCandidates.length !== selectedRound) {
            await showAlert(t('{count}명의 후보를 모두 입력해주세요', { count: selectedRound }));
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
                    category,
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
            await showAlert(error.message || t('월드컵 생성 실패'));
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
                <h1 className="text-3xl font-bold tracking-tight">{t('월드컵 생성')}</h1>
                <p className="text-muted-foreground">{t('나만의 이상형 월드컵을 만들어보세요')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
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

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
                >
                    {isSubmitting ? t('생성 중') : t('월드컵 만들기')}
                </button>
            </form>
        </div>
    );
}
