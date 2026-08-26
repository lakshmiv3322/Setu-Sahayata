'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Language } from './types';
import { SUPPORTED_LANGUAGES } from './types';

export type TranslationMap = {
  en: string;
  hi?: string;
  ta?: string;
  te?: string;
  bn?: string;
  mr?: string;
  kn?: string;
  [key: string]: string | undefined;
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggle: () => void;
  t: (enOrMap: string | TranslationMap, fallbackHi?: string) => string;
  isHindi: boolean;
  bcp47: string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('setu_language') as Language;
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('setu_language', lang);
  }, []);

  const toggle = useCallback(() => {
    setLanguageState((prev) => {
      const idx = SUPPORTED_LANGUAGES.findIndex((l) => l.code === prev);
      const nextIndex = (idx + 1) % SUPPORTED_LANGUAGES.length;
      const next = SUPPORTED_LANGUAGES[nextIndex].code;
      localStorage.setItem('setu_language', next);
      return next;
    });
  }, []);

  const t = useCallback(
    (enOrMap: string | TranslationMap, fallbackHi?: string): string => {
      if (typeof enOrMap === 'object' && enOrMap !== null) {
        return enOrMap[language] || enOrMap['hi'] || enOrMap['en'] || '';
      }
      if (language === 'hi' && fallbackHi) return fallbackHi;
      return enOrMap;
    },
    [language]
  );

  const activeLangOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggle,
        t,
        isHindi: language === 'hi',
        bcp47: activeLangOption.bcp47,
      }}
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
