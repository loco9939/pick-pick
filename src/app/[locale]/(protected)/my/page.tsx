import { Suspense } from 'react';
import { redirect } from '@/navigation';
import { createClient } from '@/lib/supabase/server';
import MyPageClient from './MyPageClient';
import Loading from '@/components/common/Loading';

interface Props {
    params: Promise<{ locale: string }>;
}

export default async function MyPage({ params }: Props) {
    const { locale } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect({ href: '/auth/login', locale });
    }

    return (
        <Suspense fallback={<Loading fullScreen={false} />}>
            <MyPageClient />
        </Suspense>
    );
}
