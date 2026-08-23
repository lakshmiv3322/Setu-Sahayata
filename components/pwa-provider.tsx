'use client';

import { useEffect } from 'react';
import { OfflineBanner } from './offline-banner';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[SetuPWA] ServiceWorker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[SetuPWA] ServiceWorker registration failed:', err);
        });
    }
  }, []);

  return (
    <>
      <OfflineBanner />
      {children}
    </>
  );
}
