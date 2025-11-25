import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './page';

// Mock WorldCupCard component
jest.mock('@/components/worldcup/WorldCupCard', () => {
    return function MockWorldCupCard({ title }: { title: string }) {
        return <div data-testid="worldcup-card">{title}</div>;
    };
});

describe('Home Page', () => {
    it('renders a list of worldcups', () => {
        render(<Home />);
        const cards = screen.getAllByTestId('worldcup-card');
        expect(cards.length).toBeGreaterThan(0);
    });

    it('renders the main heading', () => {
        render(<Home />);
        const heading = screen.getByRole('heading', { level: 1, name: /popular worldcups/i });
        expect(heading).toBeInTheDocument();
    });
});
