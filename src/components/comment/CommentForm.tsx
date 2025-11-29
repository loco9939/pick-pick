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
        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            <div className='flex gap-2'>
                <div className='flex-1'>
                    <label htmlFor="nickname" className="block text-sm font-medium text-slate-300 mb-1">
                        {t('닉네임')}
                    </label>
                    <input
                        type="text"
                        id="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder={t('닉네임을 입력하세요')}
                        className="w-full rounded-md border p-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        disabled={isSubmitting}
                        required
                    />
                </div>
                {showPasswordField && (
                    <div className='flex-1'>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                            {t('비밀번호')}
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('비밀번호 (수정/삭제용)')}
                            className="w-full rounded-md border p-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            disabled={isSubmitting}
                            required={isAnonymousComment || !commentId}
                            autoComplete='new-password'
                        />
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-1">
                    {t('댓글')}
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={t('댓글을 입력하세요')}
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
                        {t('취소')}
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={isSubmitting || !content.trim() || !nickname.trim() || (showPasswordField && !password.trim())}
                >
                    {isSubmitting ? (commentId ? t('수정 중') : t('게시 중')) : (commentId ? t('수정') : t('게시'))}
                </Button>
            </div>
        </form>
    );
}
