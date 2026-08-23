'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  ScanLine,
  User,
  MapPin,
  Briefcase,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import type { ExtractedDocumentFields } from '@/app/api/extract-document/route';
import { validateExtractedDocument, type ValidationSummary } from '@/lib/document-validation';
import { ConsentModal } from '@/components/consent-modal';
import { logAuditEvent } from '@/lib/audit-logger';

type Phase = 'upload' | 'extracting' | 'questions' | 'consent' | 'complete';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

interface ExtractedProfile {
  name: string;
  age: number;
  gender: string;
  state: string;
  city: string;
  occupation: string;
  income: number;
  category: string;
  has_aadhaar: boolean;
  has_ration_card: boolean;
  has_udyam: boolean;
  aadhaarNumber?: string | null;
  udyamNumber?: string | null;
}

const extractionSteps = [
  { icon: ScanLine, label: 'Scanning document...', labelHindi: 'दस्तावेज़ स्कैन कर रहे हैं...', duration: 800 },
  { icon: User, label: 'Extracting name & demographics...', labelHindi: 'नाम और जनसांख्यिकी निकाल रहे हैं...', duration: 700 },
  { icon: MapPin, label: 'Detecting location & state...', labelHindi: 'स्थान और राज्य का पता लगा रहे हैं...', duration: 600 },
  { icon: Briefcase, label: 'Identifying occupation...', labelHindi: 'व्यवसाय की पहचान कर रहे हैं...', duration: 500 },
  { icon: CreditCard, label: 'Matching income category...', labelHindi: 'आय श्रेणी मिला रहे हैं...', duration: 500 },
  { icon: Sparkles, label: 'Finding eligible schemes...', labelHindi: 'पात्र योजनाएं खोज रहे हैं...', duration: 400 },
];

