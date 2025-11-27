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
            <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-bold text-muted-foreground p-2 text-center">
                {name}
            </div>
        );
    }

    return (
        <Image
            src={imageUrl}
            alt={name}
            fill
            className={className}
            sizes={sizes}
            onError={() => setError(true)}
        />
    );
}
