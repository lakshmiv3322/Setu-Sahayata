'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Language } from './types';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggle: () => void;
  t: (en: string, hi: string) => string;
  isHindi: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const toggle = useCallback(
    () => setLanguage((prev) => (prev === 'en' ? 'hi' : 'en')),
    []
  );

  const t = useCallback(
    (en: string, hi: string) => (language === 'en' ? en : hi),
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggle, t, isHindi: language === 'hi' }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
