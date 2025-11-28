'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';
import { Button } from '../ui/button';

interface CommentFormProps {
    worldcupId: string;
    parentId?: string;
    onCommentAdded: () => void;
    onCancel?: () => void;
    initialContent?: string;
    initialNickname?: string;
    commentId?: string;
}

export default function CommentForm({
    worldcupId,
    parentId,
    onCommentAdded,
    onCancel,
    initialContent = '',
    initialNickname = '',
    commentId
}: CommentFormProps) {
    const [content, setContent] = useState(initialContent);
    const [nickname, setNickname] = useState(initialNickname);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !nickname.trim()) return;

        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (commentId) {
                // Update existing comment
                const { error } = await supabase
                    .from('comments')
                    .update({
                        content: content.trim(),
                        nickname: nickname.trim(),
                    })
                    .eq('id', commentId)
                    .eq('user_id', user?.id || ''); // Security check

                if (error) throw error;
            } else {
                // Create new comment
                const payload: Database['public']['Tables']['comments']['Insert'] = {
                    worldcup_id: worldcupId,
                    user_id: user?.id || null,
                    nickname: nickname.trim(),
                    content: content.trim(),
                    parent_id: parentId || null,
                };

                const { error } = await supabase
                    .from('comments')
                    .insert(payload);

                if (error) throw error;
            }

            if (!commentId) {
                setContent('');
                if (!user) setNickname('');
            }
            onCommentAdded();
        } catch (err) {
            console.error('Error submitting comment:', err);
            alert('Failed to submit comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-slate-300 mb-1">
                    Nickname
                </label>
                <input
                    type="text"
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Nickname"
                    className="w-full rounded-md border p-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:w-1/3"
                    disabled={isSubmitting}
                    required
                />
            </div>
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-1">
                    Comment
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full rounded-md border p-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    rows={3}
                    disabled={isSubmitting}
                    required
                />
            </div>
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="text-slate-400 hover:bg-slate-800 hover:text-white"
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={isSubmitting || !content.trim() || !nickname.trim()}
                >
                    {isSubmitting ? (commentId ? 'Updating...' : 'Posting...') : (commentId ? 'Update' : 'Post')}
                </Button>
            </div>
        </form>
    );
}
