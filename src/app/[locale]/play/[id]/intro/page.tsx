import IntroClient from './IntroClient';
import { Metadata } from 'next';
import { generateWorldCupMetadata } from '@/utils/metadata';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    return generateWorldCupMetadata({ worldcupId: params.id });
}

export default function IntroPage() {
    return <IntroClient />;
}
