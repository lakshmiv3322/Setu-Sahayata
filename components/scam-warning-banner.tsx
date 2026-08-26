'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';

export function ScamWarningBanner() {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('setu_scam_banner_dismissed');
    if (!isDismissed) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('setu_scam_banner_dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm backdrop-blur-md dark:border-amber-900/50 dark:bg-amber-950/40"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex-1 text-sm">
            <h4 className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <span>⚠️ {t('Citizen Trust & Anti-Fraud Advisory', 'नागरिक विश्वास एवं धोखाधड़ी-विरोधी सलाह')}</span>
            </h4>
            <p className="mt-1 text-amber-800/90 dark:text-amber-300/90 leading-relaxed text-xs sm:text-sm">
              {t(
                'Applying for government schemes on Setu Sahayata is 100% FREE. Never pay any money, bribe, or commission to middle-men or agents promising "guaranteed approval". Official government processing has no fee.',
                'सेतु सहायता पर सरकारी योजनाओं के लिए आवेदन करना 100% मुफ़्त है। "गारंटीकृत स्वीकृति" का वादा करने वाले बिचौलियों या एजेंटों को कभी भी कोई पैसा, रिश्वत या कमीशन न दें। आधिकारिक सरकारी प्रक्रिया का कोई शुल्क नहीं है।'
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8 text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
