'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileText,
  UserCheck,
  ClipboardCheck,
  PartyPopper,
  Copy,
  Check,
  TrendingUp,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { Confetti } from '@/components/confetti';
import { ScamWarningBanner } from '@/components/scam-warning-banner';
import { PrintableApplicationKit } from '@/components/printable-application-kit';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { useRequireAuth } from '@/lib/use-require-auth';
import { supabaseBrowser as supabase } from '@/lib/supabase-browser';
import type { ApplicationField } from '@/lib/types';

const steps = [
  { icon: FileText, label: 'Personal Information', labelHindi: 'व्यक्तिगत जानकारी' },
  { icon: UserCheck, label: 'Identity Verification', labelHindi: 'पहचान सत्यापन' },
  { icon: ClipboardCheck, label: 'Review & Submit', labelHindi: 'समीक्षा एवं प्रस्तुत करें' },
];

const TARGET_SCHEME = {
  id: 'pm-svanidhi',
  name: 'PM SVANidhi',
  nameHindi: 'पीएम स्वनिधि',
  benefitAmount: '₹10,000',
};

export default function ApplyPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();
  const { t, isHindi } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fields, setFields] = useState<ApplicationField[]>([]);
  const [generatedAt, setGeneratedAt] = useState('');

  const userDisplayName =
    (user?.user_metadata?.full_name as string) ||
    user?.email?.split('@')[0] ||
    'User';

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, age, gender, state, city, occupation, income, category, has_aadhaar, has_udyam')
        .eq('user_id', user.id)
        .maybeSingle();

      const p = profile as Record<string, unknown> | null;

      const profileName = (p?.name as string) || userDisplayName;
      const profileAge = p?.age ? String(p.age) : '';
      const profileGender = (p?.gender as string) || '';
      const profileState = (p?.state as string) || '';
      const profileCity = (p?.city as string) || '';
      const profileOccupation = (p?.occupation as string) || '';
      const profileIncome = p?.income ? String(p.income) : '';
      const profileCategory = (p?.category as string) || '';

      const dynamicFields: ApplicationField[] = [
        {
          id: 'name',
          label: 'Full Name',
          labelHindi: 'पूरा नाम',
          value: profileName,
          valueHindi: profileName,
          preFilled: Boolean(profileName),
          type: 'text',
        },
        {
          id: 'age',
          label: 'Age',
          labelHindi: 'आयु',
          value: profileAge,
          valueHindi: profileAge,
          preFilled: Boolean(profileAge),
          type: 'text',
        },
        {
          id: 'gender',
          label: 'Gender',
          labelHindi: 'लिंग',
          value: profileGender,
          valueHindi: profileGender,
          preFilled: Boolean(profileGender),
          type: 'select',
          options: ['Female', 'Male', 'Other'],
        },
        {
          id: 'aadhaar',
          label: 'Aadhaar Number',
          labelHindi: 'आधार नंबर',
          value: p?.has_aadhaar ? 'XXXX-XXXX-XXXX' : '',
          valueHindi: p?.has_aadhaar ? 'XXXX-XXXX-XXXX' : '',
          preFilled: Boolean(p?.has_aadhaar),
          type: 'text',
        },
        {
          id: 'address',
          label: 'Residential Address',
          labelHindi: 'आवासीय पता',
          value: profileCity && profileState ? `${profileCity}, ${profileState}` : '',
          valueHindi: profileCity && profileState ? `${profileCity}, ${profileState}` : '',
          preFilled: Boolean(profileCity && profileState),
          type: 'textarea',
        },
        {
          id: 'income',
          label: 'Annual Family Income (₹)',
          labelHindi: 'वार्षिक पारिवारिक आय (₹)',
          value: profileIncome,
          valueHindi: profileIncome,
          preFilled: Boolean(profileIncome),
          type: 'text',
        },
        {
          id: 'category',
          label: 'Social Category',
          labelHindi: 'सामाजिक श्रेणी',
          value: profileCategory,
          valueHindi: profileCategory,
          preFilled: Boolean(profileCategory),
          type: 'select',
          options: ['General', 'OBC', 'SC', 'ST'],
        },
        {
          id: 'vendingType',
          label: 'Street Vending Type',
          labelHindi: 'स्ट्रीट वेंडिंग का प्रकार',
          value: profileOccupation ? profileOccupation : 'Stationary Vendor',
          valueHindi: profileOccupation ? profileOccupation : 'स्थिर विक्रेता',
          preFilled: Boolean(profileOccupation),
          type: 'select',
          options: ['Stationary Vendor', 'Mobile Vendor', 'Peripatetic Vendor'],
        },
        {
          id: 'bankAccount',
          label: 'Bank Account Number',
          labelHindi: 'बैंक खाता संख्या',
          value: '',
          valueHindi: '',
          preFilled: false,
          type: 'text',
        },
        {
          id: 'ifscCode',
          label: 'IFSC Code',
          labelHindi: 'आईएफएससी कोड',
          value: '',
          valueHindi: '',
          preFilled: false,
          type: 'text',
        },
      ];

      setFields(dynamicFields);
    };

    loadProfile();
  }, [user, userDisplayName]);

  const updateFieldValue = (id: string, newValue: string) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, value: newValue, valueHindi: newValue } : f
      )
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);

    const generatedTrackingId = `SETU-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const { error } = await supabase.from('applications').insert({
        user_id: user.id,
        scheme_id: TARGET_SCHEME.id,
        scheme_name: TARGET_SCHEME.name,
        application_id: generatedTrackingId,
        status: 'Submitted',
        benefit_amount: TARGET_SCHEME.benefitAmount,
        submitted_at: new Date().toISOString(),
      });

      if (error) {
        setSubmitError(error.message);
      } else {
        setTrackingId(generatedTrackingId);
        setGeneratedAt(new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }));
        setSubmitted(true);
      }
    } catch {
      setSubmitError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyTrackingId = () => {
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const step1Fields = fields.slice(0, 5);
  const step2Fields = fields.slice(5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-setu-50/60 via-white to-saffron-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <Navbar />
      {submitted && <Confetti active={true} />}

      <div className="mx-auto max-w-4xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        {/* Scam Warning Banner */}
        <ScamWarningBanner />

        {!submitted ? (
          <>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
              <Badge className="bg-setu-100 text-setu-800 dark:bg-setu-950 dark:text-setu-300 border-none mb-2">
                ⚡ {t('Auto-Filled Application Engine', 'ऑटो-भरी आवेदन प्रणाली')}
              </Badge>
              <h1 className="font-display text-3xl font-extrabold text-setu-950 dark:text-setu-50 sm:text-4xl">
                {t('Apply for ', 'आवेदन करें ')}
                <span className="text-gradient-hero">{isHindi ? TARGET_SCHEME.nameHindi : TARGET_SCHEME.name}</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('90% of fields are automatically pre-filled from your vault documents.', '90% फ़ील्ड आपके वॉल्ट दस्तावेज़ों से स्वचालित रूप से भरे गए हैं।')}
              </p>
            </motion.div>

            {/* Animated Step Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between relative max-w-2xl mx-auto">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-setu-100 dark:bg-neutral-800 -translate-y-1/2 -z-10" />
                <div
                  className="absolute top-1/2 left-0 h-1 bg-setu-600 -translate-y-1/2 transition-all duration-500 -z-10"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = currentStep > idx;
                  const isCurrent = currentStep === idx;

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl font-bold text-sm transition-all ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-md'
                            : isCurrent
                            ? 'bg-setu-600 text-white ring-4 ring-setu-100 shadow-md'
                            : 'bg-white text-muted-foreground border border-setu-200 dark:bg-neutral-900 dark:border-neutral-800'
                        }`}
                      >
                        {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <span className={`mt-2 text-xs font-semibold ${isCurrent ? 'text-setu-950 dark:text-setu-50 font-bold' : 'text-muted-foreground'}`}>
                        {isHindi ? step.labelHindi : step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Card */}
            <Card className="p-8 border-setu-100 bg-white/90 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 rounded-3xl">
              {currentStep === 0 && (
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-setu-950 dark:text-setu-50 border-b border-setu-100 dark:border-neutral-800 pb-3">
                    Step 1: {t('Personal Details', 'व्यक्तिगत विवरण')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {step1Fields.map((field) => (
                      <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                        <label className="block text-xs font-semibold text-setu-900 dark:text-setu-200 mb-1">
                          {isHindi ? field.labelHindi : field.label}
                        </label>
                        <input
                          type="text"
                          value={isHindi ? field.valueHindi : field.value}
                          onChange={(e) => updateFieldValue(field.id, e.target.value)}
                          className="w-full rounded-xl border border-setu-200 bg-white px-3.5 py-2.5 text-sm font-medium shadow-sm focus:border-setu-500 focus:outline-none dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-100"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-setu-950 dark:text-setu-50 border-b border-setu-100 dark:border-neutral-800 pb-3">
                    Step 2: {t('Category & Financial Details', 'श्रेणी और वित्तीय विवरण')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {step2Fields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-xs font-semibold text-setu-900 dark:text-setu-200 mb-1">
                          {isHindi ? field.labelHindi : field.label}
                        </label>
                        <input
                          type="text"
                          value={isHindi ? field.valueHindi : field.value}
                          onChange={(e) => updateFieldValue(field.id, e.target.value)}
                          placeholder={field.preFilled ? '' : t('Enter details...', 'विवरण दर्ज करें...')}
                          className="w-full rounded-xl border border-setu-200 bg-white px-3.5 py-2.5 text-sm font-medium shadow-sm focus:border-setu-500 focus:outline-none dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-100"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-setu-950 dark:text-setu-50 border-b border-setu-100 dark:border-neutral-800 pb-3">
                    Step 3: {t('Review Prepared Application Kit', 'तैयार आवेदन किट की समीक्षा करें')}
                  </h3>
                  <div className="rounded-2xl bg-setu-50/60 dark:bg-neutral-950 p-4 space-y-2 border border-setu-100 dark:border-neutral-800 text-xs">
                    {fields.map((f) => (
                      <div key={f.id} className="flex justify-between border-b border-setu-100/50 dark:border-neutral-800 pb-1">
                        <span className="text-muted-foreground">{isHindi ? f.labelHindi : f.label}:</span>
                        <span className="font-bold text-setu-950 dark:text-setu-50">{f.value || 'N/A'}</span>
                      </div>
                    ))}
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation controls */}
              <div className="mt-8 flex items-center justify-between pt-4 border-t border-setu-100 dark:border-neutral-800">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="rounded-xl border-setu-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {t('Back', 'पीछे')}
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button onClick={handleNext} className="gap-2 rounded-xl bg-setu-600 hover:bg-setu-700 text-white font-semibold">
                    {t('Next Step', 'अगला कदम')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PartyPopper className="h-4 w-4" />}
                    {t('Submit Application Kit', 'आवेदन किट जमा करें')}
                  </Button>
                )}
              </div>
            </Card>
          </>
        ) : (
          /* Submission Complete View */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <Card className="p-8 border-emerald-200 bg-white/95 shadow-2xl dark:border-emerald-950 dark:bg-neutral-900 rounded-3xl text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="font-display text-2xl font-bold text-setu-950 dark:text-setu-50">
                {t('Application Kit Successfully Generated!', 'आवेदन किट सफलतापूर्वक तैयार!')}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('Your official application has been prepared and logged to your dashboard audit log.', 'आपकी आधिकारिक आवेदन किट तैयार कर ली गई है और डैशबोर्ड ऑडिट में सहेज दी गई है।')}
              </p>

              <div className="mt-6 flex items-center justify-center gap-3 bg-setu-50/80 dark:bg-neutral-950 p-4 rounded-2xl border border-setu-100 dark:border-neutral-800">
                <span className="text-xs text-muted-foreground">{t('Tracking ID:', 'ट्रैकिंग आईडी:')}</span>
                <span className="font-mono font-extrabold text-sm text-setu-950 dark:text-setu-50">{trackingId}</span>
                <Button size="icon" variant="ghost" onClick={copyTrackingId} className="h-7 w-7">
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button onClick={() => router.push('/dashboard')} className="w-full sm:w-auto rounded-xl bg-setu-600 hover:bg-setu-700 text-white font-semibold">
                  {t('Go to Dashboard', 'डैशबोर्ड पर जाएं')}
                </Button>
              </div>
            </Card>

            {/* Printable Application Kit Component */}
            <PrintableApplicationKit
              schemeName={TARGET_SCHEME.name}
              schemeNameHindi={TARGET_SCHEME.nameHindi}
              trackingId={trackingId}
              generatedAt={generatedAt}
              fields={fields}
              isHindi={isHindi}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
