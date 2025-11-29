import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './page';

// Mock navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
    useSearchParams: () => ({
        get: jest.fn(),
        toString: jest.fn(),
    }),
    useParams: () => ({ id: '1' }),
}));

// Mock WorldCupCard component
jest.mock('@/components/worldcup/WorldCupCard', () => {
    return function MockWorldCupCard({ title }: { title: string }) {
        return <div data-testid="worldcup-card">{title}</div>;
    };
});

// Mock new components
jest.mock('@/components/home/HeroSection', () => {
    return function MockHeroSection() {
        return <div data-testid="hero-section">Hero Section</div>;
    };
});

jest.mock('@/components/home/CategoryChips', () => {
    return function MockCategoryChips() {
        return <div data-testid="category-chips">Category Chips</div>;
    };
});

jest.mock('@/components/home/RealTimeTicker', () => {
    return function MockRealTimeTicker() {
        return <div data-testid="real-time-ticker">Real Time Ticker</div>;
    };
});

// Mock Supabase
const mockSelect = jest.fn();
const mockOrder = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(() => ({
        from: jest.fn(() => {
            const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { id: 'best', title: 'Best WorldCup', description: 'Best Desc', thumbnail_url: 'best_url', total_plays: 1000 },
                    error: null,
                }),
                then: function (resolve: any) {
                    resolve({
                        data: [
                            { id: '1', title: 'Test WorldCup 1', description: 'Desc 1', thumbnail_url: 'url1', total_plays: 100 },
                            { id: '2', title: 'Test WorldCup 2', description: 'Desc 2', thumbnail_url: 'url2', total_plays: 50 },
                        ],
                        error: null,
                    });
                }
            };
            return mockChain;
        }),
    })),
}));

jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: () => ({
            select: mockSelect,
        }),
    },
}));

mockSelect.mockReturnValue({
    eq: jest.fn().mockReturnValue({
        order: mockOrder,
    }),
});

describe('Home Page', () => {
    beforeEach(() => {
        mockOrder.mockResolvedValue({
            data: [
                { id: '1', title: 'WorldCup 1', description: 'Desc 1', thumbnail_url: 'url1' },
                { id: '2', title: 'WorldCup 2', description: 'Desc 2', thumbnail_url: 'url2' },
            ],
            error: null,
        });
    });

    it('renders a list of worldcups', async () => {
        const ui = await Home({ searchParams: Promise.resolve({}) });
        render(ui);
        const cards = screen.getAllByTestId('worldcup-card');
        expect(cards).toHaveLength(2);
    });

    it('renders the main heading', async () => {
        const ui = await Home({ searchParams: Promise.resolve({}) });
        render(ui);
        const heading = screen.getByRole('heading', { level: 1, name: /popular worldcups/i });
        expect(heading).toBeInTheDocument();
    });

    it('renders the Hero Section', async () => {
        const ui = await Home({ searchParams: Promise.resolve({}) });
        render(ui);
        expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });

    it('renders the Category Chips', async () => {
        const ui = await Home({ searchParams: Promise.resolve({}) });
        render(ui);
        expect(screen.getByTestId('category-chips')).toBeInTheDocument();
    });

    it('renders the Real Time Ticker', async () => {
        const ui = await Home({ searchParams: Promise.resolve({}) });
        render(ui);
        expect(screen.getByTestId('real-time-ticker')).toBeInTheDocument();
    });
});
