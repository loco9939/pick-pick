import { CATEGORIES } from '@/constants/categories';
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface WorldCupBasicInfoProps {
    title: string;
    onTitleChange: (value: string) => void;
    description: string;
    onDescriptionChange: (value: string) => void;
    category: string;
    onCategoryChange: (value: string) => void;
    selectedRound: number;
    onRoundChange: (value: number) => void;
}

export default function WorldCupBasicInfo({
    title,
    onTitleChange,
    description,
    onDescriptionChange,
    category,
    onCategoryChange,
    selectedRound,
    onRoundChange,
}: WorldCupBasicInfoProps) {
    const t = useTranslations();
    return (
        <div className="space-y-8">
            <div className="rounded-md bg-yellow-500/10 p-4 text-sm text-yellow-500 border border-yellow-500/20 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div className="space-y-1">
                    <p className="font-semibold">{t('경고')}</p>
                    <p>{t('성인 콘텐츠, 혐오 발언 등은 제재 대상이 될 수 있습니다')}</p>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t('제목')}
                </label>
                <input
                    id="title"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={t('예: K-POP 여자 아이돌 월드컵')}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t('설명')}
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={t('월드컵에 대해 설명해주세요')}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t('카테고리')}
                </label>
                <select
                    value={category}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{t(cat.label)}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t('토너먼트 크기')}
                </label>
                <select
                    value={selectedRound}
                    onChange={(e) => onRoundChange(Number(e.target.value))}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {[4, 8, 16, 32, 64].map(size => (
                        <option key={size} value={size}>{t('{count}강 (후보 {count}명 필요)', { count: size })}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
