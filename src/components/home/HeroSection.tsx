import { Link } from '@/navigation';
import Image from 'next/image';
import { ArrowRight, Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Database } from '@/lib/supabase/database.types';

type WorldCup = Database['public']['Tables']['worldcups']['Row'];

interface HeroSectionProps {
    worldcup: WorldCup;
}

export default function HeroSection({ worldcup }: HeroSectionProps) {
    const t = useTranslations();

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

            <div className="relative z-10 grid gap-8 p-8 md:grid-cols-2 md:p-12 items-center">
                <div className="flex flex-col space-y-6">
                    <div className="inline-flex items-center space-x-2 rounded-full bg-fuchsia-500/10 px-3 py-1 text-sm font-medium text-fuchsia-400 w-fit border border-fuchsia-500/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
                        </span>
                        <span>{t('실시간 인기 월드컵')} 🔥</span>
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        {worldcup.title}
                    </h1>

                    <p className="max-w-xl text-lg text-slate-400 leading-relaxed">
                        {worldcup.description}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link
                            href={`/play/${worldcup.id}/intro`}
                            className="inline-flex items-center justify-center rounded-lg bg-fuchsia-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition-all hover:bg-fuchsia-500 hover:scale-105 hover:shadow-fuchsia-500/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            {t('지금 시작하기')}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        <Link
                            href={`/play/${worldcup.id}/result`}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800/50 px-8 py-3 text-sm font-semibold text-slate-300 backdrop-blur-sm transition-all hover:bg-slate-800 hover:text-white hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            <Trophy className="mr-2 h-4 w-4" />
                            {t('랭킹 보기')}
                        </Link>
                    </div>
                </div>

                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-700/50 shadow-2xl group">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10" />
                    {worldcup.thumbnail_url ? (
                        <Image
                            src={worldcup.thumbnail_url}
                            alt={worldcup.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            priority
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-800">
                            <Trophy className="h-16 w-16 text-slate-600" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
