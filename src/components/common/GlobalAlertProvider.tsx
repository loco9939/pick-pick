'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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

interface GlobalAlertContextType {
    showAlert: (message: string | ReactNode, title?: string) => Promise<void>;
    showConfirm: (message: string, title?: string) => Promise<boolean>;
}

const GlobalAlertContext = createContext<GlobalAlertContextType | undefined>(undefined);

export function useGlobalAlert() {
    const context = useContext(GlobalAlertContext);
    if (!context) {
        throw new Error('useGlobalAlert must be used within a GlobalAlertProvider');
    }
    return context;
}

export function GlobalAlertProvider({ children }: { children: React.ReactNode }) {
    const t = useTranslations();
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<{
        type: 'alert' | 'confirm';
        title: string;
        message: string | ReactNode;
        resolve: (value: any) => void;
    } | null>(null);

    const showAlert = useCallback((message: string | ReactNode, title?: string) => {
        return new Promise<void>((resolve) => {
            setConfig({
                type: 'alert',
                title: title || t('알림'), // Default title 'Notice' or 'Alert'
                message,
                resolve,
            });
            setIsOpen(true);
        });
    }, [t]);

    const showConfirm = useCallback((message: string, title?: string) => {
        return new Promise<boolean>((resolve) => {
            setConfig({
                type: 'confirm',
                title: title || t('확인'), // Default title 'Confirm'
                message,
                resolve,
            });
            setIsOpen(true);
        });
    }, [t]);

    const handleClose = (result: boolean) => {
        setIsOpen(false);
        if (config) {
            if (config.type === 'confirm') {
                config.resolve(result);
            } else {
                config.resolve(undefined);
            }
        }
        // Small delay to allow animation to finish before clearing config? 
        // Or just clear it. 
        setTimeout(() => setConfig(null), 300);
    };

    return (
        <GlobalAlertContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleClose(false)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{config?.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {config?.message}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        {config?.type === 'confirm' && (
                            <AlertDialogCancel onClick={() => handleClose(false)}>
                                {t('취소')}
                            </AlertDialogCancel>
                        )}
                        <AlertDialogAction onClick={() => handleClose(true)}>
                            {t('확인')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </GlobalAlertContext.Provider>
    );
}
