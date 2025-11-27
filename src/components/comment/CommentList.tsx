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
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [expandedReplyIds, setExpandedReplyIds] = useState<Set<string>>(new Set());
    const ITEMS_PER_PAGE = 10;
    const REPLIES_PER_PAGE = 5;

    const fetchComments = useCallback(async () => {
        try {
            // 1. Get total count of root comments
            const { count, error: countError } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('worldcup_id', worldcupId)
                .is('parent_id', null);

            if (countError) throw countError;

            setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));

            // 2. Get root comments for current page
            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data: roots, error: rootsError } = await supabase
                .from('comments')
                .select('*')
                .eq('worldcup_id', worldcupId)
                .is('parent_id', null)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (rootsError) throw rootsError;

            // 3. Get replies for these roots
            const rootIds = roots.map(c => c.id);
            let allComments = [...roots];

            if (rootIds.length > 0) {
                const { data: replies, error: repliesError } = await supabase
                    .from('comments')
                    .select('*')
                    .eq('worldcup_id', worldcupId)
                    .in('parent_id', rootIds)
                    .order('created_at', { ascending: true });

                if (repliesError) throw repliesError;
                if (replies) {
                    allComments = [...allComments, ...replies];
                }
            }

            setComments(allComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }, [worldcupId, page]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const toggleReplies = (commentId: string) => {
        setExpandedReplyIds(prev => {
            const next = new Set(prev);
            if (next.has(commentId)) {
                next.delete(commentId);
            } else {
                next.add(commentId);
            }
            return next;
        });
    };

    const rootComments = comments.filter((c) => !c.parent_id);
    const getReplies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-xl font-bold">Comments</h3>
                <CommentForm
                    worldcupId={worldcupId}
                    onCommentAdded={() => {
                        setPage(1); // Reset to first page on new comment
                        fetchComments();
                    }}
                />
            </div>

            <div className="space-y-6" data-testid="comment-list">
                {rootComments.map((comment) => {
                    const replies = getReplies(comment.id);
                    const isExpanded = expandedReplyIds.has(comment.id);
                    const displayedReplies = isExpanded ? replies : replies.slice(0, REPLIES_PER_PAGE);
                    const hasMoreReplies = replies.length > REPLIES_PER_PAGE;

                    return (
                        <div key={comment.id} className="space-y-2">
                            <div className="rounded-lg border p-4 shadow-sm bg-slate-900/50 border-slate-800">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-200">{comment.nickname}</span>
                                    <span className="text-xs text-slate-500">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-slate-300">{comment.content}</p>
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
                            {replies.length > 0 && (
                                <div className="ml-8 space-y-2 border-l-2 border-slate-800 pl-4">
                                    {displayedReplies.map((reply) => (
                                        <div key={reply.id} className="rounded-lg bg-slate-900/30 p-3 border border-slate-800/50">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-sm text-slate-300">{reply.nickname}</span>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(reply.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-slate-400">{reply.content}</p>
                                        </div>
                                    ))}
                                    {hasMoreReplies && (
                                        <button
                                            onClick={() => toggleReplies(comment.id)}
                                            className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
                                        >
                                            {isExpanded ? 'Show less' : `Show ${replies.length - REPLIES_PER_PAGE} more replies...`}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-1 rounded-md bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700"
                    >
                        Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`px-3 py-1 rounded-md ${page === p
                                ? 'bg-primary text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="px-3 py-1 rounded-md bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
