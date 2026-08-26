'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  FileText,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { useLanguage } from '@/lib/language-context';
import { useRequireAuth } from '@/lib/use-require-auth';

interface AppealResult {
  explanation: string;
  explanationHindi: string;
  appealLetter: string;
  appealLetterHindi: string;
  cpgramsUrl: string;
}

function AppealPageInner() {
  useRequireAuth();
  const { t, isHindi } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const schemeId = searchParams.get('schemeId') || '';
  const schemeName = decodeURIComponent(searchParams.get('schemeName') || '');
  let failedCriteria: string[] = [];
  try {
    const raw = searchParams.get('failedCriteria');
    if (raw) failedCriteria = JSON.parse(decodeURIComponent(raw));
  } catch {}

  const [result, setResult] = useState<AppealResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateAppeal = async () => {
    if (!schemeId || !schemeName) {
      setError(t(
        'Missing scheme information. Please go back to your dashboard.',
        'योजना जानकारी गायब है। कृपया अपने डैशबोर्ड पर वापस जाएं।'
      ));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/appeal-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schemeId, schemeName, failedCriteria }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || t('Failed to generate appeal guidance.', 'अपील मार्गदर्शन तैयार करने में विफल।'));
        return;
      }
      setResult(data);
    } catch {
      setError(t('Network error. Please check your connection.', 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schemeId && schemeName) generateAppeal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = async () => {
    const text = isHindi ? result?.appealLetterHindi : result?.appealLetter;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-white to-white">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-6 gap-1.5 text-muted-foreground no-print"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('Back to Dashboard', 'डैशबोर्ड पर वापस')}
        </Button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30">
              <AlertTriangle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-trust-900 sm:text-3xl">
                {t('Post-Rejection Appeal Assistant', 'अस्वीकृति अपील सहायक')}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  'Generate a formal CPGRAMS grievance letter to appeal your eligibility decision.',
                  'अपनी पात्रता निर्णय के खिलाफ अपील करने के लिए एक आधिकारिक CPGRAMS शिकायत पत्र तैयार करें।'
                )}
              </p>
            </div>
          </div>

          {/* Scheme info pill */}
          {schemeName && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-sm px-3 py-1">
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                {schemeName}
              </Badge>
              {failedCriteria.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {t(`${failedCriteria.length} criteria not met`, `${failedCriteria.length} मानदंड अपूर्ण`)}
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Failed Criteria Summary */}
        {failedCriteria.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="mb-6 border-rose-200 bg-rose-50/40 p-5">
              <h2 className="text-sm font-bold text-rose-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                {t('Criteria Not Met', 'अपूर्ण मानदंड')}
              </h2>
              <ul className="space-y-1.5">
                {failedCriteria.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-rose-800">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                    {c}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Loading state */}
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="border-trust-100 bg-white p-10 shadow-lg flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-trust-500 to-trust-700 shadow-lg">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
                <p className="text-center font-semibold text-trust-900">
                  {t('Drafting your CPGRAMS appeal letter...', 'CPGRAMS अपील पत्र तैयार किया जा रहा है...')}
                </p>
                <p className="text-xs text-center text-muted-foreground max-w-xs">
                  {t('Our AI is generating a formal grievance letter in both English and Hindi based on the failed criteria.', 'हमारी एआई अपूर्ण मानदंडों के आधार पर अंग्रेज़ी और हिंदी दोनों भाषाओं में एक आधिकारिक शिकायत पत्र तैयार कर रही है।')}
                </p>
              </Card>
            </motion.div>
          )}

          {/* Error state */}
          {error && !loading && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="border-rose-200 bg-rose-50/50 p-6 shadow-md">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-900 text-sm">{error}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 gap-1.5 border-rose-300 text-rose-700"
                      onClick={generateAppeal}
                    >
                      <RefreshCw className="h-4 w-4" />
                      {t('Try Again', 'पुनः प्रयास करें')}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Result */}
          {result && !loading && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Explanation */}
              <Card className="mb-5 border-trust-200 bg-white p-6 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-trust-600" />
                  <h2 className="font-bold text-trust-900">
                    {t('Why You May Be Eligible to Appeal', 'आप अपील क्यों कर सकते हैं')}
                  </h2>
                </div>
                <p className="text-sm text-trust-800 leading-relaxed">
                  {isHindi ? result.explanationHindi : result.explanation}
                </p>
              </Card>

              {/* Appeal letter */}
              <Card className="mb-5 border-amber-200 bg-amber-50/30 p-6 shadow-md print-card">
                <div className="flex items-center justify-between mb-4 no-print">
                  <h2 className="font-bold text-amber-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-600" />
                    {t('CPGRAMS Grievance Letter', 'CPGRAMS शिकायत पत्र')}
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className="gap-1.5 border-amber-300 text-amber-800 hover:bg-amber-100"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? t('Copied!', 'कॉपी हो गया!') : t('Copy', 'कॉपी करें')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrint}
                      className="gap-1.5 border-amber-300 text-amber-800 hover:bg-amber-100"
                    >
                      <Download className="h-4 w-4" />
                      {t('Print / Save PDF', 'प्रिंट / PDF सहेजें')}
                    </Button>
                  </div>
                </div>
                <div className="rounded-xl bg-white border border-amber-200 p-4 font-mono text-sm text-trust-900 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto print-card">
                  {isHindi ? result.appealLetterHindi : result.appealLetter}
                </div>
              </Card>

              {/* CPGRAMS link */}
              <Card className="border-trust-100 bg-trust-50/40 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-trust-900 text-sm">
                      {t('File Your Grievance Officially', 'आधिकारिक रूप से शिकायत दर्ज करें')}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t(
                        'Copy the letter above and paste it on the CPGRAMS portal (pgportal.gov.in) to officially file your appeal.',
                        'ऊपर दिए गए पत्र को कॉपी करें और CPGRAMS पोर्टल पर चिपकाएं।'
                      )}
                    </p>
                  </div>
                  <a
                    href="https://pgportal.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-trust-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-trust-700 transition-colors focus-visible:ring-2 focus-visible:ring-trust-500"
                  >
                    {t('Open CPGRAMS Portal', 'CPGRAMS पोर्टल खोलें')}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </Card>

              {/* Regenerate */}
              <div className="mt-5 flex justify-center no-print">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateAppeal}
                  className="gap-1.5 text-muted-foreground"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('Regenerate Letter', 'पत्र पुनः तैयार करें')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AppealPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-trust-600" /></div>}>
      <AppealPageInner />
    </Suspense>
  );
}
