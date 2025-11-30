'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';
import CommentForm from './CommentForm';
import Pagination from '../common/Pagination';
import { useUser } from '@/context/UserContext';
import { Edit, InfoIcon, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslations, useLocale } from 'next-intl';

type Comment = Database['public']['Tables']['comments']['Row'];

interface CommentListProps {
    worldcupId: string;
}

import { useGlobalAlert } from '@/components/common/GlobalAlertProvider';
import PasswordPromptDialog from './PasswordPromptDialog';

export default function CommentList({ worldcupId }: CommentListProps) {
    const { user } = useUser();
    const t = useTranslations();
    const locale = useLocale();
    const { showAlert, showConfirm } = useGlobalAlert();
    const [comments, setComments] = useState<Comment[]>([]);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [visibleReplyCounts, setVisibleReplyCounts] = useState<Record<string, number>>({});

    // For password prompt
    const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 10;
    const INITIAL_REPLIES_VISIBLE = 0;
    const REPLIES_INCREMENT = 5;

    const formatDate = (dateString: string, locale: string) => {
        const date = new Date(dateString);
        const yy = date.getFullYear().toString().slice(-2);
        const mm = (date.getMonth() + 1).toString().padStart(2, '0');
        const dd = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        if (locale === 'ko') {
            return `${yy}.${mm}.${dd} ${hours}:${minutes}:${seconds}`;
        } else {
            return `${mm}/${dd}/${yy} ${hours}:${minutes}:${seconds}`;
        }
    };

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
                .order('created_at', { ascending: true })
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

    const handleDeleteClick = async (commentId: string, commentUserId: string | null) => {
        if (user && user.id === commentUserId) {
            // Logged in user deleting their own comment
            const confirmed = await showConfirm(t('이 댓글을 삭제하시겠습니까?'));
            if (!confirmed) return;

            try {
                const { error } = await supabase
                    .from('comments')
                    .delete()
                    .eq('id', commentId)
                    .eq('user_id', user.id);

                if (error) throw error;
                await showAlert(t('댓글이 삭제되었습니다'));
                fetchComments();
            } catch (error) {
                console.error('Error deleting comment:', error);
                await showAlert(t('댓글 삭제 실패'));
            }
        } else if (!commentUserId) {
            // Anonymous comment deletion - open password prompt
            setDeleteTargetId(commentId);
            setIsPasswordPromptOpen(true);
        } else {
            await showAlert(t('이 댓글을 삭제할 수 없습니다'));
        }
    };

    const handlePasswordSubmit = async (password: string) => {
        if (!deleteTargetId) return;

        try {
            const { data, error } = await supabase
                .rpc('delete_anonymous_comment', {
                    p_comment_id: deleteTargetId,
                    p_password: password
                });

            if (error) throw error;
            if (!data) {
                await showAlert(t('비밀번호가 일치하지 않습니다'));
                return;
            }

            await showAlert(t('댓글이 삭제되었습니다'));
            fetchComments();
        } catch (error) {
            console.error('Error deleting comment:', error);
            await showAlert(t('댓글 삭제 실패'));
        } finally {
            setDeleteTargetId(null);
        }
    };

    const handleShowMoreReplies = (commentId: string) => {
        setVisibleReplyCounts(prev => ({
            ...prev,
            [commentId]: (prev[commentId] || 0) + REPLIES_INCREMENT
        }));
    };

    const handleHideReplies = (commentId: string) => {
        setVisibleReplyCounts(prev => ({
            ...prev,
            [commentId]: 0
        }));
    };

    const rootComments = comments.filter((c) => !c.parent_id);
    const getReplies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);

    return (
        <div className="space-y-8">

            <div className="space-y-8" data-testid="comment-list">
                {rootComments.length === 0 ? (
                    <div className="text-center py-16 bg-slate-900/20 rounded-xl border border-slate-800/50 border-dashed">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.159 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                            </svg>
                        </div>
                        <p className="text-slate-400 font-medium">{t('아직 댓글이 없습니다')}</p>
                        <p className="text-sm text-slate-500 mt-1">{t('가장 먼저 의견을 남겨보세요!')}</p>
                    </div>
                ) : (
                    rootComments.map((comment) => {
                        const replies = getReplies(comment.id);
                        const visibleCount = visibleReplyCounts[comment.id] || INITIAL_REPLIES_VISIBLE;
                        const displayedReplies = replies.slice(0, visibleCount);
                        const hasMoreReplies = replies.length > visibleCount;
                        const isOwner = user?.id === comment.user_id;
                        const isEditing = editingCommentId === comment.id;

                        return (
                            <div key={comment.id} className="group animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-800/50 hover:border-slate-700/50 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-200 truncate max-w-[120px] sm:max-w-[200px]">{comment.nickname}</span>
                                                    <span className="text-xs text-slate-500">•</span>
                                                    <span className="text-xs text-slate-500">
                                                        {formatDate(comment.created_at, locale)}
                                                    </span>
                                                </div>
                                                {(isOwner || !comment.user_id) && !isEditing && (
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setEditingCommentId(comment.id)}
                                                            className="h-7 w-7 text-slate-500 hover:text-primary hover:bg-primary/10"
                                                            title={t('수정')}
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteClick(comment.id, comment.user_id)}
                                                            className="h-7 w-7 text-slate-500 hover:text-red-500 hover:bg-red-500/10"
                                                            title={t('삭제')}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {isEditing ? (
                                                <div className="mt-2">
                                                    <CommentForm
                                                        worldcupId={worldcupId}
                                                        commentId={comment.id}
                                                        commentOwnerId={comment.user_id}
                                                        initialContent={comment.content}
                                                        initialNickname={comment.nickname}
                                                        onCommentAdded={() => {
                                                            setEditingCommentId(null);
                                                            fetchComments();
                                                        }}
                                                        onCancel={() => setEditingCommentId(null)}
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
                                                    <div className="mt-3 flex items-center gap-4">
                                                        <button
                                                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                            className="text-xs font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                                            </svg>
                                                            {t('답글 달기')}
                                                        </button>
                                                    </div>
                                                </>
                                            )}

                                            {replyingTo === comment.id && !isEditing && (
                                                <div className="mt-4 pl-4 border-l-2 border-slate-700/50">
                                                    <CommentForm
                                                        worldcupId={worldcupId}
                                                        parentId={comment.id}
                                                        onCommentAdded={() => {
                                                            fetchComments();
                                                            setVisibleReplyCounts(prev => ({
                                                                ...prev,
                                                                [comment.id]: (replies.length || 0) + 1
                                                            }));
                                                        }}
                                                        onCancel={() => setReplyingTo(null)}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Replies */}
                                        {replies.length > 0 && (
                                            <div className="mt-3 pl-4 border-l-2 border-slate-800 ml-5 space-y-3">
                                                {visibleCount > 0 ? (
                                                    <>
                                                        {displayedReplies.map((reply) => {
                                                            const isReplyOwner = user?.id === reply.user_id;
                                                            const isReplyEditing = editingCommentId === reply.id;

                                                            return (
                                                                <div key={reply.id} className="group/reply relative">
                                                                    {/* Horizontal connector for reply */}
                                                                    <div className="absolute -left-4 top-5 w-3 h-px bg-slate-800"></div>

                                                                    <div className="flex gap-3">
                                                                        <div className="flex-shrink-0">
                                                                            <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 border border-slate-700/50">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                                                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                                                                </svg>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-grow min-w-0 bg-slate-900/20 rounded-lg p-3 border border-slate-800/30 hover:border-slate-700/30 transition-colors">
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="font-semibold text-sm text-slate-300 truncate max-w-[100px] sm:max-w-[150px]">{reply.nickname}</span>
                                                                                    <span className="text-[10px] text-slate-600">
                                                                                        {formatDate(reply.created_at, locale)}
                                                                                    </span>
                                                                                </div>
                                                                                {(isReplyOwner || !reply.user_id) && !isReplyEditing && (
                                                                                    <div className="flex items-center gap-1 opacity-0 group-hover/reply:opacity-100 transition-opacity">
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            onClick={() => setEditingCommentId(reply.id)}
                                                                                            className="h-6 w-6 text-slate-500 hover:text-primary"
                                                                                            title={t('수정')}
                                                                                        >
                                                                                            <Pencil className="w-3 h-3" />
                                                                                        </Button>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            onClick={() => handleDeleteClick(reply.id, reply.user_id)}
                                                                                            className="h-6 w-6 text-slate-500 hover:text-red-500 hover:bg-red-500/10"
                                                                                            title={t('삭제')}
                                                                                        >
                                                                                            <Trash2 className="w-3 h-3" />
                                                                                        </Button>
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            {isReplyEditing ? (
                                                                                <div className="mt-2">
                                                                                    <CommentForm
                                                                                        worldcupId={worldcupId}
                                                                                        commentId={reply.id}
                                                                                        commentOwnerId={reply.user_id}
                                                                                        initialContent={reply.content}
                                                                                        initialNickname={reply.nickname}
                                                                                        onCommentAdded={() => {
                                                                                            setEditingCommentId(null);
                                                                                            fetchComments();
                                                                                        }}
                                                                                        onCancel={() => setEditingCommentId(null)}
                                                                                    />
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap break-words">{reply.content}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        <div className="pl-11 pt-1 flex items-center gap-4">
                                                            {hasMoreReplies && (
                                                                <button
                                                                    onClick={() => handleShowMoreReplies(comment.id)}
                                                                    className="text-xs font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
                                                                >
                                                                    <div className="w-4 h-px bg-slate-700 mr-1"></div>
                                                                    {t('답글 더 보기', { count: Math.min(REPLIES_INCREMENT, replies.length - visibleCount) })}
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleHideReplies(comment.id)}
                                                                className="text-xs font-medium text-slate-500 hover:text-primary transition-colors"
                                                            >
                                                                {t('답글 숨기기')}
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleShowMoreReplies(comment.id)}
                                                        className="text-xs font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-2 pl-2 py-1"
                                                    >
                                                        <div className="w-6 h-px bg-slate-700"></div>
                                                        {t('답글 보기', { count: replies.length })}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="space-y-4">
                <div className="rounded-md bg-yellow-500/10 p-4 text-sm text-yellow-500 border border-yellow-500/20 flex items-center gap-3">
                    <InfoIcon className="w-4 h-4" />
                    <p>{t('깨끗하고 존중하는 댓글 문화를 만들어주세요')}</p>
                </div>
                <CommentForm
                    worldcupId={worldcupId}
                    onCommentAdded={async () => {
                        const { count } = await supabase
                            .from('comments')
                            .select('*', { count: 'exact', head: true })
                            .eq('worldcup_id', worldcupId)
                            .is('parent_id', null);
                        const newPage = Math.ceil((count || 0) / ITEMS_PER_PAGE) || 1;
                        if (newPage !== page) {
                            setPage(newPage);
                        } else {
                            fetchComments();
                        }
                    }}
                />
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            <PasswordPromptDialog
                isOpen={isPasswordPromptOpen}
                onClose={() => setIsPasswordPromptOpen(false)}
                onSubmit={handlePasswordSubmit}
            />
        </div>
    );
}
