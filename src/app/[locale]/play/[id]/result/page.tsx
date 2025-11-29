import { Metadata } from 'next';
import ResultClient from './ResultClient';
import { generateWorldCupMetadata } from '@/utils/metadata';

interface Props {
    params: { id: string };
    searchParams: { winnerId?: string };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    return generateWorldCupMetadata({
        worldcupId: params.id,
        winnerId: searchParams.winnerId
    });
}

export default function ResultPage() {
    return <ResultClient />;
}
