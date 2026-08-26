'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/lib/language-context';

interface ProfileCompletenessProps {
  profile: any;
}

export function ProfileCompleteness({ profile }: ProfileCompletenessProps) {
  const { t } = useLanguage();

  // Calculate completeness score out of 100
  const fields = [
    { key: 'name', weight: 15, label: t('Full Name', 'पूरा नाम') },
    { key: 'age', weight: 15, label: t('Age', 'आयु') },
    { key: 'state', weight: 15, label: t('State & City', 'राज्य एवं शहर') },
    { key: 'income', weight: 20, label: t('Annual Income', 'वार्षिक आय') },
    { key: 'occupation', weight: 15, label: t('Occupation', 'व्यवसाय') },
    { key: 'has_aadhaar', weight: 10, label: t('Aadhaar Status', 'आधार स्थिति') },
    { key: 'has_ration_card', weight: 10, label: t('Ration Card Status', 'राशन कार्ड स्थिति') },
  ];

  let score = 0;
  const missingFields: string[] = [];

  fields.forEach((f) => {
    if (profile && profile[f.key] !== undefined && profile[f.key] !== null && profile[f.key] !== '') {
      score += f.weight;
    } else {
      missingFields.push(f.label);
    }
  });

  // Default to minimum 40% if user is logged in
  if (score < 40 && profile) score = 40;
  if (!profile) score = 30;

  const nextAction = missingFields[0] || t('Add Family Members', 'परिवार के सदस्य जोड़ें');

  return (
    <div className="rounded-2xl border border-setu-100/80 bg-gradient-to-br from-setu-50/80 via-white to-saffron-50/40 p-5 shadow-sm dark:border-setu-900/40 dark:from-setu-950/40 dark:via-card dark:to-saffron-950/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-setu-500 to-setu-700 text-white shadow-md shadow-setu-500/20">
            <ShieldCheck className="h-7 w-7" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-saffron-500 text-[10px] font-bold text-white shadow-sm"
            >
              ★
            </motion.div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-setu-950 dark:text-setu-100 text-base">
                {t('Profile Completeness', 'प्रोफ़ाइल पूर्णता')}
              </h3>
              <span className="rounded-full bg-setu-100 px-2.5 py-0.5 text-xs font-bold text-setu-800 dark:bg-setu-900/60 dark:text-setu-300">
                {score}%
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {score >= 80
                ? t('Excellent! Your profile unlocks maximum scheme match precision.', 'उत्कृष्ट! आपकी प्रोफ़ाइल अधिकतम योजना मिलान सटीकता अनलॉक करती है।')
                : t('Complete your details to unlock 100% accurate scheme eligibility.', '100% सटीक योजना पात्रता अनलॉक करने के लिए विवरण पूरा करें।')}
            </p>
          </div>
        </div>

        <Link href="/settings" className="shrink-0">
          <Button size="sm" className="gap-1.5 rounded-xl bg-setu-600 hover:bg-setu-700 text-xs font-semibold shadow-sm">
            <span>{t(`Complete ${nextAction}`, `${nextAction} पूरा करें`)}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5 font-medium">
          <span>{t('Match Accuracy Score', 'मिलान सटीकता स्कोर')}</span>
          <span className="font-bold text-setu-700 dark:text-setu-400">{score} / 100</span>
        </div>
        <Progress value={score} className="h-2.5 bg-setu-100 dark:bg-setu-900/40" />
      </div>
    </div>
  );
}
