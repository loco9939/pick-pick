import { Suspense } from 'react';
import Link from 'next/link';
import HeroSection from '@/components/home/HeroSection';
import RealTimeTicker from '@/components/home/RealTimeTicker';
import CreateBanner from '@/components/home/CreateBanner';
import { createClient } from '@/lib/supabase/server';
import WorldCupList from '@/components/worldcup/WorldCupList';
import Loading from '@/components/common/Loading';

export const revalidate = 0; // Disable caching for now to see updates immediately

export default async function Home() {
  const supabase = await createClient();

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

        <div className="my-12">
          <CreateBanner />
        </div>

        <h1 className="mb-4 text-3xl font-bold tracking-tight">Popular WorldCups</h1>

        <Suspense fallback={<div className="flex justify-center py-12"><Loading fullScreen={false} /></div>}>
          <WorldCupList mode="home" baseUrl="/" />
        </Suspense>
      </div>
    </>

  );
}
