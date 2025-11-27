import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Candidate } from '@/hooks/useGameLogic';

interface GameCardProps {
    candidate: Candidate;
    onClick: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ candidate, onClick }) => {
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

    return (
        <motion.button
            onClick={onClick}
            className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="relative flex-1 w-full overflow-hidden bg-muted flex items-center justify-center">
                {!imageError && isValidUrl ? (
                    <>
                        <Image
                            src={candidate.image_url}
                            alt={candidate.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            onError={() => setImageError(true)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                        <span className="text-2xl font-bold text-muted-foreground">{candidate.name}</span>
                    </div>
                )}
            </div>
            <div className="relative z-10 flex h-16 w-full items-center justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
                <h3 className="text-lg font-semibold tracking-tight">{candidate.name}</h3>
            </div>
        </motion.button>
    );
};

export default GameCard;
