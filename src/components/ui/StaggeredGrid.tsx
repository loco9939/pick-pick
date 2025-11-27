'use client';

import { motion } from 'framer-motion';

export default function StaggeredGrid({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial="hidden"
            animate="show"
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.1
                    }
                }
            }}
        >
            {children}
        </motion.div>
    );
}

export function StaggeredItem({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
        >
            {children}
        </motion.div>
    );
}
