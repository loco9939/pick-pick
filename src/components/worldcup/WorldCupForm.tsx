'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import ImagePreviewModal from '@/components/common/ImagePreviewModal';
import StepIndicator from '@/components/common/StepIndicator';
import WorldCupBasicInfo from '@/components/worldcup/WorldCupBasicInfo';
import CandidateFormList from '@/components/worldcup/CandidateFormList';
import { useGlobalAlert } from '@/components/common/GlobalAlertProvider';

export interface FormCandidate {
    id?: string;
    name: string;
    url: string;
}

export interface WorldCupFormData {
    title: string;
    description: string;
    category: string;
    visibility: 'public' | 'private';
    selectedRound: number;
    candidates: FormCandidate[];
}

interface WorldCupFormProps {
    initialData?: WorldCupFormData;
    onSubmit: (data: WorldCupFormData, status: 'draft' | 'published') => Promise<void>;
    isSubmitting: boolean;
    mode: 'create' | 'edit';
}

export default function WorldCupForm({ initialData, onSubmit, isSubmitting, mode }: WorldCupFormProps) {
    const t = useTranslations();
    const { showAlert } = useGlobalAlert();

    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [category, setCategory] = useState(initialData?.category || 'all');
    const [visibility, setVisibility] = useState<'public' | 'private'>(initialData?.visibility || 'public');
    const [selectedRound, setSelectedRound] = useState<number>(initialData?.selectedRound || 4);
    const [candidates, setCandidates] = useState<FormCandidate[]>(initialData?.candidates || []);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [step, setStep] = useState(1);

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

    const handleCandidateChange = (index: number, field: keyof FormCandidate, value: string) => {
        const newCandidates = [...candidates];
        // @ts-ignore
        newCandidates[index][field] = value;
        setCandidates(newCandidates);
    };

    const handleNext = () => {
        if (step === 1) {
            if (!title.trim()) {
                showAlert(t('제목은 필수입니다'));
                return;
            }
            setStep(2);
        }
    };

    const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
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

        await onSubmit({
            title,
            description,
            category,
            visibility,
            selectedRound,
            candidates
        }, isDraft ? 'draft' : 'published');
    };

    return (
        <div className="container mx-auto max-w-4xl py-12 px-6">
            {/* Image Preview Modal */}
            <ImagePreviewModal
                isOpen={!!previewImage}
                imageUrl={previewImage}
                onClose={() => setPreviewImage(null)}
            />

            <StepIndicator currentStep={step} totalSteps={2} />

            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight">
                    {mode === 'create' ? t('월드컵 생성') : t('월드컵 수정')}
                </h1>
                <p className="text-muted-foreground">
                    {mode === 'create' ? t('나만의 이상형 월드컵을 만들어보세요') : t('월드컵 정보를 수정하세요')}
                </p>
                <div className="text-left rounded-md bg-yellow-500/10 p-4 text-sm text-yellow-500 border border-yellow-500/20 flex items-start gap-3 mt-4">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div className="space-y-1">
                        <p className="font-semibold">{t('경고')}</p>
                        <p>{t('성인 콘텐츠, 혐오 발언 등은 제재 대상이 될 수 있습니다')}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
                {step === 1 && (
                    <div className="space-y-8">
                        <WorldCupBasicInfo
                            title={title}
                            onTitleChange={setTitle}
                            description={description}
                            onDescriptionChange={setDescription}
                            category={category}
                            onCategoryChange={setCategory}
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t('공개 여부')}
                            </label>
                            <select
                                value={visibility}
                                onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="public">{t('전체 공개 (누구나 플레이 가능)')}</option>
                                <option value="private">{t('비공개 (링크가 있는 사람만)')}</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleNext}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
                        >
                            {t('다음 단계')}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t('토너먼트 크기')}
                            </label>
                            <select
                                value={selectedRound}
                                onChange={(e) => setSelectedRound(Number(e.target.value))}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {[4, 8, 16, 32, 64].map(size => (
                                    <option key={size} value={size}>{t('{count}강 (후보 {count}명 필요)', { count: size })}</option>
                                ))}
                            </select>
                        </div>

                        <CandidateFormList
                            candidates={candidates}
                            selectedRound={selectedRound}
                            onCandidateChange={handleCandidateChange}
                            onPreviewImage={setPreviewImage}
                        />

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
                            >
                                {t('이전')}
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
                                {isSubmitting ? (mode === 'create' ? t('생성 중') : t('저장 중')) : (mode === 'create' ? t('월드컵 만들기') : t('변경사항 저장'))}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
