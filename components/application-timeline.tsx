'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export interface TimelineStep {
  label: string;
  labelHindi: string;
  status: 'completed' | 'current' | 'pending' | 'rejected';
  timestamp?: string;
  note?: string;
}

interface ApplicationTimelineProps {
  currentStatus: string;
  submittedAt: string;
  outcomeNote?: string;
}

export function ApplicationTimeline({ currentStatus, submittedAt, outcomeNote }: ApplicationTimelineProps) {
  const { t } = useLanguage();

  const formattedDate = new Date(submittedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getSteps = (): TimelineStep[] => {
    const isRejected = currentStatus.toLowerCase().includes('reject');
    const isApproved = currentStatus.toLowerCase().includes('approve');
    const isDisbursed = currentStatus.toLowerCase().includes('disburs');

    return [
      {
        label: t('Application Submitted', 'आवेदन जमा किया गया'),
        labelHindi: 'आवेदन जमा किया गया',
        status: 'completed',
        timestamp: formattedDate,
        note: t('Document kit generated and verified', 'दस्तावेज़ किट जनरेट और सत्यापित'),
      },
      {
        label: t('Under Official Review', 'आधिकारिक समीक्षा के अधीन'),
        labelHindi: 'आधिकारिक समीक्षा के अधीन',
        status: isRejected ? 'completed' : isApproved || isDisbursed ? 'completed' : 'current',
        timestamp: isApproved || isDisbursed || isRejected ? formattedDate : undefined,
        note: t('Assigned to Nodal Officer / Department', 'नोडल अधिकारी / विभाग को सौंपा गया'),
      },
      {
        label: isRejected ? t('Application Rejected', 'आवेदन अस्वीकृत') : t('Sanction / Approval', 'स्वीकृति / अनुमोदन'),
        labelHindi: isRejected ? 'आवेदन अस्वीकृत' : 'स्वीकृति / अनुमोदन',
        status: isRejected ? 'rejected' : isApproved || isDisbursed ? 'completed' : 'pending',
        timestamp: isApproved || isDisbursed || isRejected ? formattedDate : undefined,
        note: outcomeNote || (isRejected ? t('Verification mismatch in documents', 'दस्तावेजों में सत्यापन बेमेल') : t('Benefit sanctioned by authority', 'प्राधिकरण द्वारा लाभ स्वीकृत')),
      },
      {
        label: t('Direct Benefit Disbursed', 'प्रत्यक्ष लाभ वितरित'),
        labelHindi: 'प्रत्यक्ष लाभ वितरित',
        status: isDisbursed ? 'completed' : isRejected ? 'pending' : isApproved ? 'current' : 'pending',
        timestamp: isDisbursed ? formattedDate : undefined,
        note: t('Transferred to DBT bank account', 'डीबीटी बैंक खाते में स्थानांतरित'),
      },
    ];
  };

  const steps = getSteps();

  return (
    <div className="rounded-2xl border border-trust-100 bg-gradient-to-b from-trust-50/50 to-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-trust-600" />
        <h4 className="text-sm font-bold text-trust-900">
          {t('Real-Time Application Lifecycle', 'वास्तविक समय आवेदन जीवन चक्र')}
        </h4>
      </div>

      <div className="relative space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className="relative flex items-start gap-3">
            {/* Connecting line */}
            {idx < steps.length - 1 && (
              <div
                className={`absolute left-3.5 top-7 bottom-0 w-0.5 -ml-px ${
                  step.status === 'completed' ? 'bg-emerald-500' : 'bg-trust-200'
                }`}
              />
            )}

            {/* Step Icon */}
            <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              {step.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              {step.status === 'current' && (
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Clock className="h-5 w-5 text-trust-600" />
                </motion.div>
              )}
              {step.status === 'rejected' && <XCircle className="h-5 w-5 text-rose-600" />}
              {step.status === 'pending' && <AlertCircle className="h-4 w-4 text-gray-300" />}
            </div>

            {/* Step Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className={`text-xs font-bold ${step.status === 'rejected' ? 'text-rose-700' : step.status === 'completed' ? 'text-trust-900' : 'text-trust-700'}`}>
                  {step.label}
                </p>
                {step.timestamp && <span className="text-[10px] font-mono text-muted-foreground">{step.timestamp}</span>}
              </div>
              {step.note && <p className="mt-0.5 text-[11px] text-muted-foreground">{step.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
