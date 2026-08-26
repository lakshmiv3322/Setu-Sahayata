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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { Confetti } from '@/components/confetti';
import { PrintableApplicationKit } from '@/components/printable-application-kit';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { useRequireAuth } from '@/lib/use-require-auth';
import { supabaseBrowser as supabase } from '@/lib/supabase-browser';
import type { ApplicationField } from '@/lib/types';

const steps = [
  { icon: FileText, label: 'Personal', labelHindi: 'व्यक्तिगत' },
  { icon: UserCheck, label: 'Identity', labelHindi: 'पहचान' },
  { icon: ClipboardCheck, label: 'Review & Submit', labelHindi: 'समीक्षा और जमा' },
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
          id: 'occupation',
          label: 'Occupation / Business Type',
          labelHindi: 'व्यवसाय / व्यापार का प्रकार',
          value: profileOccupation,
          valueHindi: profileOccupation,
          preFilled: Boolean(profileOccupation),
          type: 'text',
        },
        {
          id: 'udyam',
          label: 'Udyam Registration Number',
          labelHindi: 'उद्यम पंजीकरण नंबर',
          value: p?.has_udyam ? 'UDYAM-XX-XX-XXXXXXX' : '',
          valueHindi: p?.has_udyam ? 'UDYAM-XX-XX-XXXXXXX' : '',
          preFilled: Boolean(p?.has_udyam),
          type: 'text',
        },
        {
          id: 'bank',
          label: 'Bank Account Number',
          labelHindi: 'बैंक खाता संख्या',
          value: '',
          valueHindi: '',
          preFilled: false,
          type: 'text',
        },
        {
          id: 'ifsc',
          label: 'IFSC Code',
          labelHindi: 'आईएफएससी कोड',
          value: '',
          valueHindi: '',
          preFilled: false,
          type: 'text',
        },
        {
          id: 'loan-amount',
          label: 'Requested Loan Amount (₹)',
          labelHindi: 'अनुरोधित ऋण राशि (₹)',
          value: '10,000',
          valueHindi: '10,000',
          preFilled: true,
          type: 'text',
        },
        {
          id: 'declaration',
          label: 'Declaration',
          labelHindi: 'घोषणा',
          value: 'I declare that the information provided is true and correct to the best of my knowledge.',
          valueHindi: 'मैं घोषित करता/करती हूं कि दी गई जानकारी मेरी जानकारी के अनुसार सत्य और सही है।',
          preFilled: true,
          type: 'textarea',
        },
      ];

      setFields(dynamicFields);
    };
    loadProfile();
  }, [user, userDisplayName]);

  const stepFields = [
    fields.slice(0, 5),
    fields.slice(5, 9),
    fields.slice(9),
  ];

  const preFilledCount = fields.filter((f) => f.preFilled).length;
  const totalFields = fields.length;
  const preFilledPercent = totalFields > 0 ? Math.round((preFilledCount / totalFields) * 100) : 0;

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);

    const id = 'SETU-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-2024';

    try {
      const { error } = await supabase.from('applications').insert({
        user_id: user.id,
        scheme_id: TARGET_SCHEME.id,
        scheme_name: TARGET_SCHEME.name,
        application_id: id,
        status: 'Prepared',
        benefit_amount: TARGET_SCHEME.benefitAmount,
      });

      if (error) {
        setSubmitError(t('Failed to prepare application. Please try again.', 'आवेदन तैयार करने में विफल। कृपया पुनः प्रयास करें।'));
        setSubmitting(false);
        return;
      }

      setTrackingId(id);
      setGeneratedAt(new Date().toLocaleString(isHindi ? 'hi-IN' : 'en-IN'));
      setSubmitted(true);
    } catch {
      setSubmitError(t('Something went wrong. Please try again.', 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-trust-50 via-white to-emerald-50/30">
        <Navbar />
        <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <Card className="overflow-hidden border-emerald-200 bg-white p-8 text-center shadow-2xl">
              {/* Ready icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-xl shadow-emerald-500/30 text-white"
              >
                <ClipboardCheck className="h-10 w-10" />
              </motion.div>

              <h1 className="text-3xl font-bold text-trust-900">
                {t('Application Kit Ready!', 'आवेदन किट तैयार है!')}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {t(
                  `Great news, ${userDisplayName}! Your application form for ${TARGET_SCHEME.name} has been pre-filled and prepared.`,
                  `बधाई हो, ${userDisplayName}! ${TARGET_SCHEME.nameHindi} के लिए आपकी आवेदन किट तैयार हो गई है।`
                )}
              </p>

              {/* Disclaimer Card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-left rounded-2xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong className="font-semibold">{t('Official Submission Disclaimer:', 'आधिकारिक सबमिशन घोषणा:')}</strong>{' '}
                  {t(
                    'Setu Sahayata is an eligibility & preparation assistant. We do not submit directly to government databases. To complete your official application, present this kit or tracking ID at your local Jan Seva Kendra / CSC center or official scheme portal.',
                    'सेतु सहायता एक पात्रता और तैयारी सहायक है। हम सीधे सरकारी डेटाबेस में आवेदन जमा नहीं करते हैं। अपना आधिकारिक आवेदन पूरा करने के लिए, इस किट या ट्रैकिंग आईडी को अपने नजदीकी जन सेवा केंद्र या आधिकारिक पोर्टल पर प्रस्तुत करें।'
                  )}
                </div>
              </motion.div>

              {/* Tracking ID */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 rounded-2xl border-2 border-dashed border-trust-200 bg-trust-50/50 p-5"
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('Your Application Preparation ID', 'आपकी आवेदन तैयारी आईडी')}
                </p>
                <div className="mt-2 flex items-center justify-center gap-3">
                  <span className="text-2xl font-bold tracking-wider text-trust-700">
                    {trackingId}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="rounded-lg p-2 text-trust-600 transition-colors hover:bg-trust-100"
                    title={t('Copy ID', 'आईडी कॉपी करें')}
                  >
                    {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Next steps checklist */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-left rounded-2xl border border-trust-100 bg-trust-50/40 p-5 space-y-3"
              >
                <h4 className="text-xs font-bold text-trust-900 uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-trust-600" />
                  {t('How to File Official Application', 'आधिकारिक आवेदन कैसे जमा करें')}
                </h4>
                <ul className="text-xs text-trust-800 space-y-2 list-disc pl-5 leading-relaxed">
                  <li>{t('Carry your Aadhaar Card & Ration Card / Udyam certificate.', 'अपना आधार कार्ड और राशन कार्ड / उद्यम प्रमाणपत्र साथ रखें।')}</li>
                  <li>{t('Visit Nearest CSC Center: Jan Seva Kendra — Vikas Bhawan, Gomti Nagar, Lucknow', 'नजदीकी सीएससी केंद्र जाएं: जन सेवा केंद्र — विकास भवन, गोमती नगर, लखनऊ')}</li>
                  <li>{t('Or file directly on official portal: https://pmsvanidhi.mohua.gov.in', 'या सीधे आधिकारिक पोर्टल पर जमा करें: https://pmsvanidhi.mohua.gov.in')}</li>
                </ul>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Button
                  size="lg"
                  className="flex-1 gap-2 bg-trust-600 hover:bg-trust-700"
                  onClick={() => window.print()}
                >
                  <FileText className="h-5 w-5" />
                  {t('Print / Download Application Kit', 'आवेदन किट प्रिंट / डाउनलोड करें')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => router.push('/dashboard')}
                >
                  <TrendingUp className="h-5 w-5" />
                  {t('Go to Dashboard', 'डैशबोर्ड पर जाएं')}
                </Button>
              </motion.div>

              {/* Printable Kit — hidden on screen, visible only when printing */}
              <PrintableApplicationKit
                trackingId={trackingId}
                schemeName={TARGET_SCHEME.name}
                schemeNameHindi={TARGET_SCHEME.nameHindi}
                fields={fields}
                isHindi={isHindi}
                generatedAt={generatedAt}
              />
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-50 via-white to-white">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            <Sparkles className="h-4 w-4" />
            {t('PM SVANidhi Application', 'पीएम स्वनिधि आवेदन')}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-trust-900 sm:text-4xl">
            {t('Auto-Fill Application', 'ऑटो-फिल आवेदन')}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t(
              'Most fields are already filled from your profile. Just verify and submit.',
              'अधिकांश फ़ील्ड पहले से भरे हुए हैं। बस सत्यापित करें और जमा करें।'
            )}
          </p>

          {/* Auto-fill progress bar */}
          {totalFields > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <Sparkles className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-emerald-800">
                    {preFilledPercent}% {t('auto-filled from your profile', 'आपकी प्रोफ़ाइल से स्वतः भरा')}
                  </span>
                  <span className="text-emerald-600">{preFilledCount}/{totalFields} {t('fields', 'फ़ील्ड')}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-100">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${preFilledPercent}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              const isComplete = i < currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={i} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      animate={{
                        scale: isCurrent ? 1.1 : 1,
                      }}
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-all ${
                        isComplete
                          ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                          : isCurrent
                            ? 'bg-gradient-to-br from-trust-500 to-trust-700 text-white shadow-trust-500/30'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </motion.div>
                    <span
                      className={`text-xs font-medium ${
                        isCurrent || isComplete ? 'text-trust-900' : 'text-muted-foreground'
                      }`}
                    >
                      {isHindi ? step.labelHindi : step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="mx-2 h-1 flex-1 rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: i < currentStep ? '100%' : '0%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Submit error */}
        {submitError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {submitError}
          </motion.div>
        )}

        {/* Form fields */}
        {fields.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-trust-100 bg-white p-6 shadow-lg sm:p-8">
                <div className="space-y-5">
                  {stepFields[currentStep].map((field, i) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="relative"
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-sm font-semibold text-trust-800">
                          {isHindi ? field.labelHindi : field.label}
                        </label>
                        {field.preFilled && (
                          <Badge className="border-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            <Sparkles className="mr-1 h-3 w-3" />
                            {t('From your profile', 'आपकी प्रोफ़ाइल से')}
                          </Badge>
                        )}
                      </div>
                      {field.type === 'textarea' ? (
                        <textarea
                          defaultValue={isHindi ? field.valueHindi : field.value}
                          readOnly={field.preFilled}
                          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                            field.preFilled
                              ? 'border-emerald-300 bg-emerald-50/30 text-trust-800 focus:border-emerald-400'
                              : 'border-trust-200 bg-white focus:border-trust-500 focus:ring-2 focus:ring-trust-500/20'
                          }`}
                          rows={3}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          defaultValue={isHindi ? field.valueHindi : field.value}
                          disabled={field.preFilled}
                          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                            field.preFilled
                              ? 'border-emerald-300 bg-emerald-50/30 text-trust-800'
                              : 'border-trust-200 bg-white focus:border-trust-500 focus:ring-2 focus:ring-trust-500/20'
                          }`}
                        >
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          defaultValue={isHindi ? field.valueHindi : field.value}
                          readOnly={field.preFilled}
                          placeholder={field.preFilled ? '' : t('Please fill this in', 'कृपया यह भरें')}
                          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                            field.preFilled
                              ? 'border-emerald-300 bg-emerald-50/30 text-trust-800'
                              : 'border-trust-200 bg-white focus:border-trust-500 focus:ring-2 focus:ring-trust-500/20'
                          }`}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="mt-8 flex gap-3">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="gap-1.5"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {t('Back', 'वापस')}
                    </Button>
                  )}
                  {currentStep < steps.length - 1 ? (
                    <Button
                      className="flex-1 gap-2 bg-trust-600 hover:bg-trust-700"
                      onClick={() => setCurrentStep(currentStep + 1)}
                    >
                      {t('Continue', 'आगे बढ़ें')}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="text-xs text-amber-700 bg-amber-50/70 p-3 rounded-xl border border-amber-200 flex items-start gap-2 mb-2 font-medium">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                        <span>
                          {t(
                            'Notice: Preparing this application kit does NOT submit your data directly to government servers. To file officially, print this kit or present your Tracking ID at a local Jan Seva Kendra / CSC center.',
                            'सूचना: इस आवेदन किट को तैयार करने से आपका डेटा सीधे सरकारी सर्वर पर जमा नहीं होता है। आधिकारिक रूप से जमा करने के लिए, इस किट को प्रिंट करें या नजदीकी जन सेवा केंद्र पर प्रस्तुत करें।'
                          )}
                        </span>
                      </div>
                      <Button
                        size="lg"
                        className="w-full gap-2 bg-emerald-600 text-base hover:bg-emerald-700 shadow-lg shadow-emerald-500/30"
                        onClick={handleSubmit}
                        disabled={submitting}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        {submitting ? t('Submitting...', 'जमा हो रहा है...') : t('Submit Application', 'आवेदन जमा करें')}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}

        {/* AI assistance note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-start gap-3 rounded-xl bg-saffron-50/50 p-4"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-saffron-100 text-saffron-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="text-sm text-saffron-800">
            {t(
              'Fields highlighted in green are filled from your profile. Please verify each field before submitting — you can edit any field by tapping on it.',
              'हरे रंग में हाइलाइट किए गए फ़ील्ड आपकी प्रोफ़ाइल से भरे गए हैं। जमा करने से पहले कृपया प्रत्येक फ़ील्ड सत्यापित करें — आप किसी भी फ़ील्ड को टैप करके संपादित कर सकते हैं।'
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
