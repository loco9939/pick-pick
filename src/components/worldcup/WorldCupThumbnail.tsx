'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';

interface WorldCupThumbnailProps {
    title: string;
    thumbnailUrl: string;
}

const WorldCupThumbnail: React.FC<WorldCupThumbnailProps> = ({ title, thumbnailUrl }) => {
    const [imageError, setImageError] = useState(false);

    const isValidUrl = useMemo(() => {
        if (!thumbnailUrl) return false;
        try {
            new URL(thumbnailUrl);
            return true;
        } catch {
            return thumbnailUrl.startsWith('/');
        }
    }, [thumbnailUrl]);

    return (
        <div className="aspect-video relative overflow-hidden bg-muted flex items-center justify-center">
            {!imageError && isValidUrl ? (
                <Image
                    src={thumbnailUrl}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-xl font-bold text-muted-foreground line-clamp-2">{title}</span>
                </div>
            )}
        </div>
    );
};

export default WorldCupThumbnail;
