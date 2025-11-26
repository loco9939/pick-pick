import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CreateForm from './CreateForm';

export default async function CreatePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    return <CreateForm />;
}
