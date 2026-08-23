'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Sparkles,
  Volume2,
  Square,
  Languages,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Lightbulb,
  ListChecks,
  Bot,
  User,
  Send,
  UploadCloud,
  ClipboardType,
  AlertCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';
import { useLanguage } from '@/lib/language-context';
import { useRequireAuth } from '@/lib/use-require-auth';
import type { JargonDocument } from '@/lib/types';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

export default function DeJargonifierPage() {
  useRequireAuth();
  const { t, isHindi, toggle } = useLanguage();

  // Modes: 'input' (initial), 'analyzing', 'result'
  const [mode, setMode] = useState<'input' | 'analyzing' | 'result'>('input');
  const [inputMode, setInputMode] = useState<'paste' | 'upload'>('paste');
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [doc, setDoc] = useState<JargonDocument | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatTyping, setChatTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const summary = doc ? (isHindi ? doc.summaryHindi : doc.summary) : [];
  const nextSteps = doc ? (isHindi ? doc.nextStepsHindi : doc.nextSteps) : [];
  const legalTexts = doc ? (isHindi ? doc.legalTextHindi : doc.legalText) : [];
  const title = doc ? (isHindi ? doc.titleHindi : doc.title) : '';
  const source = doc ? (isHindi ? doc.sourceHindi : doc.source) : '';

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|webp)$/i)) {
      return t('Invalid file type. Upload PDF, JPG, or PNG.', 'अमान्य फ़ाइल प्रकार। PDF, JPG, या PNG अपलोड करें।');
    }
    if (file.size > MAX_FILE_SIZE) {
      return t('File too large. Maximum size is 10 MB.', 'फ़ाइल बहुत बड़ी है। अधिकतम 10 MB।');
    }
    return null;
  };

  const handleAnalyze = async () => {
    setApiError(null);
    if (inputMode === 'paste' && !pastedText.trim()) return;
    if (inputMode === 'upload' && !selectedFile) return;

    setMode('analyzing');

    try {
      let res: Response;

      if (inputMode === 'paste') {
        res = await fetch('/api/dejargonify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: pastedText }),
        });
      } else {
        const formData = new FormData();
        formData.append('file', selectedFile!);
        res = await fetch('/api/dejargonify', { method: 'POST', body: formData });
      }

      const data = await res.json();
      if (!res.ok || data.error) {
        setApiError(data.error ?? t('Analysis failed. Please try again.', 'विश्लेषण विफल। कृपया पुनः प्रयास करें।'));
        setMode('input');
        return;
      }

      setDoc(data as JargonDocument);
      setChatMessages([]);
      setMode('result');
    } catch {
      setApiError(t('Network error. Please check your connection.', 'नेटवर्क त्रुटि। कनेक्शन जाँचें।'));
      setMode('input');
    }
  };

  const handleReadAloud = () => {
    if (isReading) {
      setIsReading(false);
      window.speechSynthesis?.cancel();
      return;
    }
    setIsReading(true);
    const text = summary.join('. ');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.9;
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsReading(false), 3000);
    }
  };

  const handleSendQuestion = async (question: string) => {
    if (!question.trim() || chatTyping) return;
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: question }]);
    setChatTyping(true);

    try {
      // Include the document context in the chat so the AI answers about this specific doc
      const documentContext = doc
        ? `The user is asking about a government document titled "${doc.title}". ` +
          `Plain-language summary: ${doc.summary.join(' ')} ` +
          `Next steps: ${doc.nextSteps.join(', ')}.`
        : '';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', text: documentContext + '\n\nUser question: ' + question },
          ],
          language: isHindi ? 'hi' : 'en',
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, {
        role: 'ai',
        text: data.reply ?? t('Sorry, I could not answer that.', 'माफ़ करें, मैं उत्तर नहीं दे सका।'),
      }]);
    } catch {
      setChatMessages((prev) => [...prev, {
        role: 'ai',
        text: t('Network error. Please try again.', 'नेटवर्क त्रुटि। पुनः प्रयास करें।'),
      }]);
    } finally {
      setChatTyping(false);
    }
  };

  const quickQuestions = isHindi
    ? ['क्या मैं पात्र हूं?', 'ऋण राशि कितनी है?', 'क्या दस्तावेज़ चाहिए?']
    : ['Am I eligible?', 'What is the benefit amount?', 'What documents do I need?'];

  // ─── INPUT SCREEN ─────────────────────────────────────────────────────────
  if (mode === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-trust-50 via-white to-white">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-trust-500 to-trust-700 shadow-xl shadow-trust-500/30">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-trust-900 sm:text-4xl">
              {t('De-Jargonifier', 'द-जैगनिफायर')}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t(
                'Paste any government document text or upload a PDF/image — get a plain-language summary in seconds.',
                'कोई भी सरकारी दस्तावेज़ का टेक्स्ट पेस्ट करें या PDF/छवि अपलोड करें — सेकंडों में सरल सारांश पाएं।'
              )}
            </p>
          </motion.div>

          {/* Error banner */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {apiError}
                <button onClick={() => setApiError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="overflow-hidden border-trust-100 shadow-lg">
            {/* Tab switcher */}
            <div className="flex border-b border-trust-100">
              {[
                { key: 'paste', icon: ClipboardType, label: t('Paste Text', 'टेक्स्ट पेस्ट करें') },
                { key: 'upload', icon: UploadCloud, label: t('Upload File', 'फ़ाइल अपलोड करें') },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setInputMode(key as 'paste' | 'upload')}
                  className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${
                    inputMode === key
                      ? 'border-b-2 border-trust-600 text-trust-700 bg-trust-50/50'
                      : 'text-muted-foreground hover:text-trust-700 hover:bg-muted/30'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {inputMode === 'paste' ? (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-trust-800">
                    {t('Paste government document text here', 'सरकारी दस्तावेज़ का टेक्स्ट यहाँ पेस्ट करें')}
                  </label>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={t(
                      'Paste any circular, notification, scheme guidelines, or legal text...',
                      'कोई भी परिपत्र, अधिसूचना, योजना दिशानिर्देश, या कानूनी टेक्स्ट पेस्ट करें...'
                    )}
                    rows={10}
                    className="w-full rounded-xl border border-trust-200 bg-trust-50/30 px-4 py-3 text-sm text-trust-900 outline-none transition focus:border-trust-500 focus:ring-2 focus:ring-trust-500/20 placeholder:text-muted-foreground resize-none"
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {pastedText.length} {t('characters', 'अक्षर')}
                  </p>
                </div>
              ) : (
                <div>
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
                  <motion.div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (!file) return;
                      const err = validateFile(file);
                      if (err) { setFileError(err); return; }
                      setFileError(null);
                      setSelectedFile(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    animate={dragOver ? { scale: 1.02 } : { scale: 1 }}
                    className="cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors"
                    style={{
                      borderColor: dragOver ? 'hsl(214 88% 56%)' : selectedFile ? 'hsl(142 71% 50%)' : 'hsl(214 32% 91%)',
                      backgroundColor: dragOver ? 'hsl(211 100% 97%)' : selectedFile ? 'hsl(142 76% 97%)' : 'hsl(0 0% 100%)',
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const err = validateFile(file);
                        if (err) { setFileError(err); return; }
                        setFileError(null);
                        setSelectedFile(file);
                      }}
                    />
                    {selectedFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                        <p className="font-semibold text-emerald-700">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(0)} KB ·{' '}
                          <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="text-rose-600 hover:underline">
                            {t('Remove', 'हटाएं')}
                          </button>
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <UploadCloud className="h-12 w-12 text-trust-400" />
                        <div>
                          <p className="font-semibold text-trust-900">{t('Drop file here', 'फ़ाइल यहाँ छोड़ें')}</p>
                          <p className="text-sm text-muted-foreground">{t('PDF, JPG, PNG — max 10 MB', 'PDF, JPG, PNG — अधिकतम 10 MB')}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}

              <Button
                className="mt-6 w-full gap-2 bg-trust-600 hover:bg-trust-700 h-12 text-base shadow-lg shadow-trust-500/20"
                onClick={handleAnalyze}
                disabled={
                  (inputMode === 'paste' && !pastedText.trim()) ||
                  (inputMode === 'upload' && !selectedFile)
                }
              >
                <Sparkles className="h-4 w-4" />
                {t('Simplify This Document', 'इस दस्तावेज़ को सरल बनाएं')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Language toggle */}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={toggle} className="gap-1.5">
              <Languages className="h-4 w-4" />
              {isHindi ? 'English' : 'हिंदी'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── ANALYZING SCREEN ────────────────────────────────────────────────────
  if (mode === 'analyzing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-trust-50 via-white to-white">
        <Navbar />
        <div className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-trust-500 to-trust-700 shadow-xl shadow-trust-500/30"
            >
              <Sparkles className="h-10 w-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-trust-900">
              {t('Simplifying your document...', 'दस्तावेज़ सरल कर रहे हैं...')}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t(
                'Our AI is reading the legal text and translating it into plain language.',
                'हमारी एआई कानूनी टेक्स्ट पढ़ रही है और इसे सरल भाषा में बदल रही है।'
              )}
            </p>
            <div className="mt-8 flex justify-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="h-2.5 w-2.5 rounded-full bg-trust-400"
                  animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── RESULT SCREEN ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-50 via-white to-white">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-trust-900 sm:text-4xl">
              {t('De-Jargonifier', 'द-जैगनिफायर')}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t(
                'Government legalese → plain language. "Explain like I\'m 10."',
                'सरकारी भाषा → सरल भाषा। "10 साल के बच्चे को समझाएं जैसे।"'
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={toggle} className="gap-1.5">
              <Languages className="h-4 w-4" />
              {isHindi ? 'English' : 'हिंदी'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setMode('input'); setDoc(null); setChatMessages([]); }} className="gap-1.5">
              {t('Analyze Another', 'दूसरा दस्तावेज़')}
            </Button>
          </div>
        </motion.div>

        {/* Split screen */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* LEFT: Legal document */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full overflow-hidden border-trust-100 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-trust-100 bg-gradient-to-r from-muted/50 to-muted/30 px-5 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-trust-600" />
                  <span className="text-sm font-semibold text-trust-900">
                    {t('Official Document', 'आधिकारिक दस्तावेज़')}
                  </span>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {inputMode === 'upload' ? selectedFile?.name?.split('.').pop()?.toUpperCase() ?? 'DOC' : 'TEXT'}
                </span>
              </div>

              <div className="max-h-[600px] overflow-y-auto p-6">
                {/* Document header */}
                <div className="mb-4 border-b border-dashed border-trust-100 pb-4">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-saffron-100 p-1">
                      <div className="h-full w-full rounded-full border-2 border-saffron-600" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('Government of India', 'भारत सरकार')}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold leading-tight text-trust-900">{title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{source}</p>
                </div>

                {/* Legal text paragraphs */}
                <div className="space-y-4">
                  {legalTexts.length > 0 ? legalTexts.map((para, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}>
                      <div className="mb-1 text-xs font-bold text-trust-400">
                        {t(`Clause ${i + 1}`, `धारा ${i + 1}`)}
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{para}</p>
                    </motion.div>
                  )) : (
                    <p className="text-sm italic text-muted-foreground">
                      {t('Original text not available — see the AI summary on the right.', 'मूल टेक्स्ट उपलब्ध नहीं है — दाईं ओर AI सारांश देखें।')}
                    </p>
                  )}
                </div>

                {/* "Too complex?" callout */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-6 rounded-xl border border-saffron-200 bg-saffron-50 p-4"
                >
                  <div className="flex items-center gap-2 text-sm text-saffron-800">
                    <Lightbulb className="h-4 w-4" />
                    {t(
                      'Looks complicated? The AI on the right explains it in seconds.',
                      'जटिल लग रहा है? दाईं ओर की एआई इसे सेकंडों में समझाती है।'
                    )}
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* RIGHT: AI Assistant */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="flex h-full flex-col overflow-hidden border-trust-100 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-trust-100 bg-gradient-to-r from-trust-50 to-emerald-50/50 px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-trust-500 to-trust-700">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-trust-900">
                    {t('AI Assistant', 'एआई सहायक')}
                  </span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReadAloud}
                  className={`gap-1.5 ${
                    isReading
                      ? 'border-rose-300 text-rose-600 hover:bg-rose-50'
                      : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {isReading ? (
                    <><Square className="h-3.5 w-3.5" />{t('Stop', 'रोकें')}</>
                  ) : (
                    <><Volume2 className="h-3.5 w-3.5" />{t('Read Aloud', 'पढ़कर सुनाएं')}</>
                  )}
                </Button>
              </div>

              <div className="max-h-[600px] flex-1 overflow-y-auto p-6">
                <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  {/* Summary header */}
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-bold text-trust-900">
                      {t('Here\'s what it means:', 'इसका मतलब यह है:')}
                    </h3>
                  </div>

                  {/* 3 plain-language bullets */}
                  <div className="space-y-3">
                    {summary.map((bullet, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className={`flex gap-3 rounded-2xl p-4 ${
                          isReading ? 'bg-trust-50 ring-2 ring-trust-300' : 'bg-emerald-50/50'
                        }`}
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                          {i + 1}
                        </div>
                        <p className="text-sm leading-relaxed text-trust-800">{bullet}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Next steps */}
                  {nextSteps.length > 0 && (
                    <div className="rounded-2xl border border-trust-100 bg-gradient-to-br from-trust-50 to-white p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-trust-600" />
                        <h4 className="font-bold text-trust-900">
                          {t('Your Next Steps', 'आपके अगले कदम')}
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {nextSteps.map((step, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="flex items-start gap-2"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <span className="text-sm text-trust-700">{step}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chat area */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-trust-700">
                      <Bot className="h-4 w-4" />
                      {t('Ask me anything about this document', 'इस दस्तावेज़ के बारे में कुछ भी पूछें')}
                    </div>

                    {chatMessages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                            msg.role === 'ai'
                              ? 'bg-gradient-to-br from-trust-500 to-trust-700'
                              : 'bg-gradient-to-br from-saffron-400 to-saffron-600'
                          }`}
                        >
                          {msg.role === 'ai' ? (
                            <Bot className="h-4 w-4 text-white" />
                          ) : (
                            <User className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                            msg.role === 'ai' ? 'bg-trust-50 text-trust-800' : 'bg-saffron-50 text-trust-800'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}

                    {chatTyping && (
                      <div className="flex gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-trust-500 to-trust-700">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex items-center gap-1 rounded-2xl bg-trust-50 px-4 py-3">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="h-2 w-2 rounded-full bg-trust-400"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick questions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {quickQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendQuestion(q)}
                          disabled={chatTyping}
                          className="rounded-full border border-trust-200 bg-white px-3 py-1.5 text-xs font-medium text-trust-700 transition-all hover:border-trust-400 hover:bg-trust-50 disabled:opacity-50"
                        >
                          {q}
                        </button>
                      ))}
                    </div>

                    {/* Chat input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendQuestion(chatInput)}
                        placeholder={t('Ask a question...', 'प्रश्न पूछें...')}
                        disabled={chatTyping}
                        className="flex-1 rounded-xl border border-trust-200 bg-trust-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-trust-500 focus:ring-2 focus:ring-trust-500/20 disabled:opacity-60"
                      />
                      <button
                        onClick={() => handleSendQuestion(chatInput)}
                        disabled={!chatInput.trim() || chatTyping}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-trust-600 text-white transition hover:bg-trust-700 disabled:opacity-40"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
