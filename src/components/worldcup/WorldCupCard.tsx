import React from 'react';
import Image from 'next/image';

import Link from 'next/link';

interface WorldCupCardProps {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    actions?: React.ReactNode;
}

const WorldCupCard: React.FC<WorldCupCardProps> = ({ id, title, description, thumbnailUrl, actions }) => {
    return (
        <div className="group relative block overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
            <Link href={`/play/${id}/intro`} className="block">
                <div className="aspect-video relative overflow-hidden">
                    <Image
                        src={thumbnailUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <div className="p-4">
                    <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{description}</p>
                </div>
            </Link>
            {actions && <div className="border-t p-4">{actions}</div>}
        </div>
    );
};

export default WorldCupCard;
