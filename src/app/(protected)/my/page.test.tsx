import { render, screen, waitFor } from '@testing-library/react';
import MyPageClient from './MyPageClient';

// Mock useRouter
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: mockPush,
        refresh: mockRefresh,
    })),
}));

// Mock UserContext
const mockUseUser = jest.fn();
jest.mock('@/context/UserContext', () => ({
    useUser: () => mockUseUser(),
}));

// Mock Supabase client
const mockSelect = jest.fn();
const mockDelete = jest.fn();
const mockEq1 = jest.fn();
const mockEq2 = jest.fn();
const mockOrder = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: () => ({
            select: mockSelect,
            delete: mockDelete,
            update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null }),
            }),
        }),
    },
}));

// Helper to setup mock chain
const setupMocks = (user: any, worldcups: any[]) => {
    mockUseUser.mockReturnValue({ user, isLoading: false });

    mockSelect.mockReturnValue({
        eq: mockEq1.mockReturnValue({
            eq: mockEq2.mockReturnValue({
                order: mockOrder.mockResolvedValue({ data: worldcups, error: null }),
            }),
        }),
    });

    mockDelete.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
    });
};

describe('MyPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('redirects to login if not authenticated', async () => {
        mockUseUser.mockReturnValue({ user: null, isLoading: false });

        render(<MyPageClient />);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/auth/login');
        });
    });

    it('renders a list of user\'s WorldCups', async () => {
        const mockUser = { id: 'user1' };
        const mockWorldCups = [
            { id: '1', title: 'My WorldCup 1', description: 'Desc 1', thumbnail_url: 'https://example.com/url1.jpg' },
            { id: '2', title: 'My WorldCup 2', description: 'Desc 2', thumbnail_url: 'https://example.com/url2.jpg' },
        ];
        setupMocks(mockUser, mockWorldCups);

        render(<MyPageClient />);

        await waitFor(() => {
            expect(screen.getByText('My WorldCup 1')).toBeInTheDocument();
            expect(screen.getByText('My WorldCup 2')).toBeInTheDocument();
        });
    });

    it('displays Edit and Delete buttons', async () => {
        const mockUser = { id: 'user1' };
        const mockWorldCups = [
            { id: '1', title: 'My WorldCup 1', description: 'Desc 1', thumbnail_url: 'https://example.com/url1.jpg' },
        ];
        setupMocks(mockUser, mockWorldCups);

        render(<MyPageClient />);

        await waitFor(() => {
            expect(screen.getByText('Edit')).toBeInTheDocument();
            expect(screen.getByText('Delete')).toBeInTheDocument();
        });
    });
});
