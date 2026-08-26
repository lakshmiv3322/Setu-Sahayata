'use client';

import { Eye, BookOpen, UserCheck, Sun, Type, Sliders } from 'lucide-react';
import { useAccessibility, type A11yMode, type FontSizeScale } from '@/lib/accessibility-context';
import { useLanguage } from '@/lib/language-context';

const MODES: { key: A11yMode; label: string; labelHindi: string; icon: React.ComponentType<{ className?: string }>; desc: string; descHindi: string }[] = [
  {
    key: 'standard',
    label: 'Standard',
    labelHindi: 'मानक',
    icon: Eye,
    desc: 'Default interface',
    descHindi: 'डिफ़ॉल्ट इंटरफ़ेस',
  },
  {
    key: 'low-literacy',
    label: 'Low-Literacy',
    labelHindi: 'सरल मोड',
    icon: BookOpen,
    desc: 'Larger text, bigger tap targets',
    descHindi: 'बड़ा टेक्स्ट, बड़े बटन',
  },
  {
    key: 'senior',
    label: 'Senior Mode',
    labelHindi: 'वरिष्ठ मोड',
    icon: UserCheck,
    desc: 'Extra-large text, high contrast',
    descHindi: 'अतिरिक्त बड़ा टेक्स्ट, उच्च कंट्रास्ट',
  },
];

export function AccessibilityModeSelector() {
  const {
    a11yMode,
    setA11yMode,
    highContrast,
    setHighContrast,
    dyslexicFont,
    setDyslexicFont,
    fontSize,
    setFontSize,
  } = useAccessibility();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {t('Display Mode', 'प्रदर्शन मोड')}
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = a11yMode === mode.key;
            return (
              <button
                key={mode.key}
                onClick={() => setA11yMode(mode.key)}
                aria-pressed={isActive}
                className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all focus-visible:ring-2 focus-visible:ring-trust-500 ${
                  isActive
                    ? 'border-trust-500 bg-trust-50 text-trust-900 shadow-sm'
                    : 'border-trust-100 bg-white text-muted-foreground hover:border-trust-300 hover:bg-trust-50/50'
                }`}
              >
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  isActive ? 'bg-trust-600 text-white' : 'bg-trust-100 text-trust-500'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{t(mode.label, mode.labelHindi)}</span>
                    {isActive && (
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-trust-600 text-white text-[10px] font-bold">✓</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{t(mode.desc, mode.descHindi)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* High Contrast & Dyslexia Toggles */}
      <div className="pt-4 border-t border-trust-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => setHighContrast(!highContrast)}
          className={`flex items-center justify-between p-3 rounded-xl border-2 text-left transition ${
            highContrast ? 'border-trust-600 bg-trust-60 text-trust-900 font-bold' : 'border-trust-100 bg-white text-trust-800'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Sun className="h-4 w-4 text-trust-600" />
            <span>{t('High Contrast Mode', 'उच्च कंट्रास्ट मोड')}</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${highContrast ? 'bg-trust-600 text-white' : 'bg-trust-100 text-trust-700'}`}>
            {highContrast ? 'ON' : 'OFF'}
          </span>
        </button>

        <button
          onClick={() => setDyslexicFont(!dyslexicFont)}
          className={`flex items-center justify-between p-3 rounded-xl border-2 text-left transition ${
            dyslexicFont ? 'border-trust-600 bg-trust-60 text-trust-900 font-bold' : 'border-trust-100 bg-white text-trust-800'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Type className="h-4 w-4 text-trust-600" />
            <span>{t('Dyslexia-Friendly Font', 'डिसलेक्सिया-अनुकूल फ़ॉन्ट')}</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${dyslexicFont ? 'bg-trust-600 text-white' : 'bg-trust-100 text-trust-700'}`}>
            {dyslexicFont ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Text Size Scale Selector */}
      <div className="pt-4 border-t border-trust-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-trust-600" />
            {t('Text Size Scale', 'पाठ का आकार स्केल')}
          </span>
          <span className="text-xs font-bold text-trust-800 uppercase">{fontSize}</span>
        </div>
        <div className="flex gap-2">
          {(['sm', 'md', 'lg', 'xl'] as FontSizeScale[]).map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={`flex-1 py-2 rounded-lg border text-xs font-bold transition ${
                fontSize === size ? 'border-trust-600 bg-trust-600 text-white' : 'border-trust-100 bg-white text-trust-700 hover:bg-trust-50'
              }`}
            >
              {size.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
