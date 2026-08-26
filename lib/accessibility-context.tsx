'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type A11yMode = 'standard' | 'low-literacy' | 'senior';
export type FontSizeScale = 'sm' | 'md' | 'lg' | 'xl';

interface AccessibilityContextValue {
  a11yMode: A11yMode;
  setA11yMode: (mode: A11yMode) => void;
  isLowLiteracy: boolean;
  isSenior: boolean;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  dyslexicFont: boolean;
  setDyslexicFont: (enabled: boolean) => void;
  fontSize: FontSizeScale;
  setFontSize: (size: FontSizeScale) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [a11yMode, setA11yModeState] = useState<A11yMode>('standard');
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [dyslexicFont, setDyslexicFontState] = useState<boolean>(false);
  const [fontSize, setFontSizeState] = useState<FontSizeScale>('md');

  useEffect(() => {
    const savedMode = localStorage.getItem('setu_a11y_mode') as A11yMode;
    if (savedMode && (savedMode === 'standard' || savedMode === 'low-literacy' || savedMode === 'senior')) {
      setA11yModeState(savedMode);
    }
    const savedHC = localStorage.getItem('setu_high_contrast') === 'true';
    setHighContrastState(savedHC);

    const savedDF = localStorage.getItem('setu_dyslexic_font') === 'true';
    setDyslexicFontState(savedDF);

    const savedFS = localStorage.getItem('setu_font_size') as FontSizeScale;
    if (savedFS && ['sm', 'md', 'lg', 'xl'].includes(savedFS)) {
      setFontSizeState(savedFS);
    }
  }, []);

  const setA11yMode = useCallback((mode: A11yMode) => {
    setA11yModeState(mode);
    localStorage.setItem('setu_a11y_mode', mode);
  }, []);

  const setHighContrast = useCallback((enabled: boolean) => {
    setHighContrastState(enabled);
    localStorage.setItem('setu_high_contrast', String(enabled));
  }, []);

  const setDyslexicFont = useCallback((enabled: boolean) => {
    setDyslexicFontState(enabled);
    localStorage.setItem('setu_dyslexic_font', String(enabled));
  }, []);

  const setFontSize = useCallback((size: FontSizeScale) => {
    setFontSizeState(size);
    localStorage.setItem('setu_font_size', size);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('a11y-low-literacy', 'a11y-senior', 'a11y-high-contrast', 'a11y-dyslexic');
    if (a11yMode === 'low-literacy') root.classList.add('a11y-low-literacy');
    if (a11yMode === 'senior') root.classList.add('a11y-senior');
    if (highContrast) root.classList.add('a11y-high-contrast');
    if (dyslexicFont) root.classList.add('a11y-dyslexic');

    const scaleMap: Record<FontSizeScale, string> = {
      sm: '95%',
      md: '100%',
      lg: '110%',
      xl: '120%',
    };
    root.style.fontSize = scaleMap[fontSize] || '100%';
  }, [a11yMode, highContrast, dyslexicFont, fontSize]);

  return (
    <AccessibilityContext.Provider
      value={{
        a11yMode,
        setA11yMode,
        isLowLiteracy: a11yMode === 'low-literacy',
        isSenior: a11yMode === 'senior',
        highContrast,
        setHighContrast,
        dyslexicFont,
        setDyslexicFont,
        fontSize,
        setFontSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return ctx;
}
