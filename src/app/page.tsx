
import Link from 'next/link';
import WorldCupCard from '@/components/worldcup/WorldCupCard';
import HeroSection from '@/components/home/HeroSection';
import CategoryChips from '@/components/home/CategoryChips';
import RealTimeTicker from '@/components/home/RealTimeTicker';
import EmptyState from '@/components/home/EmptyState';
import Pagination from '@/components/common/Pagination';
import { createClient } from '@/lib/supabase/server';
import { Play } from 'lucide-react';

export const revalidate = 0; // Disable caching for now to see updates immediately

const PAGE_SIZE = 12;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const category = params.category;
  const page = Number(params.page) || 1;
  const supabase = await createClient();

  let query = supabase
    .from('worldcups')
    .select('*', { count: 'exact' })
    .eq('is_deleted', false)
    .order('total_plays', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: worldcups, count, error } = await query.range(from, to);

  if (error) {
    console.error('Error fetching worldcups:', error);
  }

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 0;

  // Fetch best worldcup for Hero Section (independent of category)
  const { data: bestWorldCup } = await supabase
    .from('worldcups')
    .select('*')
    .eq('is_deleted', false)
    .order('total_plays', { ascending: false })
    .limit(1)
    .single();

  return (
    <>
      <div className="mt-8">
        <RealTimeTicker />
      </div>
      <div className="container py-8 px-4 mx-auto">


        {bestWorldCup && (
          <HeroSection worldcup={bestWorldCup} />
        )}

        <h1 className="mb-4 text-3xl font-bold tracking-tight">Popular WorldCups</h1>
        <CategoryChips />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {worldcups?.map((worldcup) => (
            <WorldCupCard
              key={worldcup.id}
              id={worldcup.id}
              title={worldcup.title}
              description={worldcup.description || ''}
              thumbnailUrl={worldcup.thumbnail_url || ''}
              totalPlays={worldcup.total_plays}
              candidateCount={worldcup.candidate_count || 0}
              actions={
                <div className="flex gap-2 mt-auto">
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary/10 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors">
                    <Play size={16} />
                    Play
                  </button>
                  <Link
                    href={`/play/${worldcup.id}/result`}
                    // onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    Rank
                  </Link>
                </div>
              }
            />
          ))}
          {(!worldcups || worldcups.length === 0) && <EmptyState />}
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/"
          searchParams={params}
        />
      </div>
    </>

  );
}
