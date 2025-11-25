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
});
