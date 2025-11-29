import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

interface GenerateMetadataProps {
    worldcupId: string;
    winnerId?: string;
}

export async function generateWorldCupMetadata({ worldcupId, winnerId }: GenerateMetadataProps): Promise<Metadata> {
    const supabase = await createClient();

    // Fetch WorldCup data
    const { data: worldcup } = await supabase
        .from('worldcups')
        .select('title, description, thumbnail_url')
        .eq('id', worldcupId)
        .single();

    if (!worldcup) {
        return {
            title: 'WorldCup Not Found - PickPick',
            description: 'The requested WorldCup could not be found.',
        };
    }

    let title = `${worldcup.title} - PickPick`;
    let description = worldcup.description || `Play ${worldcup.title} on PickPick`;
    let imageUrl = worldcup.thumbnail_url || '/pick-pick(1200x630).png';

    // If winnerId is present, fetch Winner data
    if (winnerId) {
        const { data: winner } = await supabase
            .from('candidates')
            .select('name, image_url')
            .eq('id', winnerId)
            .single();

        if (winner) {
            title = `${winner.name} Wins! - ${worldcup.title}`;
            description = `Check out the winner of ${worldcup.title} on PickPick!`;
            if (winner.image_url) {
                imageUrl = winner.image_url;
            }
        }
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            type: 'website',
            siteName: 'PickPick',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}
