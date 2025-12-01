import IntroClient from './IntroClient';
import { Metadata } from 'next';
import { generateWorldCupMetadata } from '@/utils/metadata';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    return generateWorldCupMetadata({ worldcupId: id });
}

export default function IntroPage() {
    return <IntroClient />;
}
