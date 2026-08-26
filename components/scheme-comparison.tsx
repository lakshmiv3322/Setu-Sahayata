'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRight, ExternalLink, Scale, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/lib/language-context';
import type { Scheme } from '@/lib/types';

interface SchemeComparisonProps {
  schemes: Scheme[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (schemeId: string) => void;
}

export function SchemeComparison({ schemes, open, onOpenChange, onApply }: SchemeComparisonProps) {
  const { t, isHindi } = useLanguage();

  if (schemes.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
        <DialogHeader>
          <div className="flex items-center gap-2 text-setu-600 dark:text-setu-400">
            <Scale className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">{t('Side-by-Side Comparison', 'आमने-सामने तुलना')}</span>
          </div>
          <DialogTitle className="text-2xl font-bold font-display text-setu-950 dark:text-setu-50">
            {t('Compare Selected Welfare Schemes', 'चयनित कल्याणकारी योजनाओं की तुलना करें')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('Evaluate financial benefits, eligibility criteria, and application times to choose the best scheme for your household.', 'अपने परिवार के लिए सबसे अच्छी योजना चुनने के लिए वित्तीय लाभ, पात्रता मानदंड और आवेदन के समय का मूल्यांकन करें।')}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm text-left">
            <thead>
              <tr className="border-b border-setu-100 dark:border-setu-900/60">
                <th className="py-3 px-4 font-semibold text-muted-foreground w-1/4">
                  {t('Feature', 'विशेषता')}
                </th>
                {schemes.map((s) => (
                  <th key={s.id} className="py-3 px-4 font-bold text-setu-900 dark:text-setu-100 w-1/4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="line-clamp-2">{isHindi ? s.nameHindi : s.name}</span>
                      <Badge className="bg-setu-100 text-setu-800 dark:bg-setu-900 dark:text-setu-200 border-none shrink-0 text-[10px]">
                        {s.matchPercent || 85}% {t('Match', 'मैच')}
                      </Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-setu-100/60 dark:divide-setu-900/40">
              {/* Category */}
              <tr>
                <td className="py-3 px-4 font-medium text-muted-foreground">{t('Category', 'श्रेणी')}</td>
                {schemes.map((s) => (
                  <td key={s.id} className="py-3 px-4 font-medium text-setu-800 dark:text-setu-200">
                    <span className="inline-block rounded-lg bg-setu-50 dark:bg-setu-950 px-2.5 py-1 text-xs font-semibold text-setu-700 dark:text-setu-300">
                      {s.category}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Financial Benefit */}
              <tr className="bg-setu-50/30 dark:bg-setu-950/20">
                <td className="py-3.5 px-4 font-semibold text-setu-900 dark:text-setu-100">{t('Direct Benefit', 'प्रत्यक्ष लाभ')}</td>
                {schemes.map((s) => (
                  <td key={s.id} className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 text-base">
                    {isHindi ? s.benefitHindi : s.benefitAmount || s.benefit}
                  </td>
                ))}
              </tr>

              {/* Ministry */}
              <tr>
                <td className="py-3 px-4 font-medium text-muted-foreground">{t('Ministry / Dept', 'मंत्रालय / विभाग')}</td>
                {schemes.map((s) => (
                  <td key={s.id} className="py-3 px-4 text-xs text-muted-foreground">
                    {isHindi ? s.ministryHindi : s.ministry}
                  </td>
                ))}
              </tr>

              {/* Time to Apply */}
              <tr>
                <td className="py-3 px-4 font-medium text-muted-foreground">{t('Time to Apply', 'आवेदन का समय')}</td>
                {schemes.map((s) => (
                  <td key={s.id} className="py-3 px-4 text-xs font-medium text-setu-700 dark:text-setu-300">
                    ⏱️ {isHindi ? s.timeToApplyHindi : s.timeToApply}
                  </td>
                ))}
              </tr>

              {/* Key Eligibility Rules */}
              <tr>
                <td className="py-3 px-4 font-medium text-muted-foreground">{t('Key Requirements', 'मुख्य आवश्यकताएं')}</td>
                {schemes.map((s) => (
                  <td key={s.id} className="py-3 px-4 text-xs">
                    <ul className="space-y-1">
                      {(s.eligibilityTags || []).slice(0, 3).map((tag, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-muted-foreground">
                          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span>{tag}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Action row */}
              <tr>
                <td className="py-4 px-4 font-medium text-muted-foreground"></td>
                {schemes.map((s) => (
                  <td key={s.id} className="py-4 px-4">
                    <Button
                      size="sm"
                      onClick={() => {
                        onOpenChange(false);
                        onApply(s.id);
                      }}
                      className="w-full gap-1.5 rounded-xl bg-setu-600 hover:bg-setu-700 text-xs shadow-sm"
                    >
                      <span>{t('Apply Now', 'अभी आवेदन करें')}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
