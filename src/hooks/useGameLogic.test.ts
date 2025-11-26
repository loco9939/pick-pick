import { renderHook, act, waitFor } from '@testing-library/react';
import useGameLogic, { Candidate } from './useGameLogic';

// Mock candidates
const mockCandidates: Candidate[] = [
    { id: '1', name: 'Candidate 1', image_url: 'url1' },
    { id: '2', name: 'Candidate 2', image_url: 'url2' },
    { id: '3', name: 'Candidate 3', image_url: 'url3' },
    { id: '4', name: 'Candidate 4', image_url: 'url4' },
];

// Mock supabase
jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
    },
}));

// Helper to create candidates for larger tournaments
const createCandidates = (count: number): Candidate[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: String(i + 1),
        name: `Candidate ${i + 1}`,
        image_url: `url${i + 1}`,
    }));
};

describe('useGameLogic', () => {
    it('should initialize with provided candidates', async () => {
        const { result } = renderHook(() => useGameLogic(mockCandidates));

        // Wait for candidates to be initialized
        await waitFor(() => {
            expect(result.current.gameState.totalCandidates).toBe(4);
        });
        expect(result.current.gameState.round).toBe('4강');
    });

    it('getCurrentPair should return the first two candidates of the current round', async () => {
        const { result } = renderHook(() => useGameLogic(mockCandidates));

        await waitFor(() => {
            expect(result.current.gameState.totalCandidates).toBe(4);
        });

        const pair = result.current.getCurrentPair();
        expect(pair).toHaveLength(2);
        expect(pair[0]).toBeDefined();
        expect(pair[1]).toBeDefined();
        // We can't strictly check IDs because of shuffling, but they should be from the list
        expect(mockCandidates).toContainEqual(expect.objectContaining({ id: pair[0].id }));
        expect(mockCandidates).toContainEqual(expect.objectContaining({ id: pair[1].id }));
        expect(pair[0].id).not.toBe(pair[1].id);
    });

    it('selectWinner should move to the next pair', async () => {
        const { result } = renderHook(() => useGameLogic(mockCandidates));

        await waitFor(() => {
            expect(result.current.gameState.totalCandidates).toBe(4);
        });

        const firstPair = result.current.getCurrentPair();

        await act(async () => {
            await result.current.selectWinner(firstPair[0].id);
        });

        const secondPair = result.current.getCurrentPair();
        expect(secondPair[0].id).not.toBe(firstPair[0].id);
        expect(secondPair[0].id).not.toBe(firstPair[1].id);
    });

    it('should progress to the next round when all matches are finished', async () => {
        const { result } = renderHook(() => useGameLogic(mockCandidates));

        await waitFor(() => {
            expect(result.current.gameState.totalCandidates).toBe(4);
        });

        // Match 1 (4 candidates -> 2 matches)
        const pair1 = result.current.getCurrentPair();
        await act(async () => {
            await result.current.selectWinner(pair1[0].id);
        });

        // Match 2
        const pair2 = result.current.getCurrentPair();
        await act(async () => {
            await result.current.selectWinner(pair2[0].id);
        });

        // Should be in the next round (Final / 2강)
        expect(result.current.gameState.round).toBe('결승');
        expect(result.current.gameState.totalCandidates).toBe(2);
    });

    it('should declare a winner when only one candidate remains', async () => {
        const { result } = renderHook(() => useGameLogic(mockCandidates));

        await waitFor(() => {
            expect(result.current.gameState.totalCandidates).toBe(4);
        });

        // Round of 4
        await act(async () => {
            await result.current.selectWinner(result.current.getCurrentPair()[0].id);
        });
        await act(async () => {
            await result.current.selectWinner(result.current.getCurrentPair()[0].id);
        });

        // Final Round
        expect(result.current.gameState.round).toBe('결승');

        // Final Match
        const winnerId = result.current.getCurrentPair()[0].id;
        await act(async () => {
            await result.current.selectWinner(winnerId);
        });

        expect(result.current.gameState.winner).toBeDefined();
        expect(result.current.gameState.winner?.id).toBe(winnerId);
    });

    it('should handle full 8 candidates tournament correctly', async () => {
        const mockCandidates = createCandidates(8);
        const { result } = renderHook(() => useGameLogic(mockCandidates));

        await waitFor(() => {
            expect(result.current.gameState.totalCandidates).toBe(8);
        });

        // Round of 8
        expect(result.current.gameState.round).toBe('8강');
        expect(result.current.gameState.totalMatches).toBe(4);

        for (let i = 0; i < 4; i++) {
            const [candidateA] = result.current.getCurrentPair();
            await act(async () => {
                await result.current.selectWinner(candidateA.id);
            });
        }

        // Round of 4
        expect(result.current.gameState.round).toBe('4강');
        expect(result.current.gameState.totalMatches).toBe(2);

        for (let i = 0; i < 2; i++) {
            const [candidateA] = result.current.getCurrentPair();
            await act(async () => {
                await result.current.selectWinner(candidateA.id);
            });
        }

        // Finals
        expect(result.current.gameState.round).toBe('결승');
        expect(result.current.gameState.totalMatches).toBe(1);

        const [finalistA] = result.current.getCurrentPair();
        await act(async () => {
            await result.current.selectWinner(finalistA.id);
        });

        expect(result.current.gameState.winner).toBeDefined();
        expect(result.current.gameState.winner?.id).toBe(finalistA.id);
    });
});
