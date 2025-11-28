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
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);

    React.useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !nickname.trim()) return;
        if (!user && !password.trim() && !commentId) return; // Require password for new anon comments

        setIsSubmitting(true);

        try {
            if (commentId) {
                if (user) {
                    // Update existing comment (logged in)
                    const { error } = await supabase
                        .from('comments')
                        .update({
                            content: content.trim(),
                            nickname: nickname.trim(),
                        })
                        .eq('id', commentId)
                        .eq('user_id', user.id);

                    if (error) throw error;
                } else {
                    // Update existing comment (anonymous)
                    const { data, error } = await supabase
                        .rpc('update_anonymous_comment', {
                            p_comment_id: commentId,
                            p_password: password,
                            p_content: content.trim(),
                            p_nickname: nickname.trim()
                        });

                    if (error) throw error;
                    if (!data) {
                        alert('Incorrect password');
                        return;
                    }
                }
            } else {
                // Create new comment
                const payload: Database['public']['Tables']['comments']['Insert'] = {
                    worldcup_id: worldcupId,
                    user_id: user?.id || null,
                    nickname: nickname.trim(),
                    content: content.trim(),
                    parent_id: parentId || null,
                    password: user ? null : password // Store password only for anon
                };

                const { error } = await supabase
                    .from('comments')
                    .insert(payload);

                if (error) throw error;
            }

            if (!commentId) {
                setContent('');
                if (!user) {
                    setNickname('');
                    setPassword('');
                }
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
            {!user && (
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password (for edit/delete)"
                        className="w-full rounded-md border p-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:w-1/3"
                        disabled={isSubmitting}
                        required={!commentId} // Required for new comments, optional for edit if not changing? Actually required for edit too in logic, but UI-wise let's keep it required.
                    />
                </div>
            )}
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
                    disabled={isSubmitting || !content.trim() || !nickname.trim() || (!user && !password.trim() && !commentId)}
                >
                    {isSubmitting ? (commentId ? 'Updating...' : 'Posting...') : (commentId ? 'Update' : 'Post')}
                </Button>
            </div>
        </form>
    );
}
