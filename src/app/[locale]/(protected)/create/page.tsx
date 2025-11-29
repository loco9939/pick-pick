import { redirect } from '@/navigation';
import { createClient } from '@/lib/supabase/server';
import CreateForm from './CreateForm';

interface Props {
    params: Promise<{ locale: string }>;
}

export default async function CreatePage({ params }: Props) {
    const { locale } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect({ href: '/auth/login', locale });
    }

    return <CreateForm />;
}
