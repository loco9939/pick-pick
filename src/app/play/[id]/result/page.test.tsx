import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ResultPage from './ResultClient';
import { supabase } from '@/lib/supabase/client';

// Mock dependencies
const mockUseSearchParams = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
    useParams: () => ({ id: '1' }),
    useSearchParams: () => mockUseSearchParams(),
}));

jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

jest.mock('canvas-confetti', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@/components/comment/CommentList', () => {
    return function MockCommentList() {
        return <div data-testid="comment-list">Comments</div>;
    };
});

describe('ResultPage', () => {
    const mockWinner = {
        id: '1',
        name: 'Winner Candidate',
        image_url: 'https://example.com/winner.jpg',
        win_count: 10,
        match_win_count: 20,
        match_expose_count: 25,
    };

    const mockCandidates = [
        mockWinner,
        {
            id: '2',
            name: 'Runner Up',
            image_url: 'https://example.com/runner.jpg',
            win_count: 5,
            match_win_count: 15,
            match_expose_count: 30,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup Supabase mocks
        const mockSelect = jest.fn();
        const mockEq = jest.fn();
        const mockSingle = jest.fn();

        (supabase.from as jest.Mock).mockReturnValue({
            select: mockSelect,
        });

        mockSelect.mockReturnValue({
            eq: mockEq,
        });

        mockEq.mockImplementation((field, value) => {
            if (field === 'id' && value === '1') {
                return { single: mockSingle };
            }
            if (field === 'worldcup_id') {
                return { then: (cb: any) => cb({ data: mockCandidates, error: null }) };
            }
            return { single: mockSingle, then: (cb: any) => cb({ data: [], error: null }) };
        });

        mockSingle.mockResolvedValue({ data: mockWinner, error: null });
    });

    it('renders winner section when winnerId is present', async () => {
        mockUseSearchParams.mockReturnValue({ get: () => '1' });

        render(<ResultPage />);

        await screen.findByText('Winner!');
        expect(screen.getAllByText('Winner Candidate').length).toBeGreaterThan(0);
        expect(screen.getByText('Ranking')).toBeInTheDocument();
    });

    it('renders only ranking when winnerId is missing', async () => {
        mockUseSearchParams.mockReturnValue({ get: () => null });

        render(<ResultPage />);

        // Should not show winner section
        expect(screen.queryByText('Winner!')).not.toBeInTheDocument();

        // Should show ranking
        await screen.findByText('Ranking');
        expect(screen.getByText('Winner Candidate')).toBeInTheDocument();
        expect(screen.getByText('Runner Up')).toBeInTheDocument();
    });
});
