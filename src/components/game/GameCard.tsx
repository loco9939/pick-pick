import React from 'react';
import { motion } from 'framer-motion';
import CandidateThumbnail from './CandidateThumbnail';
import { Candidate } from '@/hooks/useGameLogic';

interface GameCardProps {
    candidate: Candidate;
    onClick: () => void;
    isSelected?: boolean;
    isUnselected?: boolean;
    side?: 'left' | 'right';
}

const GameCard: React.FC<GameCardProps> = ({ candidate, onClick, isSelected, isUnselected, side }) => {

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
            className={`group relative flex h-full w-full flex-col overflow-hidden border-2 border-transparent bg-card text-card-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300 ${borderClass}`}
            variants={variants}
            initial="initial"
            animate={isSelected ? "selected" : isUnselected ? "unselected" : "animate"}
            whileHover={!isSelected && !isUnselected ? { scale: 1.05, zIndex: 50, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)" } : undefined}
            whileTap={!isSelected && !isUnselected ? { scale: 0.98 } : undefined}
        >
            <div className="relative flex-1 w-full overflow-hidden bg-muted flex items-center justify-center bg-black">
                <CandidateThumbnail
                    imageUrl={candidate.image_url}
                    name={candidate.name}
                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${gradientClass} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                {/* Title Overlay */}
                <div className="absolute bottom-2 left-0 right-0 z-20 bg-black w-full py-4 px-4 text-center">
                    <h3 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">{candidate.name}</h3>
                </div>
            </div>
        </motion.button>
    );
};

export default GameCard;
