import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MyPageClient from './MyPageClient';

export default async function MyPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    return <MyPageClient />;
}
