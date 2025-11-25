import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CreatePage from './page';

describe('CreatePage', () => {
    it('renders the creation form with candidate table', () => {
        render(<CreatePage />);

        expect(screen.getByRole('heading', { name: /create new worldcup/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();

        // Check for table headers
        expect(screen.getByText('Candidate Name')).toBeInTheDocument();
        expect(screen.getByText('Image URL')).toBeInTheDocument();

        // Check for Add Candidate button
        expect(screen.getByRole('button', { name: /add candidate/i })).toBeInTheDocument();
    });

    it('allows adding and removing candidates', () => {
        render(<CreatePage />);

        // Initially should have 2 empty rows (default)
        let rows = screen.getAllByRole('row');
        // Header row + 2 default rows = 3
        expect(rows).toHaveLength(3);

        // Add a candidate
        fireEvent.click(screen.getByRole('button', { name: /add candidate/i }));
        rows = screen.getAllByRole('row');
        expect(rows).toHaveLength(4);

        // Remove a candidate (first delete button)
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        fireEvent.click(deleteButtons[0]);
        rows = screen.getAllByRole('row');
        expect(rows).toHaveLength(3);
    });

    it('shows error if candidate name or url is missing', () => {
        render(<CreatePage />);

        const titleInput = screen.getByLabelText(/title/i);
        fireEvent.change(titleInput, { target: { value: 'My WorldCup' } });

        // Fill first row partially (only name)
        const nameInputs = screen.getAllByPlaceholderText(/candidate name/i);
        fireEvent.change(nameInputs[0], { target: { value: 'Candidate 1' } });

        fireEvent.click(screen.getByRole('button', { name: /create worldcup/i }));

        expect(screen.getByText(/all candidates must have a name and image url/i)).toBeInTheDocument();
    });
});
