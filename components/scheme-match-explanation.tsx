'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import type { MatchExplanation } from '@/lib/match-schemes';

interface SchemeMatchExplanationProps {
  matchPercent: number;
  explanation?: MatchExplanation;
}

export function SchemeMatchExplanation({ matchPercent, explanation }: SchemeMatchExplanationProps) {
  const { t, isHindi } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  if (!explanation) return null;

  const passedList = isHindi && explanation.passedHindi ? explanation.passedHindi : explanation.passed;
  const failedList = isHindi && explanation.failedHindi ? explanation.failedHindi : explanation.failed;

  return (
    <div className="mt-3 border-t border-trust-100 pt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-xs font-semibold text-trust-700 hover:text-trust-900 transition"
      >
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-trust-600" />
          {t('Transparency Breakdown (Why this match?)', 'पारदर्शिता विवरण (यह मिलान क्यों?)')}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-trust-600">
          {matchPercent}% Match {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </span>
      </button>

      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 space-y-2 text-xs bg-trust-50/60 rounded-xl p-3">
          {passedList.length > 0 && (
            <div>
              <span className="font-bold text-emerald-800 text-[11px] block mb-1">
                ✓ {t('Passed Criteria', 'सफल मापदंड')}:
              </span>
              <ul className="space-y-1">
                {passedList.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-emerald-900 text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {failedList.length > 0 && (
            <div className={passedList.length > 0 ? 'mt-2 pt-2 border-t border-trust-100' : ''}>
              <span className="font-bold text-amber-800 text-[11px] block mb-1">
                ✗ {t('Pending / Unmet Criteria', 'लंबित / अपूर्ण मापदंड')}:
              </span>
              <ul className="space-y-1">
                {failedList.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-amber-900 text-[11px]">
                    <XCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
