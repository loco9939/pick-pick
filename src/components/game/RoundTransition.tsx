import React from 'react';
import { motion } from 'framer-motion';

interface RoundTransitionProps {
    round: string;
}

const RoundTransition: React.FC<RoundTransitionProps> = ({ round }) => {
    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="flex flex-col items-center justify-center"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    duration: 0.5
                }}
            >
                <h2 className="text-6xl font-black tracking-tighter text-primary md:text-8xl">
                    {round}
                </h2>
                <p className="mt-4 text-xl font-medium text-muted-foreground animate-pulse">
                    Starting...
                </p>
            </motion.div>
        </motion.div>
    );
};

export default RoundTransition;
