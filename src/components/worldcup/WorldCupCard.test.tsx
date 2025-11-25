import React from 'react';
import { render, screen } from '@testing-library/react';
import WorldCupCard from './WorldCupCard';

describe('WorldCupCard', () => {
    const mockProps = {
        id: '1',
        title: 'Test WorldCup',
        description: 'This is a test worldcup',
        thumbnailUrl: '/test-image.jpg',
    };

    it('renders title, description, and thumbnail', () => {
        render(<WorldCupCard {...mockProps} />);

        expect(screen.getByText(mockProps.title)).toBeInTheDocument();
        expect(screen.getByText(mockProps.description)).toBeInTheDocument();

        const image = screen.getByRole('img', { name: mockProps.title });
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', expect.stringContaining('test-image.jpg'));
    });

    it('links to the game play page', () => {
        render(<WorldCupCard {...mockProps} />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', `/play/${mockProps.id}/intro`);
    });
});
