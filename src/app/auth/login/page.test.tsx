import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage from './page';

describe('LoginPage', () => {
    it('renders the login form', () => {
        render(<LoginPage />);

        expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in with email/i })).toBeInTheDocument();
    });

    it('renders social login buttons', () => {
        render(<LoginPage />);

        expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument();
    });
});
