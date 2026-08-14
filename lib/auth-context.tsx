'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase-client';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hackathon Demo Mode: Avoid hanging on Supabase network requests
    const storedUser = localStorage.getItem('demo_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Ignore parse error
      }
    }
    setLoading(false);
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    // Hackathon Demo Mode: Instant mock signup
    const demoUser = { id: 'demo-user-123', email, user_metadata: { full_name: name } } as any;
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // Hackathon Demo Mode: Instant mock login
    const demoUser = { id: 'demo-user-123', email, user_metadata: { full_name: email.split('@')[0] } } as any;
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    // Hackathon Demo Mode: Mock logout
    localStorage.removeItem('demo_user');
    setUser(null);
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
