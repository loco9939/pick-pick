'use client';

import React, { useState } from 'react';

interface CandidateThumbnailProps {
    imageUrl: string;
    name: string;
    className?: string;
    sizes?: string; // Kept for compatibility but unused
}

export default function CandidateThumbnail({ imageUrl, name, className = "object-contain" }: CandidateThumbnailProps) {
    const [error, setError] = useState(false);

    const isValidUrl = React.useMemo(() => {
        if (!imageUrl) return false;
        try {
            new URL(imageUrl);
            return true;
        } catch {
            return imageUrl.startsWith('/');
        }
    }, [imageUrl]);

    if (error || !isValidUrl) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-muted text-lg font-bold text-muted-foreground p-2 text-center">
                {name}
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={name}
            className={`h-full w-full ${className}`}
            onError={() => setError(true)}
        />
    );
}
