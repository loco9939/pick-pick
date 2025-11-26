import React from 'react';
import { render, screen } from '@testing-library/react';
import ResultPage from './page';

// Mock the mock data used in the component
jest.mock('@/app/play/[id]/page', () => ({
    MOCK_CANDIDATES: [
        { id: '1', name: 'Winner Candidate', image_url: 'https://example.com/winner.jpg' },
    ],
}));

// Mock navigation
jest.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: (key: string) => (key === 'winnerId' ? '1' : null),
    }),
}));

// Mock CommentList
jest.mock('@/components/comment/CommentList', () => {
    return function MockCommentList() {
        return <div data-testid="comment-list">Comment List</div>;
    };
});

describe('ResultPage', () => {
    it('renders the winner information', () => {
        render(<ResultPage params={{ id: '1' }} />);

        expect(screen.getByText('Winner!')).toBeInTheDocument();
        expect(screen.getByText('Candidate 1')).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src');
    });

    it('renders back to home link', () => {
        render(<ResultPage params={{ id: '1' }} />);

        const homeLink = screen.getByRole('link', { name: /back to home/i });
        expect(homeLink).toBeInTheDocument();
        expect(homeLink).toHaveAttribute('href', '/');
    });
});
