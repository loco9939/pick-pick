import { Metadata } from 'next';
import ResultClient from './ResultClient';
import { generateWorldCupMetadata } from '@/utils/metadata';

interface Props {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ winnerId?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { id } = await params;
    const { winnerId } = await searchParams;
    return generateWorldCupMetadata({
        worldcupId: id,
        winnerId: winnerId
    });
}

export default function ResultPage() {
    return <ResultClient />;
}
