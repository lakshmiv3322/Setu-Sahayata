'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  Camera,
  Scale,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';
import { CameraCapture } from '@/components/camera-capture';
import { ConsentModal } from '@/components/consent-modal';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { supabaseBrowser as supabase } from '@/lib/supabase-browser';
import type { ExtractedDocumentFields } from '@/app/api/extract-document/route';
import { validateExtractedDocument, type ValidationSummary } from '@/lib/document-validation';
import { logAuditEvent } from '@/lib/audit-logger';

type Phase = 'upload' | 'camera' | 'extracting' | 'questions' | 'consent' | 'complete';

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

    let existingProfile = null;
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      existingProfile = data;
    }

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

    if (user) {
      await supabase.from('profiles').upsert({
        user_id: user.id,
        name: profile.name,
        age: profile.age || 30,
        gender: profile.gender || 'Female',
        state: profile.state || 'Maharashtra',
        city: profile.city || 'Mumbai',
        occupation: profile.occupation || 'Street Vendor',
        income: profile.income || 120000,
        category: profile.category || 'OBC',
        has_aadhaar: profile.has_aadhaar,
        has_ration_card: profile.has_ration_card,
        has_udyam: profile.has_udyam,
        updated_at: new Date().toISOString(),
      });

      await logAuditEvent('DOCUMENT_EXTRACTED', {
        file_name: file.name,
        doc_type: apiResult.docType,
      });
    }

    setPhase('consent');
  };

  const callExtractApi = async (file: File): Promise<ExtractedDocumentFields | { error: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/extract-document', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        return { error: t('Document extraction failed. Please try again.', 'दस्तावेज़ निष्कर्षण विफल रहा। कृपया पुनः प्रयास करें।') };
      }

      return await res.json();
    } catch {
      return { error: t('Network error. Check your connection.', 'नेटवर्क त्रुटि। अपना कनेक्शन जांचें।') };
    }
  };

  const handleConsentConfirm = async () => {
    setPhase('complete');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-setu-50/70 via-white to-saffron-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-saffron-600 dark:text-saffron-400">
            {t('Zero-Click Scheme Discovery', 'ज़ीरो-क्लिक योजना खोज')}
          </span>
          <h1 className="font-display text-3xl font-extrabold text-setu-950 dark:text-setu-50 sm:text-4xl mt-1">
            {t('Upload Document or Scan with Camera', 'दस्तावेज़ अपलोड करें या कैमरे से स्कैन करें')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            {t('Aadhaar, Ration Card, or Udyam Certificate — Setu AI extracts your eligibility instantly.', 'आधार, राशन कार्ड, या उद्यम प्रमाणपत्र — सेतु एआई आपकी पात्रता का तुरंत विश्लेषण करता है।')}
          </p>
        </motion.div>

        {/* Phase 1: Upload / Camera selector */}
        {phase === 'upload' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-8 border-setu-100 bg-white/90 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 rounded-3xl text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Button
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2.5 rounded-2xl bg-setu-600 hover:bg-setu-700 text-white font-semibold shadow-md shadow-setu-600/20 px-6 h-12 w-full sm:w-auto"
                >
                  <UploadCloud className="h-5 w-5" />
                  {t('Choose File from Device', 'डिवाइस से फ़ाइल चुनें')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setPhase('camera')}
                  className="gap-2.5 rounded-2xl border-saffron-300 bg-saffron-50/50 hover:bg-saffron-100 text-saffron-800 font-semibold px-6 h-12 w-full sm:w-auto dark:border-saffron-800 dark:bg-saffron-950/30 dark:text-saffron-300"
                >
                  <Camera className="h-5 w-5 text-saffron-600" />
                  {t('Scan Document via Camera', 'कैमरे से स्कैन करें')}
                </Button>
              </div>

              {/* Drag & drop dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${
                  dragOver
                    ? 'border-setu-500 bg-setu-50/50 dark:bg-setu-950/40'
                    : 'border-setu-200 hover:border-setu-400 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  accept={ACCEPTED_TYPES.join(',')}
                  className="hidden"
                />
                <UploadCloud className="mx-auto h-12 w-12 text-setu-500 mb-3" />
                <p className="text-sm font-bold text-setu-950 dark:text-setu-50">
                  {t('Drag & drop your document here', 'अपना दस्तावेज़ यहाँ खींचें और छोड़ें')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports PDF, JPG, PNG, WEBP up to 10MB
                </p>
              </div>

              {fileError && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fileError}</span>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Phase 2: Live Camera Capture */}
        {phase === 'camera' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <CameraCapture
              onCapture={(file) => handleFileUpload(file)}
              onCancel={() => setPhase('upload')}
            />
          </motion.div>
        )}

        {/* Phase 3: Extraction Progress */}
        {phase === 'extracting' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-8 border-setu-100 bg-white/90 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 rounded-3xl text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-setu-600 mb-4" />
              <h3 className="font-display text-xl font-bold text-setu-950 dark:text-setu-50 mb-2">
                {t('Setu AI Document Analysis', 'सेतु एआई दस्तावेज़ विश्लेषण')}
              </h3>
              <p className="text-xs text-muted-foreground mb-6">
                {extractionSteps[extractStep]?.label}
              </p>

              <div className="w-full bg-setu-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden mb-6">
                <div
                  className="bg-setu-600 h-full transition-all duration-300"
                  style={{ width: `${((extractStep + 1) / extractionSteps.length) * 100}%` }}
                />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Phase 4: Consent Confirmation Modal */}
        {phase === 'consent' && extractedProfile && (
          <ConsentModal
            isOpen={true}
            onClose={() => setPhase('upload')}
            onConfirm={handleConsentConfirm}
            sensitiveFields={[
              { key: 'name', name: 'Full Name', nameHindi: 'पूरा नाम', value: extractedProfile.name, purpose: 'Used for scheme eligibility matching', purposeHindi: 'योजना पात्रता मिलान के लिए प्रयुक्त' },
              { key: 'age', name: 'Age', nameHindi: 'आयु', value: String(extractedProfile.age), purpose: 'Used for age-restricted scheme filters', purposeHindi: 'आयु-प्रतिबंधित योजना फ़िल्टर के लिए प्रयुक्त' },
              { key: 'location', name: 'Location', nameHindi: 'स्थान', value: `${extractedProfile.city}, ${extractedProfile.state}`, purpose: 'Used for state-specific scheme matching', purposeHindi: 'राज्य-विशिष्ट योजना मिलान के लिए प्रयुक्त' },
              { key: 'income', name: 'Annual Income', nameHindi: 'वार्षिक आय', value: `₹${extractedProfile.income}`, purpose: 'Used for income slab verification', purposeHindi: 'आय स्लैब सत्यापन के लिए प्रयुक्त' },
            ]}
          />
        )}
      </div>
    </div>
  );
}
