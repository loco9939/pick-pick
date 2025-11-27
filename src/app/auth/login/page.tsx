'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;

                if (data.session) {
                    // Auto-confirmed or already confirmed
                    router.push('/');
                    router.refresh();
                } else if (data.user) {
                    // Needs confirmation
                    alert('Check your email for the confirmation link!');
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/');
                router.refresh();
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center px-4">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[500px] min-h-[calc(100vh-256px)]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {isSignUp ? 'Create an account' : 'Welcome back'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email to {isSignUp ? 'sign up' : 'sign in'}
                    </p>
                </div>
                <div className="grid gap-6">
                    <form onSubmit={handleEmailAuth}>
                        <div className="grid gap-2">
                            <div className="grid gap-1">
                                <label className="sr-only" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    placeholder="name@example.com"
                                    type="email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    disabled={isLoading}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                />
                                <label className="sr-only" htmlFor="password">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    placeholder="Password"
                                    type="password"
                                    autoCapitalize="none"
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                />
                            </div>
                            <button
                                disabled={isLoading}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                            >
                                {isLoading && (
                                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                )}
                                {isSignUp ? 'Sign Up with Email' : 'Sign In with Email'}
                            </button>
                        </div>
                    </form>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                        >
                            {isSignUp ? 'Sign Up with Google' : 'Sign In with Google'}
                        </button>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="underline hover:text-primary"
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
