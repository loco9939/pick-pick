import { createClient } from '@/lib/supabase/server';
import IntroClient from './IntroClient';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const supabase = await createClient();
    const { data: worldcup } = await supabase
        .from('worldcups')
        .select('title, description')
        .eq('id', params.id)
        .single();

    if (!worldcup) {
        return {
            title: 'WorldCup Not Found - PickPick',
        };
    }

    return {
        title: `${worldcup.title} - PickPick`,
        description: worldcup.description || `Play ${worldcup.title} on PickPick`,
        openGraph: {
            title: `${worldcup.title} - PickPick`,
            description: worldcup.description || `Play ${worldcup.title} on PickPick`,
        },
    };
}

export default function IntroPage() {
    return <IntroClient />;
}
