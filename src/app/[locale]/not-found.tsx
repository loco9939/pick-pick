'use client';

import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

export default function NotFound() {
    const t = useTranslations();

    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
            <h2 className="mb-4 text-4xl font-bold">{t('페이지를 찾을 수 없습니다')}</h2>
            <p className="mb-8 text-muted-foreground">
                {t('요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다')}
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
