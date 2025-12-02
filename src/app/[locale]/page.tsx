import { Suspense } from 'react';
import HomeSearchSection from '@/components/home/HomeSearchSection';
import RealTimeTicker from '@/components/home/RealTimeTicker';
import { createClient } from '@/lib/supabase/server';
import WorldCupList from '@/components/worldcup/WorldCupList';
import Loading from '@/components/common/Loading';

import { getTranslations } from 'next-intl/server';

export const revalidate = 0; // Disable caching for now to see updates immediately

export default async function Home() {
  const t = await getTranslations();
  const supabase = await createClient();

  // Fetch best worldcup for Hero Section (independent of category)
  // const { data: bestWorldCup } = await supabase
  //   .from('worldcups')
  //   .select('*')
  //   .eq('is_deleted', false)
  //   .eq('is_public', true)
  //   .order('total_plays', { ascending: false })
  //   .limit(1)
  //   .single();

  return (
    <>
      <div className="mt-8">
        <RealTimeTicker />
      </div>
      <div className="container py-8 px-4 mx-auto">

        <HomeSearchSection />

        <div className="my-8">
          <h1 className="mb-4 text-3xl font-bold tracking-tight">{t('인기 월드컵')}</h1>

          <Suspense fallback={<div className="flex justify-center py-12"><Loading fullScreen={false} /></div>}>
            <WorldCupList mode="home" baseUrl="/" hideCategoryChips={true} />
          </Suspense>
        </div>
      </div>
    </>

  );
}
