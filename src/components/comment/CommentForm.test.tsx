import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommentForm from './CommentForm';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: () => ({
            insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockReturnValue({
                        data: {},
                        error: null,
                    }),
                }),
            }),
        }),
        auth: {
            getUser: jest.fn().mockResolvedValue({
                data: { user: { id: 'user1' } },
                error: null,
            }),
        },
    },
}));

describe('CommentForm', () => {
    it('renders nickname input, textarea and submit button', () => {
        render(<CommentForm worldcupId="wc1" onCommentAdded={() => { }} />);

        expect(screen.getByPlaceholderText('Nickname')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Post' })).toBeInTheDocument();
    });

    it('submits a comment with nickname', async () => {
        const onCommentAdded = jest.fn();
        render(<CommentForm worldcupId="wc1" onCommentAdded={onCommentAdded} />);

        fireEvent.change(screen.getByPlaceholderText('Nickname'), {
            target: { value: 'Guest User' },
        });
        fireEvent.change(screen.getByPlaceholderText('Add a comment...'), {
            target: { value: 'New comment' },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Post' }));

        await waitFor(() => {
            expect(onCommentAdded).toHaveBeenCalled();
        });
    });
});