export default function DiscoverPage() {
  const router = useRouter();
  const { t, isHindi } = useLanguage();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [extractStep, setExtractStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractedProfile, setExtractedProfile] = useState<ExtractedProfile | null>(null);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);

  // Manual question state
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const questions = isHindi
    ? ['आप किस राज्य में रहते हैं?', 'आपका व्यवसाय क्या है?', 'आपकी वार्षिक पारिवारिक आय कितनी है?']
    : ['Which state do you live in?', 'What is your occupation?', 'What is your annual family income?'];

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|webp)$/i)) {
      return t('Invalid file type. Please upload a PDF, JPG, or PNG image.', 'अमान्य फ़ाइल प्रकार। कृपया PDF, JPG, या PNG छवि अपलोड करें।');
    }
    if (file.size > MAX_FILE_SIZE) {
      return t('File is too large. Maximum size is 10 MB.', 'फ़ाइल बहुत बड़ी है। अधिकतम आकार 10 MB है।');
    }
    return null;
  };

  const animateExtractionSteps = async () => {
    for (let i = 0; i < extractionSteps.length; i++) {
      setExtractStep(i);
      await new Promise((r) => setTimeout(r, extractionSteps[i].duration));
    }
  };

  const handleFileUpload = async (file: File) => {
    const error = validateFile(file);
    if (error) { setFileError(error); return; }
    setFileError(null);
    setExtractionError(null);
    setSelectedFile(file);
    setPhase('extracting');
    setExtractStep(0);

    const [, apiResult] = await Promise.all([
      animateExtractionSteps(),
      callExtractApi(file),
    ]);

    if ('error' in apiResult) {
      setExtractionError(apiResult.error);
      setPhase('upload');
      return;
    }

    // Fetch existing profile to cross-validate
    let existingProfile = null;
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      existingProfile = data;
    }

    // Run Verhoeff Aadhaar & Cross-document validation
    const validation = validateExtractedDocument(apiResult, existingProfile);
    setValidationSummary(validation);

    const realName = (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || apiResult.name || 'User';

    const profile: ExtractedProfile = {
      name: realName,
      age: apiResult.age ?? 0,
      gender: apiResult.gender ?? 'Unknown',
      state: apiResult.state ?? '',
      city: apiResult.city ?? '',
      occupation: apiResult.occupation ?? '',
      income: apiResult.income ?? 0,
      category: apiResult.category ?? 'General',
      has_aadhaar: apiResult.docType === 'aadhaar' || !!apiResult.aadhaarNumber,
      has_ration_card: apiResult.docType === 'ration_card' || !!apiResult.rationCardNumber,
      has_udyam: apiResult.docType === 'udyam' || !!apiResult.udyamNumber,
      aadhaarNumber: apiResult.aadhaarNumber,
      udyamNumber: apiResult.udyamNumber,
    };

    setExtractedProfile(profile);

    // Log document extraction event
    await logAuditEvent('DOCUMENT_EXTRACTED', {
      filename: file.name,
      docType: apiResult.docType,
      validationStatus: validation.overallStatus,
    });

    // Prompt user consent before committing sensitive fields
    setPhase('consent');
  };

  const callExtractApi = async (file: File): Promise<ExtractedDocumentFields | { error: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/extract-document', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || data.error) return { error: data.error ?? 'Extraction failed.' };
      return data as ExtractedDocumentFields;
    } catch {
      return { error: 'Network error during document extraction.' };
    }
  };

  const handleConsentConfirmed = async (consentedKeys: string[]) => {
    if (!extractedProfile) return;

    if (user) {
      const isAadhaarConsented = consentedKeys.includes('aadhaar');
      const isIncomeConsented = consentedKeys.includes('income');

      await supabase.from('profiles').upsert(
        {
          user_id: user.id,
          name: extractedProfile.name,
          age: extractedProfile.age || null,
          gender: extractedProfile.gender || null,
          state: extractedProfile.state || null,
          city: extractedProfile.city || null,
          occupation: extractedProfile.occupation || null,
          income: isIncomeConsented ? (extractedProfile.income || null) : null,
          category: consentedKeys.includes('category') ? (extractedProfile.category || null) : null,
          has_aadhaar: isAadhaarConsented ? extractedProfile.has_aadhaar : false,
          has_ration_card: extractedProfile.has_ration_card,
          has_udyam: extractedProfile.has_udyam,
          is_aadhaar_verified: isAadhaarConsented && validationSummary?.results.some(r => r.field === 'aadhaarNumber' && r.status === 'verified'),
          is_income_verified: isIncomeConsented && validationSummary?.results.some(r => r.field === 'income' && r.status === 'verified'),
          consent_given: true,
          consent_timestamp: new Date().toISOString(),
          consent_details: { consented_fields: consentedKeys },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      if (selectedFile) {
        await supabase.from('documents').insert({
          user_id: user.id,
          filename: selectedFile.name,
          doc_type: selectedFile.type,
        });
      }

      await logAuditEvent('PROFILE_UPDATED', {
        source: 'DISCOVER_DOCUMENT_UPLOAD',
        consented_fields: consentedKeys,
      });
    }

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#f97316', '#10b981', '#f59e0b', '#6366f1'],
    });

    setPhase('complete');
  };

  const handleManualComplete = async () => {
    setPhase('extracting');
    setExtractStep(0);
    await animateExtractionSteps();

    const realName = (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'User';
    const income = parseInt(answers[2]?.replace(/[^\d]/g, '')) || 0;

    const profile: ExtractedProfile = {
      name: realName,
      age: 0,
      gender: '',
      state: answers[0] || '',
      city: '',
      occupation: answers[1] || '',
      income,
      category: 'General',
      has_aadhaar: false,
      has_ration_card: false,
      has_udyam: false,
    };

    setExtractedProfile(profile);

    if (user) {
      await supabase.from('profiles').upsert(
        {
          user_id: user.id,
          name: profile.name,
          state: profile.state || null,
          occupation: profile.occupation || null,
          income: profile.income || null,
          consent_given: true,
          consent_timestamp: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      await logAuditEvent('PROFILE_UPDATED', { source: 'DISCOVER_MANUAL_QUESTIONS' });
    }

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#f97316', '#10b981', '#f59e0b', '#6366f1'],
    });

    setPhase('complete');
  };

  const docTypes = [
    { name: 'Aadhaar Card', nameHindi: 'आधार कार्ड', icon: '🆔', key: 'aadhaar' },
    { name: 'Ration Card', nameHindi: 'राशन कार्ड', icon: '📋', key: 'ration' },
    { name: 'Udyam Certificate', nameHindi: 'उद्यम प्रमाणपत्र', icon: '🏢', key: 'udyam' },
  ];

  const getSensitiveFieldsForConsent = () => {
    if (!extractedProfile) return [];
    return [
      {
        key: 'aadhaar',
        name: 'Aadhaar Status',
        nameHindi: 'आधार स्थिति',
        value: extractedProfile.aadhaarNumber || (extractedProfile.has_aadhaar ? 'Aadhaar Detected' : 'No Aadhaar'),
        purpose: 'Used to verify identity & eligibility for government micro-credit & cash schemes.',
        purposeHindi: 'सरकारी सूक्ष्म-ऋण और नकद योजनाओं के लिए पहचान और पात्रता की पुष्टि के लिए उपयोग किया जाता है।',
      },
      {
        key: 'income',
        name: 'Annual Income',
        nameHindi: 'वार्षिक आय',
        value: `₹${extractedProfile.income.toLocaleString('en-IN')}`,
        purpose: 'Determines financial tier eligibility (EWS/LIG/BPL) for subsidies.',
        purposeHindi: 'सब्सिडी के लिए वित्तीय श्रेणी की पात्रता (EWS/LIG/BPL) निर्धारित करता है।',
      },
      {
        key: 'category',
        name: 'Social Category',
        nameHindi: 'सामाजिक श्रेणी',
        value: extractedProfile.category,
        purpose: 'Used to match category-specific central and state welfare benefits.',
        purposeHindi: 'श्रेणी-विशिष्ट केंद्रीय और राज्य कल्याण लाभों का मिलान करने के लिए उपयोग किया जाता है।',
      },
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-50 via-white to-white">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {/* UPLOAD PHASE */}
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="mb-8 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-trust-500 to-trust-700 shadow-xl shadow-trust-500/30"
                >
                  <Sparkles className="h-8 w-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold tracking-tight text-trust-900">
                  {t('Discover Your Eligibility', 'अपनी पात्रता खोजें')}
                </h1>
                <p className="mt-3 text-muted-foreground">
                  {t(
                    'Upload any government document — our AI extracts your details and finds every scheme you qualify for.',
                    'कोई भी सरकारी दस्तावेज़ अपलोड करें — हमारी एआई आपकी जानकारी निकालती है और हर योजना खोजती है जिनके आप पात्र हैं।'
                  )}
                </p>
              </div>

              {/* File error */}
              <AnimatePresence>
                {(fileError || extractionError) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {fileError || extractionError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Drag and drop zone */}
              <motion.div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  setFileError(null);
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileUpload(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                animate={dragOver ? { scale: 1.02 } : { scale: 1 }}
                className="cursor-pointer rounded-3xl border-2 border-dashed p-12 text-center transition-colors"
                style={{
                  borderColor: dragOver ? 'hsl(214 88% 56%)' : 'hsl(214 32% 91%)',
                  backgroundColor: dragOver ? 'hsl(211 100% 97%)' : 'hsl(0 0% 100%)',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <motion.div
                  animate={dragOver ? { y: -8 } : { y: 0 }}
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-trust-100 to-trust-200"
                >
                  <UploadCloud className="h-10 w-10 text-trust-600" />
                </motion.div>
                <p className="text-lg font-semibold text-trust-900">
                  {t('Drop your document here', 'अपना दस्तावेज़ यहाँ छोड़ें')}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('or click to browse — PDF, JPG, PNG (max 10 MB)', 'या ब्राउज़ करने के लिए क्लिक करें — PDF, JPG, PNG (अधिकतम 10 MB)')}
                </p>
                <p className="mt-2 text-xs text-trust-500 font-medium">
                  {t('🔒 Analyzed by AI — Aadhaar digits are masked for privacy', '🔒 एआई द्वारा विश्लेषण — आधार अंक गोपनीयता के लिए मास्क किए जाते हैं')}
                </p>
              </motion.div>

              {/* Quick upload chips */}
              <div className="mt-6">
                <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
                  {t('Quick upload — tap a document type:', 'त्वरित अपलोड — दस्तावेज़ प्रकार चुनें:')}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {docTypes.map((doc, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-xl border border-trust-100 bg-white px-4 py-2.5 text-sm font-medium text-trust-700 shadow-sm transition-all hover:border-trust-300 hover:shadow-md"
                    >
                      <span className="text-lg">{doc.icon}</span>
                      {isHindi ? doc.nameHindi : doc.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Manual fallback */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8">
                <Card className="border-saffron-200 bg-saffron-50/50 p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-saffron-100 text-saffron-700">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-trust-900">
                        {t("Don't have a scannable document?", 'स्कैन करने योग्य दस्तावेज़ नहीं है?')}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t(
                          "No problem — answer 3 quick questions instead. We'll match you the same way.",
                          'कोई बात नहीं — इसके बजाय 3 सरल प्रश्नों के उत्तर दें। हम आपको उसी तरह मिलाएंगे।'
                        )}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 gap-1.5 border-saffron-300 text-saffron-700 hover:bg-saffron-100"
                        onClick={() => setPhase('questions')}
                      >
                        <ArrowRight className="h-4 w-4" />
                        {t('Answer 3 quick questions', '3 सरल प्रश्नों के उत्तर दें')}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* QUESTIONS PHASE */}
          {phase === 'questions' && (
            <motion.div key="questions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-trust-900">{t('Quick Questions', 'सरल प्रश्न')}</h1>
                <p className="mt-3 text-muted-foreground">{t('Just 3 questions — takes 30 seconds.', 'केवल 3 प्रश्न — 30 सेकंड में।')}</p>
              </div>
              <Card className="space-y-6 border-trust-100 bg-white p-8 shadow-lg">
                {questions.map((q, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}>
                    <label className="mb-2 block text-sm font-semibold text-trust-800">{i + 1}. {q}</label>
                    <input
                      type="text"
                      value={answers[i]}
                      onChange={(e) => { const a = [...answers]; a[i] = e.target.value; setAnswers(a); }}
                      className="w-full rounded-xl border border-trust-200 bg-trust-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-trust-500 focus:ring-2 focus:ring-trust-500/20"
                      placeholder={isHindi ? 'यहाँ टाइप करें...' : 'Type here...'}
                    />
                  </motion.div>
                ))}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setPhase('upload')} className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" />
                    {t('Back', 'वापस')}
                  </Button>
                  <Button
                    className="flex-1 gap-2 bg-trust-600 hover:bg-trust-700"
                    onClick={handleManualComplete}
                    disabled={answers.some((a) => !a.trim())}
                  >
                    <Sparkles className="h-4 w-4" />
                    {t('Find My Schemes', 'मेरी योजनाएं खोजें')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* EXTRACTING PHASE */}
          {phase === 'extracting' && (
            <motion.div key="extracting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-trust-500 to-trust-700 shadow-xl shadow-trust-500/30"
                >
                  <Sparkles className="h-8 w-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold tracking-tight text-trust-900">
                  {t('AI is analyzing your document...', 'एआई आपके दस्तावेज़ का विश्लेषण कर रही है...')}
                </h1>
                {selectedFile && (
                  <p className="mt-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-trust-50 px-3 py-1 text-sm font-medium text-trust-700">
                      <FileText className="h-3.5 w-3.5" />
                      {selectedFile.name}
                    </span>
                  </p>
                )}
              </div>

              <Card className="border-trust-100 bg-white p-8 shadow-lg">
                <div className="space-y-4">
                  {extractionSteps.map((step, i) => {
                    const isDone = i < extractStep;
                    const isCurrent = i === extractStep;
                    const StepIcon = step.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: isDone || isCurrent ? 1 : 0.3 }}
                        className="flex items-center gap-4"
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-600'
                              : isCurrent
                                ? 'bg-trust-100 text-trust-600'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : isCurrent ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <StepIcon className="h-5 w-5" />
                          )}
                        </div>
                        <span className={`text-sm font-medium transition-colors ${isDone ? 'text-emerald-700' : isCurrent ? 'text-trust-800' : 'text-muted-foreground'}`}>
                          {isHindi ? step.labelHindi : step.label}
                        </span>
                        {isCurrent && (
                          <div className="ml-auto h-1.5 w-24 overflow-hidden rounded-full bg-trust-100">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-trust-400 to-trust-600"
                              initial={{ width: '0%' }}
                              animate={{ width: '100%' }}
                              transition={{ duration: step.duration / 1000, ease: 'linear' }}
                            />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-8 space-y-3 rounded-2xl bg-trust-50/50 p-4">
                  <div className="h-4 w-3/4 rounded shimmer-bg" />
                  <div className="h-4 w-1/2 rounded shimmer-bg" />
                  <div className="h-4 w-2/3 rounded shimmer-bg" />
                </div>
              </Card>
            </motion.div>
          )}

          {/* CONSENT PHASE */}
          {phase === 'consent' && extractedProfile && (
            <ConsentModal
              isOpen={true}
              onClose={() => setPhase('upload')}
              onConfirm={handleConsentConfirmed}
              sensitiveFields={getSensitiveFieldsForConsent()}
            />
          )}

          {/* COMPLETE PHASE */}
          {phase === 'complete' && extractedProfile && (
            <motion.div key="complete" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-8 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30"
                >
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold tracking-tight text-trust-900">
                  {t('Extraction & Verification Complete!', 'निष्कर्षण और सत्यापन पूर्ण!')}
                </h1>
                <p className="mt-3 text-muted-foreground">
                  {t(
                    "We've identified your profile, validated your document checksums, and recorded your consent preferences.",
                    'हमने आपकी प्रोफ़ाइल पहचान ली है, आपके दस्तावेज़ चेकसम का सत्यापन किया है, और आपकी सहमति दर्ज की है।'
                  )}
                </p>
              </div>

              {/* Validation Summary Card */}
              {validationSummary && validationSummary.results.length > 0 && (
                <Card className="mb-6 border-trust-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="h-5 w-5 text-trust-600" />
                    <h3 className="font-bold text-sm text-trust-900">
                      {t('Verification & Integrity Check', 'सत्यापन और अखंडता जांच')}
                    </h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    {validationSummary.results.map((res, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2.5 rounded-lg border ${
                          res.status === 'verified'
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                            : res.status === 'conflict' || res.status === 'invalid'
                            ? 'bg-rose-50/60 border-rose-200 text-rose-800'
                            : 'bg-amber-50/60 border-amber-200 text-amber-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {res.status === 'verified' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-rose-600" />
                          )}
                          <span className="font-semibold">
                            {isHindi ? res.fieldLabelHindi : res.fieldLabel}:
                          </span>
                          <span>{res.value}</span>
                        </div>
                        <span className="font-medium text-[11px]">
                          {isHindi ? res.messageHindi : res.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Extracted data preview */}
              <Card className="mb-6 border-emerald-200 bg-emerald-50/30 p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-800">
                      {t('Extracted Profile', 'निकाली गई प्रोफ़ाइल')}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" />
                    {t('Consent Saved', 'सहमति सहेजी गई')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {[
                    { label: t('Name', 'नाम'), value: extractedProfile.name },
                    { label: t('Age', 'आयु'), value: extractedProfile.age ? String(extractedProfile.age) : t('Not found', 'नहीं मिला') },
                    { label: t('Gender', 'लिंग'), value: extractedProfile.gender || t('Not found', 'नहीं मिला') },
                    { label: t('State', 'राज्य'), value: extractedProfile.state || t('Not found', 'नहीं मिला') },
                    { label: t('Occupation', 'व्यवसाय'), value: extractedProfile.occupation || t('Not found', 'नहीं मिला') },
                    { label: t('Income', 'आय'), value: extractedProfile.income ? `₹${(extractedProfile.income / 1000).toFixed(0)}K/yr` : t('Not found', 'नहीं मिला') },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="rounded-xl bg-white p-3 shadow-sm"
                    >
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                      <div className="mt-0.5 font-semibold text-trust-900 text-sm">{item.value}</div>
                    </motion.div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {t(
                    '🔒 Scoped by Supabase RLS. Audit logs recorded.',
                    '🔒 सुपाबेस RLS द्वारा सुरक्षित। ऑडिट लॉग दर्ज किए गए।'
                  )}
                </p>
              </Card>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-center">
                <Button
                  size="lg"
                  className="group h-14 gap-2 rounded-2xl bg-trust-600 px-8 text-base shadow-xl shadow-trust-500/30 hover:bg-trust-700"
                  onClick={() => router.push('/dashboard')}
                >
                  {t('See My Eligible Schemes', 'मेरी पात्र योजनाएं देखें')}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
