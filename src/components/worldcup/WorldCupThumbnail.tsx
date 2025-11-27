'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';

interface WorldCupThumbnailProps {
    title: string;
    thumbnailUrl: string;
    className?: string;
}

const WorldCupThumbnail: React.FC<WorldCupThumbnailProps> = ({ title, thumbnailUrl, className }) => {
    const [error, setError] = useState(false);
    const [useStandardImg, setUseStandardImg] = useState(false);

    const isValidUrl = useMemo(() => {
        if (!thumbnailUrl) return false;
        try {
            new URL(thumbnailUrl);
            return true;
        } catch {
            return thumbnailUrl.startsWith('/');
        }
    }, [thumbnailUrl]);

    const renderContent = () => {
        if (error || !isValidUrl) {
            return (
                <div className="flex flex-col items-center justify-center p-4 text-center h-full w-full">
                    <span className="text-xl font-bold text-muted-foreground line-clamp-2">{title}</span>
                </div>
            );
        }

        if (useStandardImg) {
            return (
                <img
                    src={thumbnailUrl}
                    alt={title}
                    className="h-full w-full object-contain"
                    onError={() => setError(true)}
                />
            );
        }

        return (
            <Image
                src={thumbnailUrl}
                alt={title}
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                onError={() => setUseStandardImg(true)}
                unoptimized={true}
            />
        );
    };

    return (
        <div className={`aspect-video relative overflow-hidden bg-muted flex items-center justify-center ${className}`}>
            {renderContent()}
        </div>
    );
};

export default WorldCupThumbnail;
