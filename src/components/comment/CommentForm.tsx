'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';

interface CommentFormProps {
    worldcupId: string;
    parentId?: string;
    onCommentAdded: () => void;
    onCancel?: () => void;
}

export default function CommentForm({ worldcupId, parentId, onCommentAdded, onCancel }: CommentFormProps) {
    const [content, setContent] = useState('');
    const [nickname, setNickname] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !nickname.trim()) return;

        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const payload: Database['public']['Tables']['comments']['Insert'] = {
                worldcup_id: worldcupId,
                user_id: user?.id || null,
                nickname: nickname.trim(),
                content: content.trim(),
                parent_id: parentId || null,
            };

            const { error } = await (supabase
                .from('comments') as any)
                .insert(payload);

            if (error) {
                console.error('Error posting comment:', error);
                alert('Failed to post comment');
            } else {
                setContent('');
                if (!user) setNickname(''); // Clear nickname only for guests
                onCommentAdded();
            }
        } catch (err) {
            console.error('Error:', err);
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
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-md px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting || !content.trim() || !nickname.trim()}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    {isSubmitting ? 'Posting...' : 'Post'}
                </button>
            </div>
        </form>
    );
}
