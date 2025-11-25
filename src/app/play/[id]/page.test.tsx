import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GamePlayPage from './page';
import useGameLogic from '@/hooks/useGameLogic';

// Mock the hook
jest.mock('@/hooks/useGameLogic');

const mockUseGameLogic = useGameLogic as jest.Mock;

const mockCandidates = [
    { id: '1', name: 'Candidate 1', image_url: 'https://example.com/url1.jpg' },
    { id: '2', name: 'Candidate 2', image_url: 'https://example.com/url2.jpg' },
];

describe('GamePlayPage', () => {
    beforeEach(() => {
        mockUseGameLogic.mockReturnValue({
            gameState: {
                round: '16강',
                totalCandidates: 16,
                currentMatch: 1,
                totalMatches: 8,
                winner: undefined,
            },
            getCurrentPair: jest.fn().mockReturnValue([mockCandidates[0], mockCandidates[1]]),
            selectWinner: jest.fn(),
        });
    });

    it('renders two game cards', () => {
        render(<GamePlayPage params={{ id: '1' }} />);

        expect(screen.getByText('Candidate 1')).toBeInTheDocument();
        expect(screen.getByText('Candidate 2')).toBeInTheDocument();
    });

    it('displays round information', () => {
        render(<GamePlayPage params={{ id: '1' }} />);

        expect(screen.getByText('16강')).toBeInTheDocument();
        expect(screen.getByText('(1 / 8)')).toBeInTheDocument();
    });

    it('calls selectWinner when a card is clicked', () => {
        const selectWinnerMock = jest.fn();
        mockUseGameLogic.mockReturnValue({
            ...mockUseGameLogic(),
            selectWinner: selectWinnerMock,
        });

        render(<GamePlayPage params={{ id: '1' }} />);

        fireEvent.click(screen.getByText('Candidate 1'));
        expect(selectWinnerMock).toHaveBeenCalledWith('1');
    });

    it('shows winner when game ends', () => {
        mockUseGameLogic.mockReturnValue({
            gameState: {
                round: '결승',
                winner: mockCandidates[0],
            },
            getCurrentPair: jest.fn().mockReturnValue([]),
            selectWinner: jest.fn(),
        });

        render(<GamePlayPage params={{ id: '1' }} />);

        expect(screen.getByText('Winner!')).toBeInTheDocument();
        expect(screen.getByText('Candidate 1')).toBeInTheDocument();
    });
});
