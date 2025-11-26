'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';
import CommentForm from './CommentForm';

type Comment = Database['public']['Tables']['comments']['Row'];

interface CommentListProps {
    worldcupId: string;
}

export default function CommentList({ worldcupId }: CommentListProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const fetchComments = useCallback(async () => {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('worldcup_id', worldcupId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching comments:', error);
        } else {
            setComments(data as any);
        }
    }, [worldcupId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const rootComments = comments.filter((c) => !c.parent_id);
    const getReplies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-xl font-bold">Comments ({comments.length})</h3>
                <CommentForm worldcupId={worldcupId} onCommentAdded={fetchComments} />
            </div>

            <div className="space-y-6">
                {rootComments.map((comment) => (
                    <div key={comment.id} className="space-y-2">
                        <div className="rounded-lg border p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">{comment.nickname}</span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="mt-2 text-sm">{comment.content}</p>
                            <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className="mt-2 text-xs text-primary hover:underline"
                            >
                                Reply
                            </button>
                            {replyingTo === comment.id && (
                                <div className="mt-2">
                                    <CommentForm
                                        worldcupId={worldcupId}
                                        parentId={comment.id}
                                        onCommentAdded={() => {
                                            fetchComments();
                                            setReplyingTo(null);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        {/* Replies */}
                        <div className="ml-8 space-y-2 border-l-2 pl-4">
                            {getReplies(comment.id).map((reply) => (
                                <div key={reply.id} className="rounded-lg bg-muted/50 p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm">{reply.nickname}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(reply.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm">{reply.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
