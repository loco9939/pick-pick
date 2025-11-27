
import Link from 'next/link';
import WorldCupCard from '@/components/worldcup/WorldCupCard';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0; // Disable caching for now to see updates immediately

export default async function Home() {
  const supabase = await createClient();
  const { data: worldcups, error } = await supabase
    .from('worldcups')
    .select('*')
    .eq('is_deleted', false)
    .order('total_plays', { ascending: false });

  if (error) {
    console.error('Error fetching worldcups:', error);
  }

  return (
    <div className="container py-8 px-4">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Popular WorldCups</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {worldcups?.map((worldcup) => (
          <WorldCupCard
            key={worldcup.id}
            id={worldcup.id}
            title={worldcup.title}
            description={worldcup.description || ''}
            thumbnailUrl={worldcup.thumbnail_url || 'https://placehold.co/600x400/png?text=No+Image'}
            totalPlays={worldcup.total_plays}
            actions={
              <div className="flex justify-end">
                <Link href={`/play/${worldcup.id}/result`} className="text-sm font-medium text-primary hover:underline">
                  View Stats
                </Link>
              </div>
            }
          />
        ))}
        {(!worldcups || worldcups.length === 0) && (
          <p className="text-muted-foreground col-span-full text-center py-10">
            No WorldCups found. Create one!
          </p>
        )}
      </div>
    </div>
  );
}
