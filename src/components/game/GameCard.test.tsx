import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameCard from './GameCard';

const mockCandidate = {
    id: '1',
    name: 'Candidate 1',
    image_url: 'https://example.com/image1.jpg',
};

describe('GameCard', () => {
    it('renders candidate name and image', () => {
        render(<GameCard candidate={mockCandidate} onClick={() => { }} />);

        expect(screen.getByText('Candidate 1')).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src');
        // Note: Next.js Image component might mangle the src, so we check if it exists.
        // Ideally we check for the alt text which should be the candidate name.
        expect(screen.getByAltText('Candidate 1')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handleClick = jest.fn();
        render(<GameCard candidate={mockCandidate} onClick={handleClick} />);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders fallback name when image fails to load', () => {
        render(<GameCard candidate={mockCandidate} onClick={() => { }} />);

        const img = screen.getByAltText('Candidate 1');
        fireEvent.error(img);

        // The image should be removed from the document (or replaced)
        expect(screen.queryByAltText('Candidate 1')).not.toBeInTheDocument();

        // We expect the name to be present twice now (once in the fallback area, once in the footer)
        // Or we can check for the specific fallback element class
        const names = screen.getAllByText('Candidate 1');
        expect(names).toHaveLength(2);
    });

    it('renders fallback name immediately for invalid URL', () => {
        const invalidCandidate = { ...mockCandidate, image_url: 'invalid-url' };
        render(<GameCard candidate={invalidCandidate} onClick={() => { }} />);

        // Image should not be rendered
        expect(screen.queryByAltText('Candidate 1')).not.toBeInTheDocument();

        // Fallback name should be present
        const names = screen.getAllByText('Candidate 1');
        expect(names).toHaveLength(2);
    });
});
