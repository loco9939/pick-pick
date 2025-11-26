import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';
import { useRouter } from 'next/navigation';

// Mock useRouter
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: mockPush,
        refresh: mockRefresh,
    })),
}));

// Mock Supabase
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockSignInWithOAuth = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        auth: {
            signInWithPassword: jest.fn((...args) => mockSignInWithPassword(...args)),
            signUp: jest.fn((...args) => mockSignUp(...args)),
            signInWithOAuth: jest.fn((...args) => mockSignInWithOAuth(...args)),
        },
    },
}));

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders login form by default', () => {
        render(<LoginPage />);
        expect(screen.getByText('Welcome back')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign In with Email' })).toBeInTheDocument();
    });

    it('switches to sign up mode', () => {
        render(<LoginPage />);
        fireEvent.click(screen.getByText('Sign Up'));
        expect(screen.getByText('Create an account')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign Up with Email' })).toBeInTheDocument();
    });

    it('handles email sign in', async () => {
        mockSignInWithPassword.mockResolvedValue({ error: null });
        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: 'Sign In with Email' }));

        await waitFor(() => {
            expect(mockSignInWithPassword).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password',
            });
            expect(mockPush).toHaveBeenCalledWith('/');
        });
    });

    it('handles email sign up with auto-confirm', async () => {
        mockSignUp.mockResolvedValue({ data: { session: { user: { id: '1' } } }, error: null });
        render(<LoginPage />);

        fireEvent.click(screen.getByText('Sign Up'));
        fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'new@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: 'Sign Up with Email' }));

        await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalledWith({
                email: 'new@example.com',
                password: 'password',
                options: {
                    emailRedirectTo: expect.stringContaining('/auth/callback'),
                },
            });
            expect(mockPush).toHaveBeenCalledWith('/');
        });
    });

    it('handles google login', async () => {
        mockSignInWithOAuth.mockResolvedValue({ error: null });
        render(<LoginPage />);

        fireEvent.click(screen.getByRole('button', { name: 'Sign In with Google' }));

        await waitFor(() => {
            expect(mockSignInWithOAuth).toHaveBeenCalledWith({
                provider: 'google',
                options: {
                    redirectTo: expect.stringContaining('/auth/callback'),
                },
            });
        });
    });
});
