import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './page';

// Mock WorldCupCard component
jest.mock('@/components/worldcup/WorldCupCard', () => {
    return function MockWorldCupCard({ title }: { title: string }) {
        return <div data-testid="worldcup-card">{title}</div>;
    };
});

// Mock Supabase
const mockSelect = jest.fn();
const mockOrder = jest.fn();

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
        const ui = await Home();
        render(ui);
        const cards = screen.getAllByTestId('worldcup-card');
        expect(cards).toHaveLength(2);
    });

    it('renders the main heading', async () => {
        const ui = await Home();
        render(ui);
        const heading = screen.getByRole('heading', { level: 1, name: /popular worldcups/i });
        expect(heading).toBeInTheDocument();
    });
});
