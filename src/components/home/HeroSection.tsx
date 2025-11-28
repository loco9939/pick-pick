import Link from 'next/link';
import { Database } from '@/lib/supabase/database.types';

type WorldCup = Database['public']['Tables']['worldcups']['Row'];

interface HeroSectionProps {
    worldcup: WorldCup;
}

export default function HeroSection({ worldcup }: HeroSectionProps) {
    if (!worldcup) return null;

    return (
        <div className="relative w-full overflow-hidden rounded-3xl bg-background shadow-2xl mb-12">
            {/* Background Image with Blur */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-60 blur-sm transition-transform duration-700 hover:scale-105"
                style={{ backgroundImage: `url(${worldcup.thumbnail_url || '/placeholder.png'})` }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-background/95 via-background/80 to-transparent" />

            {/* Content */}
            <div className="relative z-20 flex flex-col justify-center px-8 py-16 md:px-12 lg:py-24">
                <div className="mb-4 inline-flex w-fit items-center rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-500 ring-1 ring-inset ring-red-500/20 backdrop-blur-md">
                    <span className="mr-1.5 flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    Real-time hot world cup 🔥
                </div>4

                <h1 className="mb-4 max-w-2xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {worldcup.title}
                </h1>

                <p className="mb-8 max-w-xl text-lg text-muted-foreground line-clamp-2">
                    {worldcup.description}
                </p>

                <div className="flex flex-wrap gap-4">
                    <Link
                        href={`/play/${worldcup.id}`}
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-violet-500/25 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                    >
                        Get started now
                        <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </Link>

                    <Link
                        href={`/play/${worldcup.id}/result`}
                        className="inline-flex items-center justify-center rounded-full border border-input bg-background/50 px-8 py-4 text-lg font-medium backdrop-blur-sm transition-all hover:bg-accent hover:text-accent-foreground hover:scale-105 hover:shadow-lg"
                    >
                        View ranking
                    </Link>
                </div>
            </div>
        </div>
    );
}
