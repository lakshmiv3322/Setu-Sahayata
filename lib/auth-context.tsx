'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabaseBrowser as supabase } from './supabase-browser';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; needsEmailConfirm?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Set the demo-session cookie so the middleware lets mock users through. */
function setDemoCookie(isAdmin = false) {
  document.cookie = 'setu_demo_session=1; path=/; max-age=86400; SameSite=Lax';
  if (isAdmin) {
    document.cookie = 'setu_demo_admin=1; path=/; max-age=86400; SameSite=Lax';
  } else {
    // Clear admin cookie if citizen logs in
    document.cookie = 'setu_demo_admin=; path=/; max-age=0';
  }
}

/** Clear the demo-session cookies on sign-out. */
function clearDemoCookies() {
  document.cookie = 'setu_demo_session=; path=/; max-age=0';
  document.cookie = 'setu_demo_admin=; path=/; max-age=0';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialise from existing session
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      })
      .catch((err) => {
        console.warn('[AuthProvider] Session retrieval error:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Keep state in sync with Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const formatAuthError = (errMessage: string): string => {
    if (
      errMessage.includes('Failed to fetch') ||
      errMessage.includes('ENOTFOUND') ||
      errMessage.includes('ERR_NAME_NOT_RESOLVED') ||
      errMessage.includes('NetworkError') ||
      errMessage.includes('net::') ||
      errMessage.includes('Load failed')
    ) {
      return 'Could not reach the authentication server. Your Supabase project may be paused or the URL may be incorrect. Please check your .env file and ensure the project is active at supabase.com.';
    }
    if (errMessage.includes('Invalid login credentials') || errMessage.includes('invalid_credentials')) {
      return 'Incorrect email or password. Please try again.';
    }
    if (errMessage.includes('Email not confirmed')) {
      return 'Please verify your email address before signing in. Check your inbox for a confirmation link.';
    }
    if (errMessage.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (
      errMessage.toLowerCase().includes('rate limit') ||
      errMessage.toLowerCase().includes('rate_limit') ||
      errMessage.toLowerCase().includes('too many requests')
    ) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    if (errMessage.includes('Invalid API key') || errMessage.includes('apikey')) {
      return 'Authentication service is misconfigured. Using demo mode instead.';
    }
    return errMessage;
  };

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) {
        // If network/credentials error, fall back to demo mode
        const formattedErr = formatAuthError(error.message);
        if (
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('Load failed') ||
          error.message.includes('Invalid API key')
        ) {
          // Create a demo user so the app is still usable
          const mockUser: User = {
            id: '00000000-0000-0000-0000-000000000002',
            app_metadata: {},
            user_metadata: { full_name: name },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          };
          setUser(mockUser);
          setDemoCookie(false);
          return { error: null };
        }
        return { error: formattedErr };
      }
      // If Supabase returned a user but with unconfirmed email
      if (data.user && !data.session) {
        return { error: null, needsEmailConfirm: true };
      }
      return { error: null };
    } catch (err: any) {
      const msg: string = err?.message || 'Authentication request failed';
      // Network failure — use demo mode
      if (
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('Load failed')
      ) {
        const mockUser: User = {
          id: '00000000-0000-0000-0000-000000000002',
          app_metadata: {},
          user_metadata: { full_name: name },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        setUser(mockUser);
        setDemoCookie(false);
        return { error: null };
      }
      return { error: formatAuthError(msg) };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      // 1. Check if demo email → instant mock login
      if (email.includes('demo@setusahayata.in')) {
        const isAdmin = email.includes('admin');
        const mockUser: User = {
          id: isAdmin ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002',
          app_metadata: {},
          user_metadata: {
            full_name: isAdmin ? 'Nodal Admin Officer' : 'Priya Sharma',
          },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        setUser(mockUser);
        setSession({
          access_token: 'demo-token',
          refresh_token: 'demo-refresh',
          expires_in: 3600,
          token_type: 'bearer',
          user: mockUser,
        });
        setDemoCookie(isAdmin);
        return { error: null };
      }

      // 2. Try real Supabase auth
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // If it's a network/config error, fall back to demo mode so the app stays usable
        if (
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('Load failed') ||
          error.message.includes('net::') ||
          error.message.includes('Invalid API key')
        ) {
          const mockUser: User = {
            id: '00000000-0000-0000-0000-000000000002',
            app_metadata: {},
            user_metadata: { full_name: email.split('@')[0] || 'Citizen' },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          };
          setUser(mockUser);
          setDemoCookie(false);
          return { error: null };
        }
        return { error: formatAuthError(error.message) };
      }
      return { error: null };
    } catch (err: any) {
      const msg: string = err?.message || 'Sign in request failed';
      // Network failure fallback
      if (
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('Load failed')
      ) {
        const mockUser: User = {
          id: '00000000-0000-0000-0000-000000000002',
          app_metadata: {},
          user_metadata: { full_name: email.split('@')[0] || 'Citizen' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        setUser(mockUser);
        setDemoCookie(false);
        return { error: null };
      }
      return { error: formatAuthError(msg) };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      clearDemoCookies();
      setUser(null);
      setSession(null);
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[AuthProvider] Sign out error:', err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
