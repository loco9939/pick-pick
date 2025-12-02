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
}

export default function WorldCupBasicInfo({
    title,
    onTitleChange,
    description,
    onDescriptionChange,
    category,
    onCategoryChange,
}: WorldCupBasicInfoProps) {
    const t = useTranslations();
    return (
        <div className="space-y-8">
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
        </div>
    );
}
