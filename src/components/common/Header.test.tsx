import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from './Header';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

// Mock useRouter
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        refresh: mockRefresh,
    })),
}));

// Mock useUser
jest.mock('@/context/UserContext', () => ({
    useUser: jest.fn(),
}));

// Mock Supabase
const mockSignOut = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        auth: {
            signOut: jest.fn((...args) => mockSignOut(...args)),
        },
    },
}));

describe('Header', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state', () => {
        (useUser as jest.Mock).mockReturnValue({ user: null, isLoading: true });
        render(<Header />);

        expect(screen.queryByText('Login')).not.toBeInTheDocument();
        expect(screen.queryByText('My Page')).not.toBeInTheDocument();
        expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    it('renders Login link when not authenticated', () => {
        (useUser as jest.Mock).mockReturnValue({ user: null, isLoading: false });
        render(<Header />);

        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.queryByText('My Page')).not.toBeInTheDocument();
        expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    it('renders My Page and Logout when authenticated', () => {
        (useUser as jest.Mock).mockReturnValue({ user: { id: '1' }, isLoading: false });
        render(<Header />);

        expect(screen.queryByText('Login')).not.toBeInTheDocument();
        expect(screen.getByText('My Page')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('handles logout', async () => {
        (useUser as jest.Mock).mockReturnValue({ user: { id: '1' }, isLoading: false });
        render(<Header />);

        fireEvent.click(screen.getByText('Logout'));

        await waitFor(() => {
            expect(mockSignOut).toHaveBeenCalled();
            expect(mockRefresh).toHaveBeenCalled();
        });
    });
});
