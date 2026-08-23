'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export function OfflineBanner() {
  const { t } = useLanguage();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-16 left-0 right-0 z-40 bg-amber-500 text-white px-4 py-2 text-center text-xs font-semibold shadow-md flex items-center justify-center gap-2"
        >
          <WifiOff className="h-4 w-4" />
          <span>
            {t(
              'Offline Mode Active — Browsing cached scheme information. Reconnect to submit applications or use AI features.',
              'ऑफ़लाइन मोड सक्रिय — सहेजी गई जानकारी देख रहे हैं। आवेदन जमा करने के लिए इंटरनेट से जुड़ें।'
            )}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
