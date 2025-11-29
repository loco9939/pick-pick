import { redirect } from '@/navigation';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import EditForm from './EditForm';

interface Props {
    params: Promise<{ id: string; locale: string }>;
}

export default async function EditPage({ params }: Props) {
    const { id, locale } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect({ href: '/auth/login', locale });
        return null;
    }

    // Fetch WorldCup
    const { data: worldcup, error: wcError } = await supabase
        .from('worldcups')
        .select('*')
        .eq('id', id)
        .single();

    if (wcError || !worldcup) {
        notFound();
    }

    // Check ownership
    if (worldcup.owner_id !== user.id) {
        redirect({ href: '/', locale }); // Or show unauthorized error
    }

    // Fetch Candidates
    const { data: candidates, error: cError } = await supabase
        .from('candidates')
        .select('*')
        .eq('worldcup_id', id);

    if (cError) {
        console.error('Error fetching candidates:', cError);
        // Handle error appropriately, maybe show empty candidates or error page
    }

    return <EditForm worldcup={worldcup} candidates={candidates || []} />;
}
