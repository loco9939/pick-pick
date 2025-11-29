'use client';

import React, { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTranslations } from 'next-intl';

interface PasswordPromptDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (password: string) => void;
}

export default function PasswordPromptDialog({ isOpen, onClose, onSubmit }: PasswordPromptDialogProps) {
    const t = useTranslations();
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(password);
        setPassword('');
        onClose();
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('삭제하려면 비밀번호를 입력하세요:')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {/* Empty description or some text */}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="py-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-md border p-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-slate-900 text-white"
                            placeholder={t('비밀번호')}
                            autoFocus
                            autoComplete="new-password"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel type="button" onClick={onClose}>
                            {t('취소')}
                        </AlertDialogCancel>
                        <AlertDialogAction type="submit" disabled={!password.trim()}>
                            {t('삭제')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
