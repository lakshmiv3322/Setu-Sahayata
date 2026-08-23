'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/lib/language-context';
import { logAuditEvent } from '@/lib/audit-logger';

interface SensitiveFieldItem {
  key: string;
  name: string;
  nameHindi: string;
  value: string;
  purpose: string;
  purposeHindi: string;
}

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (consentedKeys: string[]) => void;
  sensitiveFields: SensitiveFieldItem[];
}

export function ConsentModal({
  isOpen,
  onClose,
  onConfirm,
  sensitiveFields,
}: ConsentModalProps) {
  const { t, isHindi } = useLanguage();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set(sensitiveFields.map((f) => f.key))
  );

  if (!isOpen) return null;

  const toggleKey = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSave = async () => {
    const granted = Array.from(selectedKeys);
    await logAuditEvent('CONSENT_GRANTED', {
      granted_fields: granted,
      total_fields: sensitiveFields.length,
    });
    onConfirm(granted);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg"
        >
          <Card className="overflow-hidden border-trust-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-trust-600 to-trust-800 px-6 py-5 text-white">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {t('Data Storage Consent', 'डेटा भंडारण सहमति')}
                </h3>
                <p className="text-xs text-trust-200">
                  {t('DPDP Compliant · You control your data', 'डीपीडीपी अनुपालन · आप अपने डेटा को नियंत्रित करते हैं')}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-trust-800 leading-relaxed">
                {t(
                  'Setu Sahayata requires your explicit consent before saving sensitive personal attributes. We store only what is required to verify welfare scheme eligibility.',
                  'सेतु सहायता को संवेदनशील व्यक्तिगत जानकारी सहेजने से पहले आपकी स्पष्ट सहमति की आवश्यकता है। हम केवल वही सहेजते हैं जो कल्याणकारी योजना पात्रता की पुष्टि के लिए आवश्यक है।'
                )}
              </p>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {sensitiveFields.map((item) => {
                  const isChecked = selectedKeys.has(item.key);
                  return (
                    <div
                      key={item.key}
                      onClick={() => toggleKey(item.key)}
                      className={`cursor-pointer flex items-start gap-3 rounded-xl border p-3.5 transition-all ${
                        isChecked
                          ? 'border-trust-300 bg-trust-50/60 shadow-sm'
                          : 'border-muted bg-muted/20 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Controlled by div click
                        className="mt-1 h-4 w-4 rounded border-trust-300 text-trust-600 focus:ring-trust-500"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-trust-900 text-sm">
                            {isHindi ? item.nameHindi : item.name}
                          </span>
                          <span className="font-mono text-trust-600 font-semibold bg-white px-2 py-0.5 rounded border border-trust-100">
                            {item.value}
                          </span>
                        </div>
                        <p className="mt-1 text-muted-foreground">
                          <span className="font-medium text-trust-700">{t('Why:', 'क्यों:')}</span>{' '}
                          {isHindi ? item.purposeHindi : item.purpose}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Security Banner */}
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
                <Lock className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  {t(
                    'Your data is protected by Row-Level Security (RLS) and encrypted in transit.',
                    'आपका डेटा रो-लेवल सिक्योरिटी (RLS) द्वारा सुरक्षित है और एन्क्रिप्टेड है।'
                  )}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-trust-100 bg-trust-50/30 px-6 py-4">
              <Button variant="outline" size="sm" onClick={onClose}>
                {t('Cancel', 'रद्द करें')}
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={selectedKeys.size === 0}
                className="gap-2 bg-trust-600 hover:bg-trust-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                {t('I Agree & Save Profile', 'मैं सहमत हूँ और प्रोफ़ाइल सहेजें')}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
