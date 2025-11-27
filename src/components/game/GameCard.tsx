import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Candidate } from '@/hooks/useGameLogic';

interface GameCardProps {
    candidate: Candidate;
    onClick: () => void;
    isSelected?: boolean;
    isUnselected?: boolean;
    side?: 'left' | 'right';
}

const GameCard: React.FC<GameCardProps> = ({ candidate, onClick, isSelected, isUnselected, side }) => {
    const [imageError, setImageError] = React.useState(false);

    const isValidUrl = React.useMemo(() => {
        if (!candidate.image_url) return false;
        try {
            new URL(candidate.image_url);
            return true;
        } catch {
            return candidate.image_url.startsWith('/');
        }
    }, [candidate.image_url]);

    const variants = {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        selected: {
            scale: 1.1,
            opacity: 1,
            zIndex: 10,
            boxShadow: side === 'left'
                ? "0 0 40px -10px rgba(6, 182, 212, 0.5)" // cyan-500
                : side === 'right'
                    ? "0 0 40px -10px rgba(244, 63, 94, 0.5)" // rose-500
                    : "0 20px 25px -5px rgb(0 0 0 / 0.1)",
            transition: { duration: 0.5 }
        },
        unselected: {
            scale: 0.8,
            opacity: 0.3,
            filter: "grayscale(100%) blur(4px)",
            transition: { duration: 0.5 }
        }
    };

    const borderClass = side === 'left'
        ? 'hover:border-cyan-500 focus:ring-cyan-500'
        : side === 'right'
            ? 'hover:border-rose-500 focus:ring-rose-500'
            : 'hover:border-primary focus:ring-primary';

    const gradientClass = side === 'left'
        ? 'from-cyan-500/20'
        : side === 'right'
            ? 'from-rose-500/20'
            : 'from-primary/20';

    return (
        <motion.button
            onClick={onClick}
            className={`group relative flex h-full w-full flex-col overflow-hidden rounded-xl border-2 border-transparent bg-card text-card-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300 ${borderClass}`}
            variants={variants}
            initial="initial"
            animate={isSelected ? "selected" : isUnselected ? "unselected" : "animate"}
            whileHover={!isSelected && !isUnselected ? { scale: 1.05, zIndex: 50, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)" } : undefined}
            whileTap={!isSelected && !isUnselected ? { scale: 0.98 } : undefined}
        >
            <div className="relative flex-1 w-full overflow-hidden bg-muted flex items-center justify-center bg-black">
                {!imageError && isValidUrl ? (
                    <>
                        <Image
                            src={candidate.image_url}
                            alt={candidate.name}
                            fill
                            className="object-contain transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            onError={() => setImageError(true)}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${gradientClass} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full p-4 text-center bg-black">
                        <span className="text-2xl font-bold text-muted-foreground">{candidate.name}</span>
                    </div>
                )}
            </div>
            <div className="relative z-10 flex h-16 w-full items-center justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-t border-border/50">
                <h3 className="text-lg font-bold tracking-tight group-hover:text-white transition-colors">{candidate.name}</h3>
            </div>
        </motion.button>
    );
};

export default GameCard;
