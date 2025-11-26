import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CommentList from './CommentList';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: () => ({
            select: () => ({
                eq: () => ({
                    order: () => ({
                        data: [
                            {
                                id: '1',
                                worldcup_id: 'wc1',
                                user_id: 'user1',
                                nickname: 'User 1',
                                content: 'This is a comment',
                                parent_id: null,
                                created_at: new Date().toISOString(),
                            },
                            {
                                id: '2',
                                worldcup_id: 'wc1',
                                user_id: 'user2',
                                nickname: 'User 2',
                                content: 'This is a reply',
                                parent_id: '1',
                                created_at: new Date().toISOString(),
                            },
                        ],
                        error: null,
                    }),
                }),
            }),
        }),
    },
}));

describe('CommentList', () => {
    it('renders a list of comments', async () => {
        render(<CommentList worldcupId="wc1" />);

        expect(await screen.findByText('This is a comment')).toBeInTheDocument();
        expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    it('renders nested replies', async () => {
        render(<CommentList worldcupId="wc1" />);

        expect(await screen.findByText('This is a reply')).toBeInTheDocument();
        expect(screen.getByText('User 2')).toBeInTheDocument();
    });
});
