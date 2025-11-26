import React from 'react';
import { render, screen } from '@testing-library/react';
import ResultPage from './page';
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useParams: () => ({ id: 'test-worldcup-id' }),
    useSearchParams: () => ({ get: () => 'test-winner-id' }),
    useRouter: () => ({ push: jest.fn() }),
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: () => Promise.resolve({
                        data: {
                            id: 'test-winner-id',
                            name: 'Test Winner',
                            image_url: 'http://test.com/image.png',
                            win_count: 10,
                            match_win_count: 20,
                            match_expose_count: 30
                        },
                        error: null
                    })
                })
            })
        })
    }
}));

// Mock CommentList
jest.mock('@/components/comment/CommentList', () => {
    return function MockCommentList() {
        return <div data-testid="comment-list">Comments</div>;
    };
});

describe('ResultPage', () => {
    it('renders winner information', async () => {
        render(<ResultPage />);

        // Since we are mocking the data fetch, we might need to wait for state update
        // However, the component is client-side and fetches in useEffect.
        // We should use findByText to wait for the element.

        expect(await screen.findByText('Winner!')).toBeInTheDocument();
        expect(screen.getByText('Test Winner')).toBeInTheDocument();
        expect(screen.getByTestId('comment-list')).toBeInTheDocument();
    });
});
