import { Metadata } from 'next';
import { supabase } from '@/lib/supabase/client';
import ResultClient from './ResultClient';

interface Props {
    params: { id: string };
    searchParams: { winnerId?: string };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const winnerId = searchParams.winnerId;

    if (!winnerId) {
        return {
            title: 'Game Result - PickPick',
        };
    }

    const { data: winner } = await supabase
        .from('candidates')
        .select('name, worldcup_id')
        .eq('id', winnerId)
        .single();

    if (!winner) {
        return {
            title: 'Game Result - PickPick',
        };
    }

    const { data: worldcup } = await supabase
        .from('worldcups')
        .select('title')
        .eq('id', winner.worldcup_id)
        .single();

    return {
        title: `${winner.name} Wins! - ${worldcup?.title || 'PickPick'}`,
        description: `Check out the winner of ${worldcup?.title || 'the game'} on PickPick!`,
        openGraph: {
            title: `${winner.name} Wins! - ${worldcup?.title || 'PickPick'}`,
            description: `Check out the winner of ${worldcup?.title || 'the game'} on PickPick!`,
        },
    };
}

export default function ResultPage() {
    return <ResultClient />;
}
