import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
    it('renders the header container', () => {
        render(<Header />);
        const header = screen.getByRole('banner');
        expect(header).toBeInTheDocument();
    });

    it('renders the logo as a link to home', () => {
        render(<Header />);
        const logo = screen.getByRole('link', { name: /pickpick/i });
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute('href', '/');
    });

    it('renders the login button as a link to auth page', () => {
        render(<Header />);
        const loginButton = screen.getByRole('link', { name: /login/i });
        expect(loginButton).toBeInTheDocument();
        expect(loginButton).toHaveAttribute('href', '/auth/login');
    });
});
