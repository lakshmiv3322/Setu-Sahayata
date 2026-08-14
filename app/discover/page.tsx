'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Loader2,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';

type Phase = 'upload' | 'extracting' | 'questions' | 'complete';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

interface ExtractedProfile {
  name: string;
  nameHindi: string;
  age: number;
  gender: string;
  genderHindi: string;
  state: string;
  stateHindi: string;
  city: string;
  occupation: string;
  occupationHindi: string;
  income: number;
  category: string;
  has_aadhaar: boolean;
  has_ration_card: boolean;
  has_udyam: boolean;
}

// Vary demo output based on which doc was uploaded
const profileByDocType: Record<string, ExtractedProfile> = {
  aadhaar: {
    name: 'Priya Sharma',
    nameHindi: 'प्रिया शर्मा',
    age: 28,
    gender: 'Female',
    genderHindi: 'महिला',
    state: 'Uttar Pradesh',
    stateHindi: 'उत्तर प्रदेश',
    city: 'Lucknow',
    occupation: 'Street Vendor',
    occupationHindi: 'सड़क विक्रेता',
    income: 180000,
    category: 'OBC',
    has_aadhaar: true,
    has_ration_card: false,
    has_udyam: false,
  },
  ration: {
    name: 'Ramesh Kumar',
    nameHindi: 'रमेश कुमार',
    age: 42,
    gender: 'Male',
    genderHindi: 'पुरुष',
    state: 'Bihar',
    stateHindi: 'बिहार',
    city: 'Patna',
    occupation: 'Daily Wage Laborer',
    occupationHindi: 'दैनिक मज़दूर',
    income: 96000,
    category: 'SC',
    has_aadhaar: false,
    has_ration_card: true,
    has_udyam: false,
  },
  udyam: {
    name: 'Anita Desai',
    nameHindi: 'अनीता देसाई',
    age: 35,
    gender: 'Female',
    genderHindi: 'महिला',
    state: 'Maharashtra',
    stateHindi: 'महाराष्ट्र',
    city: 'Pune',
    occupation: 'Small Business Owner (Tailoring)',
    occupationHindi: 'छोटा व्यवसायी (सिलाई)',
    income: 350000,
    category: 'General',
    has_aadhaar: false,
    has_ration_card: false,
    has_udyam: true,
  },
  manual: {
    name: 'Priya Sharma',
    nameHindi: 'प्रिया शर्मा',
    age: 28,
    gender: 'Female',
    genderHindi: 'महिला',
    state: 'Uttar Pradesh',
    stateHindi: 'उत्तर प्रदेश',
    city: 'Lucknow',
    occupation: 'Street Vendor',
    occupationHindi: 'सड़क विक्रेता',
    income: 180000,
    category: 'OBC',
    has_aadhaar: true,
    has_ration_card: true,
    has_udyam: true,
  },
};

const extractionSteps = [
  { icon: ScanLine, label: 'Scanning document...', labelHindi: 'दस्तावेज़ स्कैन कर रहे हैं...', duration: 1200 },
  { icon: User, label: 'Extracting name & demographics...', labelHindi: 'नाम और जनसांख्यिकी निकाल रहे हैं...', duration: 1000 },
  { icon: MapPin, label: 'Detecting location & state...', labelHindi: 'स्थान और राज्य का पता लगा रहे हैं...', duration: 900 },
  { icon: Briefcase, label: 'Identifying occupation...', labelHindi: 'व्यवसाय की पहचान कर रहे हैं...', duration: 800 },
  { icon: CreditCard, label: 'Matching income category...', labelHindi: 'आय श्रेणी मिला रहे हैं...', duration: 700 },
  { icon: Sparkles, label: 'Finding eligible schemes...', labelHindi: 'पात्र योजनाएं खोज रहे हैं...', duration: 800 },
];

function detectDocType(fileName: string): keyof typeof profileByDocType {
  const lower = fileName.toLowerCase();
  if (lower.includes('ration') || lower.includes('राशन')) return 'ration';
  if (lower.includes('udyam') || lower.includes('उद्यम')) return 'udyam';
  return 'aadhaar';
}

