import { renderHook, act } from '@testing-library/react';
import useGameLogic, { Candidate } from './useGameLogic';

// Mock candidates
const mockCandidates: Candidate[] = [
    { id: '1', name: 'Candidate 1', image_url: 'url1' },
    { id: '2', name: 'Candidate 2', image_url: 'url2' },
    { id: '3', name: 'Candidate 3', image_url: 'url3' },
    { id: '4', name: 'Candidate 4', image_url: 'url4' },
];

describe('useGameLogic', () => {
    it('should initialize with provided candidates', () => {
        const { result } = renderHook(() => useGameLogic(mockCandidates));

        // Should have 4 candidates in the current round (shuffled or not)
        expect(result.current.gameState.totalCandidates).toBe(4);
        expect(result.current.gameState.round).toBe('4강');
    });

    it('getCurrentPair should return the first two candidates of the current round', () => {
        const { result } = renderHook(() => useGameLogic(mockCandidates));

        const pair = result.current.getCurrentPair();
        expect(pair).toHaveLength(2);
        // We can't strictly check IDs because of shuffling, but they should be from the list
        expect(mockCandidates).toContainEqual(expect.objectContaining({ id: pair[0].id }));
        expect(mockCandidates).toContainEqual(expect.objectContaining({ id: pair[1].id }));
        expect(pair[0].id).not.toBe(pair[1].id);
    });

    it('selectWinner should move to the next pair', () => {
        const { result } = renderHook(() => useGameLogic(mockCandidates));

        const firstPair = result.current.getCurrentPair();

        act(() => {
            result.current.selectWinner(firstPair[0].id);
        });

        const secondPair = result.current.getCurrentPair();
        expect(secondPair[0].id).not.toBe(firstPair[0].id);
        expect(secondPair[0].id).not.toBe(firstPair[1].id);
    });

    it('should progress to the next round when all matches are finished', () => {
        const { result } = renderHook(() => useGameLogic(mockCandidates));

        // Match 1 (4 candidates -> 2 matches)
        const pair1 = result.current.getCurrentPair();
        act(() => {
            result.current.selectWinner(pair1[0].id);
        });

        // Match 2
        const pair2 = result.current.getCurrentPair();
        act(() => {
            result.current.selectWinner(pair2[0].id);
        });

        // Should be in the next round (Final / 2강)
        expect(result.current.gameState.round).toBe('결승');
        expect(result.current.gameState.totalCandidates).toBe(2);
    });

    it('should declare a winner when only one candidate remains', () => {
        const { result } = renderHook(() => useGameLogic(mockCandidates));

        // Round of 4
        act(() => result.current.selectWinner(result.current.getCurrentPair()[0].id));
        act(() => result.current.selectWinner(result.current.getCurrentPair()[0].id));

        // Final Round
        expect(result.current.gameState.round).toBe('결승');

        // Final Match
        const winnerId = result.current.getCurrentPair()[0].id;
        act(() => result.current.selectWinner(winnerId));

        expect(result.current.gameState.winner).toBeDefined();
        expect(result.current.gameState.winner?.id).toBe(winnerId);
    });
});
