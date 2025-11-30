'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';
import { Button } from '../ui/button';
import { useTranslations } from 'next-intl';

interface CommentFormProps {
    worldcupId: string;
    parentId?: string;
    onCommentAdded: () => void;
    onCancel?: () => void;
    initialContent?: string;
    initialNickname?: string;
    commentId?: string;
    commentOwnerId?: string | null;
}

import { useUser } from '@/context/UserContext';
import { useGlobalAlert } from '@/components/common/GlobalAlertProvider';

export default function CommentForm({
    worldcupId,
    parentId,
    onCommentAdded,
    onCancel,
    initialContent = '',
    initialNickname = '',
    commentId,
    commentOwnerId
}: CommentFormProps) {
    const t = useTranslations();
    const { showAlert } = useGlobalAlert();
    const { user } = useUser();
    const [content, setContent] = useState(initialContent);
    const [nickname, setNickname] = useState(initialNickname);
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAnonymousComment = !!commentId && !commentOwnerId;
    const showPasswordField = !user || isAnonymousComment;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !nickname.trim()) return;
        if (showPasswordField && !password.trim() && !commentId) return; // Require password for new anon comments
        // For editing anon comment, password is required
        if (isAnonymousComment && !password.trim()) {
            await showAlert(t('비밀번호를 입력해주세요'));
            return;
        }

        setIsSubmitting(true);

        try {
            if (commentId) {
                if (!isAnonymousComment && user) {
                    // Update existing comment (logged in user updating their own)
                    if (commentOwnerId !== user.id) {
                        await showAlert(t('본인의 댓글만 수정할 수 있습니다'));
                        return;
                    }

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
                    // Update existing comment (anonymous) - works for both logged-in and anon users
                    const { data, error } = await supabase
                        .rpc('update_anonymous_comment', {
                            p_comment_id: commentId,
                            p_password: password,
                            p_content: content.trim(),
                            p_nickname: nickname.trim()
                        });

                    if (error) throw error;
                    if (!data) {
                        await showAlert(t('비밀번호가 일치하지 않습니다'));
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
            } else {
                await showAlert(t('댓글이 수정되었습니다'));
            }
            onCommentAdded();
        } catch (err) {
            console.error('Error submitting comment:', err);
            await showAlert(t('댓글 작성 실패'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-4 p-4 bg-slate-900/30 rounded-xl border border-slate-800/50">
            <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    {/* Placeholder Avatar */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
            <div className="flex-grow space-y-3">
                <div className="flex gap-2">
                    <div className="flex-1 min-w-0 max-w-[200px]">
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder={t('닉네임')}
                            className="w-full bg-slate-950/50 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            disabled={isSubmitting}
                            required
                            maxLength={12}
                        />
                        <p className="text-xs text-slate-500 mt-1 text-right">{nickname.length}/12</p>
                    </div>
                    {showPasswordField && (
                        <div className="flex-1 min-w-0 max-w-[200px]">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t('비밀번호')}
                                className="w-full bg-slate-950/50 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                disabled={isSubmitting}
                                required={isAnonymousComment || !commentId}
                                autoComplete='new-password'
                                maxLength={4}
                            />
                            <p className="text-xs text-slate-500 mt-1 text-right">{password.length}/4</p>
                        </div>
                    )}
                </div>

                <div className="relative">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={t('댓글을 입력하세요')}
                        className="w-full min-h-[100px] bg-slate-950/50 rounded-lg border border-slate-800 p-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y transition-all"
                        disabled={isSubmitting}
                        required
                        maxLength={200}
                    />
                    <p className="absolute bottom-3 right-3 text-xs text-slate-500 pointer-events-none">
                        {content.length}/200
                    </p>
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
                            {t('취소')}
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={isSubmitting || !content.trim() || !nickname.trim() || (showPasswordField && !password.trim())}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6"
                    >
                        {isSubmitting ? (commentId ? t('수정 중') : t('등록 중')) : (commentId ? t('수정') : t('등록'))}
                    </Button>
                </div>
            </div>
        </form>
    );
}