export default function DiscoverPage() {
  const router = useRouter();
  const { t, isHindi } = useLanguage();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [extractStep, setExtractStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<string>('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [extractedProfile, setExtractedProfile] = useState<ExtractedProfile | null>(null);

  // Manual question state
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const questions = isHindi
    ? ['आप किस राज्य में रहते हैं?', 'आपका व्यवसाय क्या है?', 'आपकी वार्षिक पारिवारिक आय कितनी है?']
    : ['Which state do you live in?', 'What is your occupation?', 'What is your annual family income?'];

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png)$/i)) {
      return t(
        'Invalid file type. Please upload a PDF, JPG, or PNG image.',
        'अमान्य फ़ाइल प्रकार। कृपया PDF, JPG, या PNG छवि अपलोड करें।'
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return t(
        'File is too large. Maximum size is 10 MB.',
        'फ़ाइल बहुत बड़ी है। अधिकतम आकार 10 MB है।'
      );
    }
    return null;
  };

  const handleFileUpload = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      return;
    }
    setFileError(null);
    const docType = detectDocType(file.name);
    setSelectedDoc(file.name);
    setExtractedProfile(profileByDocType[docType]);
    setPhase('extracting');
    runExtraction(docType, file.name);
  };

  const handleQuickUpload = (docKey: string, displayName: string) => {
    setFileError(null);
    const docType = detectDocType(docKey) as keyof typeof profileByDocType;
    setSelectedDoc(`${displayName}.pdf`);
    setExtractedProfile(profileByDocType[docType]);
    setPhase('extracting');
    runExtraction(docType, `${displayName}.pdf`);
  };

  const runExtraction = async (docType: keyof typeof profileByDocType, fileName: string) => {
    for (let i = 0; i < extractionSteps.length; i++) {
      setExtractStep(i);
      await new Promise((resolve) => setTimeout(resolve, extractionSteps[i].duration));
    }

    const profile = profileByDocType[docType];
    // Preserve the authenticated user's real name — only update document-derived fields
    const realName = (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || profile.name;

    // Update extractedProfile with the user's real name so the card shows it correctly
    setExtractedProfile({ ...profile, name: realName, nameHindi: realName });

    // Write to localStorage — Hackathon Demo Mode
    if (user) {
      const newProfile = {
        user_id: user.id,
        name: realName,
        age: profile.age,
        gender: profile.gender,
        state: profile.state,
        city: profile.city,
        occupation: profile.occupation,
        income: profile.income,
        category: profile.category,
        has_aadhaar: profile.has_aadhaar,
        has_ration_card: profile.has_ration_card,
        has_udyam: profile.has_udyam,
      };
      localStorage.setItem(`demo_profile_${user.id}`, JSON.stringify(newProfile));

      // Insert document record
      if (docType !== 'manual') {
        const docs = JSON.parse(localStorage.getItem(`demo_docs_${user.id}`) || '[]');
        docs.push({
          user_id: user.id,
          filename: fileName,
          doc_type: docType === 'aadhaar' ? 'Aadhaar' : docType === 'ration' ? 'Ration Card' : 'Udyam',
        });
        localStorage.setItem(`demo_docs_${user.id}`, JSON.stringify(docs));
      }
    }

    // 🎉 Confetti explosion on success!
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
    setSelectedDoc('manual');
    const profile = profileByDocType.manual;
    setExtractedProfile(profile);

    for (let i = 0; i < extractionSteps.length; i++) {
      setExtractStep(i);
      await new Promise((resolve) => setTimeout(resolve, extractionSteps[i].duration));
    }

    if (user) {
      const realName = (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || profile.name;
      const income = parseInt(answers[2]?.replace(/[^\d]/g, '')) || profile.income;
      const newProfile = {
        user_id: user.id,
        name: realName,
        age: profile.age,
        gender: profile.gender,
        state: answers[0] || profile.state,
        city: profile.city,
        occupation: answers[1] || profile.occupation,
        income,
        category: profile.category,
        has_aadhaar: profile.has_aadhaar,
        has_ration_card: profile.has_ration_card,
        has_udyam: profile.has_udyam,
      };
      localStorage.setItem(`demo_profile_${user.id}`, JSON.stringify(newProfile));
      setExtractedProfile({ ...profile, name: realName, nameHindi: realName, occupation: answers[1] || profile.occupation, income });
    }

    // 🎉 Confetti explosion on success!
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-50 via-white to-white">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {/* UPLOAD PHASE */}
          {phase === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
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
                    'कोई भी सरकारी दस्तावेज़ अपलोड करें — हमारी एआई आपकी जानकारी निकालती है और हर योजना खोजती है जिसके आप पात्र हैं।'
                  )}
                </p>
              </div>

              {/* File error */}
              <AnimatePresence>
                {fileError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {fileError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Drag and drop zone */}
              <motion.div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
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
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
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
                      onClick={() => handleQuickUpload(doc.key, doc.name)}
                      className="flex items-center gap-2 rounded-xl border border-trust-100 bg-white px-4 py-2.5 text-sm font-medium text-trust-700 shadow-sm transition-all hover:border-trust-300 hover:shadow-md"
                    >
                      <span className="text-lg">{doc.icon}</span>
                      {isHindi ? doc.nameHindi : doc.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Manual fallback */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
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
                          'No problem — answer 3 quick questions instead. We\'ll match you the same way.',
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
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-trust-900">
                  {t('Quick Questions', 'सरल प्रश्न')}
                </h1>
                <p className="mt-3 text-muted-foreground">
                  {t('Just 3 questions — takes 30 seconds.', 'केवल 3 प्रश्न — 30 सेकंड में।')}
                </p>
              </div>
              <Card className="space-y-6 border-trust-100 bg-white p-8 shadow-lg">
                {questions.map((q, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                  >
                    <label className="mb-2 block text-sm font-semibold text-trust-800">
                      {i + 1}. {q}
                    </label>
                    <input
                      type="text"
                      value={answers[i]}
                      onChange={(e) => {
                        const newAnswers = [...answers];
                        newAnswers[i] = e.target.value;
                        setAnswers(newAnswers);
                      }}
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
            <motion.div
              key="extracting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
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
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-saffron-100 px-3 py-1 text-xs font-semibold text-saffron-800">
                  <Sparkles className="h-3 w-3" />
                  {t('Demo Mode — Simulated Extraction', 'डेमो मोड — सिम्युलेटेड निष्कर्षण')}
                </div>
                <p className="mt-3 text-muted-foreground">
                  {selectedDoc !== 'manual' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-trust-50 px-3 py-1 text-sm font-medium text-trust-700">
                      <FileText className="h-3.5 w-3.5" />
                      {selectedDoc}
                    </span>
                  )}
                </p>
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
                        <span
                          className={`text-sm font-medium transition-colors ${
                            isDone ? 'text-emerald-700' : isCurrent ? 'text-trust-800' : 'text-muted-foreground'
                          }`}
                        >
                          {isHindi ? step.labelHindi : step.label}
                        </span>
                        {isCurrent && (
                          <motion.div
                            className="ml-auto h-1.5 w-24 overflow-hidden rounded-full bg-trust-100"
                          >
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-trust-400 to-trust-600"
                              initial={{ width: '0%' }}
                              animate={{ width: '100%' }}
                              transition={{ duration: step.duration / 1000, ease: 'linear' }}
                            />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Skeleton preview */}
                <div className="mt-8 space-y-3 rounded-2xl bg-trust-50/50 p-4">
                  <div className="h-4 w-3/4 rounded shimmer-bg" />
                  <div className="h-4 w-1/2 rounded shimmer-bg" />
                  <div className="h-4 w-2/3 rounded shimmer-bg" />
                </div>
              </Card>
            </motion.div>
          )}

          {/* COMPLETE PHASE */}
          {phase === 'complete' && extractedProfile && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
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
                  {t('Extraction Complete!', 'निष्कर्षण पूर्ण!')}
                </h1>
                <p className="mt-3 text-muted-foreground">
                  {t(
                    'We\'ve identified your profile and found schemes you qualify for.',
                    'हमने आपकी प्रोफ़ाइल पहचान ली है और योजनाएं खोज ली हैं जिनके आप पात्र हैं।'
                  )}
                </p>
              </div>

              {/* Extracted data preview */}
              <Card className="mb-6 border-emerald-200 bg-emerald-50/30 p-6 shadow-lg">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-800">
                    {t('Simulated Extraction (Demo)', 'सिम्युलेटेड निष्कर्षण (डेमो)')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {[
                    { label: t('Name', 'नाम'), value: extractedProfile.name, valueHindi: extractedProfile.nameHindi },
                    { label: t('Age', 'आयु'), value: String(extractedProfile.age), valueHindi: String(extractedProfile.age) },
                    { label: t('Gender', 'लिंग'), value: extractedProfile.gender, valueHindi: extractedProfile.genderHindi },
                    { label: t('State', 'राज्य'), value: extractedProfile.state, valueHindi: extractedProfile.stateHindi },
                    { label: t('Occupation', 'व्यवसाय'), value: extractedProfile.occupation, valueHindi: extractedProfile.occupationHindi },
                    { label: t('Income', 'आय'), value: `₹${(extractedProfile.income / 1000).toFixed(0)}K/yr`, valueHindi: `₹${(extractedProfile.income / 1000).toFixed(0)}K/वर्ष` },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="rounded-xl bg-white p-3 shadow-sm"
                    >
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                      <div className="mt-0.5 font-semibold text-trust-900">
                        {isHindi ? item.valueHindi : item.value}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
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
