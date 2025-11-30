'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const t = useTranslations();

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
            <h2 className="mb-4 text-4xl font-bold">{t('오류가 발생했습니다')}</h2>
            <p className="mb-8 text-muted-foreground">
                {t('잠시 후 다시 시도해주세요')}
            </p>
            <Link
                href="/"
                className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
                {t('홈으로 돌아가기')}
            </Link>
        </div>
    );
}
