import WorldCupCard from '@/components/worldcup/WorldCupCard';
import { supabase } from '@/lib/supabase/client';

export const revalidate = 0; // Disable caching for now to see updates immediately

export default async function Home() {
  const { data: worldcups, error } = await supabase
    .from('worldcups')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching worldcups:', error);
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Popular WorldCups</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {worldcups?.map((worldcup) => (
          <WorldCupCard
            key={worldcup.id}
            id={worldcup.id}
            title={worldcup.title}
            description={worldcup.description || ''}
            thumbnailUrl={worldcup.thumbnail_url || 'https://placehold.co/600x400/png?text=No+Image'}
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
