import React from 'react';

interface LoadingProps {
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

export default function Loading({ text = 'Loading...', fullScreen = true, className = '' }: LoadingProps) {
    const containerClasses = fullScreen
        ? "flex h-screen flex-col items-center justify-center gap-4 bg-background"
        : "flex flex-col items-center justify-center gap-4 py-12";

    return (
        <div className={`${containerClasses} ${className}`}>
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-lg font-medium text-muted-foreground animate-pulse">
                {text}
            </p>
        </div>
    );
}
