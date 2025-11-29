import Link from 'next/link';
import { PlusCircle } from 'lucide-react';


export default function CreateBanner() {
    return (
        <div className="relative overflow-hidden rounded-xl border border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-blue-500/10 p-8 md:p-12">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Have a brilliant idea?
                </h2>
                <p className="mb-8 max-w-2xl text-lg text-slate-300">
                    Create your own WorldCup and share it with the world!
                    <br className="hidden sm:inline" />
                    Anyone can create and play.
                </p>
                <Link
                    href="/create"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-8 gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white border-none shadow-[0_0_20px_rgba(192,38,211,0.3)] hover:shadow-[0_0_30px_rgba(192,38,211,0.5)] duration-300"
                >
                    <PlusCircle className="h-5 w-5" />
                    Create WorldCup
                </Link>
            </div>
        </div>
    );
}
