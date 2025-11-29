import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MyPageClient from './MyPageClient';
import Loading from '@/components/common/Loading';

export default async function MyPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    return (
        <Suspense fallback={<Loading fullScreen={false} />}>
            <MyPageClient />
        </Suspense>
    );
}
