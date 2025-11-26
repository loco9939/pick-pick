import { render, screen, waitFor } from '@testing-library/react';
import MyPage from './page';

// Mock useRouter
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: mockPush,
        refresh: mockRefresh,
    })),
}));

// Mock Supabase client
const mockSelect = jest.fn();
const mockDelete = jest.fn();
const mockEq1 = jest.fn();
const mockEq2 = jest.fn();
const mockOrder = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        auth: {
            getUser: jest.fn(),
        },
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
    const { supabase } = require('@/lib/supabase/client');
    supabase.auth.getUser.mockResolvedValue({ data: { user }, error: null });

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
        const { supabase } = require('@/lib/supabase/client');
        supabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

        // We can't easily spy on the return value of useRouter if it's already mocked in the factory.
        // Instead, we can spy on the push function that our mock returns.
        // But since we defined the mock factory to return a new object each time, we need a way to access it.
        // A better approach is to use a spy on the module if possible, or just mock the implementation in the test.
        // However, jest.mock is hoisted.

        // Let's rely on the fact that we can't easily change the mock implementation of a hoisted mock in a test
        // without some setup. But we can check if it was called if we use a shared mock function.

        // Actually, the error was `(useRouter as jest.Mock).mockReturnValue is not a function`.
        // This is because `useRouter` is the hook function itself.
        // We should mock the hook to return our mock router object.

        render(<MyPage />);

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

        render(<MyPage />);

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

        render(<MyPage />);

        await waitFor(() => {
            expect(screen.getByText('Edit')).toBeInTheDocument();
            expect(screen.getByText('Delete')).toBeInTheDocument();
        });
    });
});
