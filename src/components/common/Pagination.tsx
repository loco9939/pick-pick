import { Link } from '@/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl?: string;
    searchParams?: { [key: string]: string | string[] | undefined };
    onPageChange?: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, baseUrl, searchParams, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const isClientSide = !!onPageChange;

    const createPageUrl = (page: number) => {
        if (!baseUrl) return '#';
        const params = new URLSearchParams();
        if (searchParams) {
            Object.entries(searchParams).forEach(([key, value]) => {
                if (key !== 'page' && typeof value === 'string') {
                    params.set(key, value);
                }
            });
        }
        params.set('page', page.toString());
        return `${baseUrl}?${params.toString()}`;
    };

    const renderPageButton = (page: number, content: React.ReactNode, isDisabled: boolean, isCurrent: boolean) => {
        const baseClass = "flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-all duration-200";
        const activeClass = "bg-primary text-white shadow-lg shadow-primary/25 scale-105 font-bold";
        const inactiveClass = "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white hover:scale-105";
        const disabledClass = "pointer-events-none opacity-50";

        const className = `${baseClass} ${isCurrent ? activeClass : inactiveClass} ${isDisabled ? disabledClass : ''}`;

        if (isClientSide) {
            return (
                <button
                    key={page}
                    onClick={() => onPageChange?.(page)}
                    disabled={isDisabled}
                    className={className}
                >
                    {content}
                </button>
            );
        }

        return (
            <Link
                key={page}
                href={createPageUrl(page)}
                className={className}
                aria-disabled={isDisabled}
            >
                {content}
            </Link>
        );
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(renderPageButton(i, i, false, currentPage === i));
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            {renderPageButton(
                Math.max(1, currentPage - 1),
                <ChevronLeft className="h-4 w-4" />,
                currentPage === 1,
                false
            )}

            {renderPageNumbers()}

            {renderPageButton(
                Math.min(totalPages, currentPage + 1),
                <ChevronRight className="h-4 w-4" />,
                currentPage === totalPages,
                false
            )}
        </div>
    );
}
