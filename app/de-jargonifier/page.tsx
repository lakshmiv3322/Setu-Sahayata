'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';
import { useLanguage } from '@/lib/language-context';
import { useRequireAuth } from '@/lib/use-require-auth';
import { mockJargonDocument } from '@/lib/mock-data';

export default function DeJargonifierPage() {
  useRequireAuth();
  const { t, isHindi, toggle } = useLanguage();
  const [isReading, setIsReading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasSummarized, setHasSummarized] = useState(true);
  const [chatMessages, setChatMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([]);

  const doc = mockJargonDocument;
  const summary = isHindi ? doc.summaryHindi : doc.summary;
  const nextSteps = isHindi ? doc.nextStepsHindi : doc.nextSteps;
  const legalTexts = isHindi ? doc.legalTextHindi : doc.legalText;
  const title = isHindi ? doc.titleHindi : doc.title;
  const source = isHindi ? doc.sourceHindi : doc.source;

  const handleReadAloud = () => {
    if (isReading) {
      setIsReading(false);
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

  const handleReanalyze = () => {
    setIsAnalyzing(true);
    setHasSummarized(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasSummarized(true);
    }, 2000);
  };

  const handleSendQuestion = (question: string) => {
    setChatMessages((prev) => [...prev, { role: 'user', text: question }]);
    setTimeout(() => {
      const responses = isHindi
        ? [
            'हाँ, यह योजना आपके लिए उपलब्ध है! आप सड़क विक्रेता हैं, इसलिए आप पात्र हैं।',
            'ऋण राशि ₹10,000 से शुरू होती है और समय पर चुकाने पर ₹50,000 तक बढ़ सकती है।',
            'आवेदन करने के लिए आधार कार्ड और वेंडिंग प्रमाणपत्र चाहिए।',
          ]
        : [
            'Yes, this scheme is available for you! As a street vendor, you qualify.',
            'The loan starts at ₹10,000 and can grow up to ₹50,000 if you repay on time.',
            'You\'ll need your Aadhaar card and a vending certificate to apply.',
          ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages((prev) => [...prev, { role: 'ai', text: response }]);
    }, 1000);
  };

  const quickQuestions = isHindi
    ? ['क्या मैं पात्र हूं?', 'ऋण राशि कितनी है?', 'क्या दस्तावेज़ चाहिए?']
    : ['Am I eligible?', 'How much is the loan?', 'What documents do I need?'];

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
          <Button variant="outline" size="sm" onClick={toggle} className="gap-1.5">
            <Languages className="h-4 w-4" />
            {isHindi ? 'English' : 'हिंदी'}
          </Button>
        </motion.div>

        {/* Split screen */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* LEFT: Legal document */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full overflow-hidden border-trust-100 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-trust-100 bg-gradient-to-r from-muted/50 to-muted/30 px-5 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-trust-600" />
                  <span className="text-sm font-semibold text-trust-900">
                    {t('Official Document', 'आधिकारिक दस्तावेज़')}
                  </span>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  PDF
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
                  <div className="mt-2 flex gap-2">
                    <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {t('Circular No. 14/2024', 'परिपत्र संख्या 14/2024')}
                    </span>
                    <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {t('Issued: 15 Mar 2024', 'जारी: 15 मार्च 2024')}
                    </span>
                  </div>
                </div>

                {/* Legal text paragraphs */}
                <div className="space-y-4">
                  {legalTexts.map((para, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <div className="mb-1 text-xs font-bold text-trust-400">
                        {t(`Clause ${i + 1}`, `धारा ${i + 1}`)}
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {para}
                      </p>
                    </motion.div>
                  ))}
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
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
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
                    <>
                      <Square className="h-3.5 w-3.5" />
                      {t('Stop', 'रोकें')}
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5" />
                      {t('Read Aloud', 'पढ़कर सुनाएं')}
                    </>
                  )}
                </Button>
              </div>

              <div className="max-h-[600px] flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {isAnalyzing ? (
                    <motion.div
                      key="analyzing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex h-full flex-col items-center justify-center"
                    >
                      <Loader2 className="h-10 w-10 animate-spin text-trust-500" />
                      <p className="mt-4 text-sm font-medium text-muted-foreground">
                        {t('Simplifying the document...', 'दस्तावेज़ सरल कर रहे हैं...')}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-5"
                    >
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
                              isReading
                                ? 'bg-trust-50 ring-2 ring-trust-300'
                                : 'bg-emerald-50/50'
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
                                msg.role === 'ai'
                                  ? 'bg-trust-50 text-trust-800'
                                  : 'bg-saffron-50 text-trust-800'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </motion.div>
                        ))}

                        {/* Quick questions */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {quickQuestions.map((q, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendQuestion(q)}
                              className="rounded-full border border-trust-200 bg-white px-3 py-1.5 text-xs font-medium text-trust-700 transition-all hover:border-trust-400 hover:bg-trust-50"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Re-analyze button */}
              <div className="border-t border-trust-100 p-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReanalyze}
                  className="w-full gap-1.5"
                >
                  <Sparkles className="h-4 w-4" />
                  {t('Re-analyze Document', 'दस्तावेज़ पुनः विश्लेषण करें')}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
