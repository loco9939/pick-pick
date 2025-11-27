'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface CandidateThumbnailProps {
    imageUrl: string;
    name: string;
    className?: string;
    sizes?: string;
}

export default function CandidateThumbnail({ imageUrl, name, className = "object-contain", sizes }: CandidateThumbnailProps) {
    const [error, setError] = useState(false);
    const [useStandardImg, setUseStandardImg] = useState(false);

    const isValidUrl = React.useMemo(() => {
        if (!imageUrl) return false;
        try {
            new URL(imageUrl);
            return true;
        } catch {
            return imageUrl.startsWith('/');
        }
    }, [imageUrl]);

    if (error) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-muted text-lg font-bold text-muted-foreground p-2 text-center">
                {name}
            </div>
        );
    }

    if (!isValidUrl) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-muted text-lg font-bold text-muted-foreground p-2 text-center">
                {name}
            </div>
        );
    }

    if (useStandardImg) {
        return (
            <img
                src={imageUrl}
                alt={name}
                className={`h-full w-full ${className}`}
                onError={() => setError(true)}
            />
        );
    }

    return (
        <Image
            src={imageUrl}
            alt={name}
            fill
            className={className}
            sizes={sizes}
            onError={() => setUseStandardImg(true)}
            unoptimized={true} // Try unoptimized first to avoid Vercel timeouts/limits if that's the issue
        />
    );
}
