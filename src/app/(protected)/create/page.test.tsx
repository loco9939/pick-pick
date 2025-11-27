import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateForm from './CreateForm';

// Mock useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock Supabase
const mockInsert = jest.fn();
jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: () => ({
            insert: mockInsert,
        }),
    },
}));

// Mock UserContext
const mockUseUser = jest.fn();
jest.mock('@/context/UserContext', () => ({
    useUser: () => mockUseUser(),
}));

describe('CreateForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockInsert.mockResolvedValue({ data: [{ id: '1' }], error: null });
        mockUseUser.mockReturnValue({ user: { id: 'user1' }, isLoading: false });
    });

    it('renders the creation form with candidate table', () => {
        render(<CreateForm />);

        expect(screen.getByRole('heading', { name: /create new worldcup/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();

        // Check for table headers
        expect(screen.getByText('Candidate Name')).toBeInTheDocument();
        expect(screen.getByText('Image URL')).toBeInTheDocument();
    });

    it('allows changing tournament size', () => {
        render(<CreateForm />);

        // Default is 4
        // Check if select value is 4
        const select = screen.getByRole('combobox');
        expect(select).toHaveValue('4');
    });

    it('shows error if candidate name or url is missing', async () => {
        render(<CreateForm />);

        const titleInput = screen.getByLabelText(/title/i);
        fireEvent.change(titleInput, { target: { value: 'My WorldCup' } });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /create worldcup/i }));

        await waitFor(() => {
            expect(screen.getByText(/please fill in all 4 candidates/i)).toBeInTheDocument();
        });
    });
});
