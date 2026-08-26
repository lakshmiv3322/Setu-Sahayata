'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  FileText,
  ClipboardCheck,
  ShieldCheck,
  WifiOff,
  Languages,
  Mic,
  ArrowRight,
  CheckCircle2,
  Users,
  TrendingUp,
  Building2,
  Lock,
  Zap,
  Check,
  X,
  FileCheck,
  Award,
  Sparkle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';
import { AccessibilityModeSelector } from '@/components/accessibility-mode-selector';
import { CompetitiveAdvantage } from '@/components/competitive-advantage';
import { useLanguage } from '@/lib/language-context';
import { statTickerItems, mockSchemes } from '@/lib/mock-data';

export default function LandingPage() {
  const { t } = useLanguage();
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const isInView = useInView(featuresRef, { once: true, margin: '-100px' });
  const isStatsInView = useInView(statsRef, { once: true, margin: '-50px' });

  const features = [
    {
      icon: Search,
      title: t('Zero-Click Scheme Discovery', 'ज़ीरो-क्लिक योजना खोज'),
      desc: t(
        'Upload your Aadhaar or Ration Card and our AI instantly finds every welfare scheme you qualify for — no tedious manual searching.',
        'अपना आधार या राशन कार्ड अपलोड करें और हमारी एआई तुरंत हर कल्याण योजना खोज लेगी जिसके आप पात्र हैं — कोई परेशानी नहीं।'
      ),
      link: '/discover',
      gradient: 'from-setu-500 to-setu-700',
    },
    {
      icon: FileText,
      title: t('AI De-Jargonifier', 'एआई द-जैगनिफायर'),
      desc: t(
        'Dense government legalese translated into 3 simple plain bullets — "explain like I\'m 10." Understand any document in seconds.',
        'घने सरकारी दस्तावेज़ों का 3 सरल बातों में अनुवाद — "10 साल के बच्चे को समझाएं जैसे।" किसी भी दस्तावेज़ को सेकंडों में समझें।'
      ),
      link: '/de-jargonifier',
      gradient: 'from-saffron-500 to-saffron-700',
    },
    {
      icon: ClipboardCheck,
      title: t('Auto-Fill Applications', 'ऑटो-फिल आवेदन'),
      desc: t(
        '90% of your application is pre-filled from your uploaded documents. Just review, verify, and submit with one click.',
        'आपके आवेदन का 90% आपके दस्तावेज़ों से पहले से भरा हुआ। बस समीक्षा करें, सत्यापित करें, और एक क्लिक से जमा करें।'
      ),
      link: '/apply',
      gradient: 'from-emerald-500 to-emerald-700',
    },
  ];

  const liveStats = [
    { label: t('Welfare Schemes Indexed', 'कल्याणकारी योजनाएं सूचीबद्ध'), value: 50, suffix: '+', icon: Building2 },
    { label: t('Ministries & Departments', 'मंत्रालय और विभाग'), value: 18, suffix: '', icon: Award },
    { label: t('Native Indian Languages', 'भारतीय भाषाएं'), value: 7, suffix: '', icon: Languages },
    { label: t('Accessibility & Inclusion Modes', 'सुलभता और समावेश मोड'), value: 5, suffix: '', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-setu-50/70 via-white to-saffron-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-24">
        {/* Decorative background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-20 top-20 h-80 w-80 rounded-full bg-setu-300/30 blur-3xl dark:bg-setu-800/20"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-20 top-40 h-96 w-96 rounded-full bg-saffron-300/25 blur-3xl dark:bg-saffron-800/15"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Hero Text Content */}
            <div className="text-center lg:col-span-7 lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-setu-200 bg-white/80 px-4 py-2 text-xs sm:text-sm font-semibold text-setu-700 shadow-sm backdrop-blur-md dark:border-setu-800 dark:bg-setu-950/60 dark:text-setu-300"
              >
                <Sparkles className="h-4 w-4 text-saffron-500" />
                {t('Unified AI Citizen Empowerment Platform', 'एआई-संचालित एकीकृत नागरिक सशक्तिकरण मंच')}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-setu-950 dark:text-setu-50 sm:text-5xl lg:text-6xl"
              >
                {t('Government Benefits,', 'सरकारी लाभ,')}
                <br />
                <span className="text-gradient-hero">{t('Simplified by AI.', 'एआई द्वारा सरल बनाए गए।')}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                {t(
                  'Millions of citizens miss out on scheme benefits because rules are hidden in complex legalese. Setu Sahayata bridges citizens directly to government welfare in seconds.',
                  'लाखों नागरिक जटिल नियमों के कारण सरकारी योजनाओं के लाभ से वंचित रह जाते हैं। सेतु सहायता नागरिकों को सीधे सरकारी कल्याणकारी योजनाओं से जोड़ती है।'
                )}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
              >
                <Link href="/discover" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="group h-14 w-full sm:w-auto gap-2.5 rounded-2xl bg-setu-600 px-8 text-base font-semibold shadow-lg shadow-setu-600/30 hover:bg-setu-700 active:scale-95 transition-all"
                  >
                    <Search className="h-5 w-5" />
                    {t('Find Your Schemes', 'अपनी योजनाएं खोजें')}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/de-jargonifier" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group h-14 w-full sm:w-auto gap-2 rounded-2xl border-saffron-300 bg-white/80 px-7 text-base font-semibold text-saffron-700 shadow-sm backdrop-blur-md hover:bg-saffron-50 dark:border-saffron-800 dark:bg-neutral-900 dark:text-saffron-400"
                  >
                    <FileText className="h-5 w-5" />
                    {t('De-Jargonify Document', 'दस्तावेज़ समझें')}
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-muted-foreground font-medium"
              >
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
                  <Lock className="h-3.5 w-3.5" />
                  <span>{t('100% Free & Zero Data Retention', '100% मुफ़्त एवं शून्य डेटा संग्रह')}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-setu-50 px-3 py-1.5 text-setu-700 border border-setu-200 dark:bg-setu-950/40 dark:text-setu-300 dark:border-setu-900">
                  <WifiOff className="h-3.5 w-3.5" />
                  <span>{t('Offline PWA Ready', 'ऑफलाइन PWA तैयार')}</span>
                </div>
              </motion.div>
            </div>

            {/* Right Interactive SVG Bridge Illustration */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative w-full max-w-md rounded-3xl border border-setu-100 bg-gradient-to-br from-white/90 via-setu-50/40 to-saffron-50/50 p-6 shadow-2xl backdrop-blur-xl dark:border-setu-900/60 dark:from-neutral-900 dark:via-setu-950/30 dark:to-neutral-950"
              >
                <div className="flex items-center justify-between border-b border-setu-100 dark:border-neutral-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-xs font-bold text-setu-700 dark:text-setu-300 tracking-wide uppercase">Setu AI Bridge Flow</span>
                </div>

                {/* Animated Bridge Vector Visual */}
                <div className="relative py-6 flex flex-col items-center">
                  <svg className="w-full h-36 overflow-visible" viewBox="0 0 400 120">
                    <defs>
                      <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0F4C5C" />
                        <stop offset="50%" stopColor="#F2994A" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                    {/* Bridge Arc */}
                    <motion.path
                      d="M 40 90 Q 200 10 360 90"
                      fill="none"
                      stroke="url(#bridgeGradient)"
                      strokeWidth="4"
                      strokeDasharray="8 8"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    {/* Pillar Left */}
                    <line x1="40" y1="90" x2="40" y2="110" stroke="#0F4C5C" strokeWidth="4" strokeLinecap="round" />
                    {/* Pillar Right */}
                    <line x1="360" y1="90" x2="360" y2="110" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />

                    {/* Nodes */}
                    <circle cx="40" cy="90" r="16" fill="#0F4C5C" />
                    <circle cx="200" cy="50" r="20" fill="#F2994A" />
                    <circle cx="360" cy="90" r="16" fill="#10B981" />
                  </svg>

                  {/* Node Overlay Icons & Labels */}
                  <div className="w-full flex items-center justify-between text-center mt-2 px-2">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-setu-900 dark:text-setu-100">👨‍👩‍👧 Citizen</span>
                      <span className="text-[10px] text-muted-foreground">Document Upload</span>
                    </div>
                    <div className="flex flex-col items-center bg-saffron-50 dark:bg-saffron-950/60 px-3 py-1 rounded-xl border border-saffron-200 dark:border-saffron-800 shadow-sm">
                      <span className="text-xs font-bold text-saffron-700 dark:text-saffron-300">✨ Setu AI</span>
                      <span className="text-[10px] text-saffron-600 dark:text-saffron-400">Eligibility Engine</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">🏛️ Government</span>
                      <span className="text-[10px] text-muted-foreground">Direct Benefits</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-setu-50/80 dark:bg-setu-950/50 p-3 flex items-center justify-between text-xs font-semibold text-setu-800 dark:text-setu-200">
                  <span>⚡ Instant 100% Transparency</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Verified Direct Govt Source</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat Ticker */}
      <section className="relative border-y border-setu-100 bg-white/60 py-3.5 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="overflow-hidden">
          <div className="flex w-max animate-ticker gap-12">
            {[...statTickerItems, ...statTickerItems].map((item, i) => (
              <div key={i} className="flex items-center gap-2 whitespace-nowrap">
                <Sparkles className="h-4 w-4 text-saffron-500" />
                <span className="text-xs font-semibold text-setu-900 dark:text-setu-200">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Live Stats Section */}
      <section ref={statsRef} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
          {liveStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="card-hover border-setu-100 bg-white/90 p-6 text-center shadow-md dark:border-neutral-800 dark:bg-neutral-900 rounded-2xl">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-setu-50 text-setu-600 dark:bg-setu-950 dark:text-setu-400">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="font-display text-3xl font-extrabold text-setu-950 dark:text-setu-50">
                  {stat.value}{stat.suffix}
                </div>
                <div className="mt-1 text-xs font-medium text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Redesigned 3-Step Process Section with Animated Path */}
      <section ref={featuresRef} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-saffron-600 dark:text-saffron-400">{t('How It Works', 'यह कैसे काम करता है')}</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-setu-950 dark:text-setu-50 mt-1">
            {t('Three Simple Steps to Your Benefits', 'आपके लाभ के तीन आसान चरण')}
          </h2>
          <p className="mt-3 text-muted-foreground text-sm max-w-xl mx-auto">
            {t('Zero legalese, zero manual search. Upload your document and let AI handle the rest.', 'शून्य कागज़ी जटिलता, शून्य मैनुअल खोज। अपना दस्तावेज़ अपलोड करें और एआई को बाकी काम संभालने दें।')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 relative">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <Card className="relative overflow-hidden border-setu-100 bg-white/90 p-8 shadow-lg transition-all hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900 rounded-3xl h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-md`}>
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <span className="font-display text-4xl font-extrabold text-setu-100 dark:text-setu-900/60">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-setu-950 dark:text-setu-50 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-setu-50 dark:border-neutral-800">
                  <Link href={feature.link}>
                    <Button variant="ghost" size="sm" className="w-full justify-between text-setu-700 hover:text-setu-800 dark:text-setu-300 font-semibold p-0">
                      <span>{t('Try Feature', 'फीचर आज़माएं')}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DISTINCT VISUAL SECTION: Before vs After (Setu Sahayata vs Generic Portals) */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-setu-100 bg-gradient-to-br from-white via-setu-50/30 to-saffron-50/20 p-8 sm:p-12 shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950">
          <div className="text-center mb-10">
            <Badge className="bg-saffron-100 text-saffron-800 dark:bg-saffron-950 dark:text-saffron-300 border-none mb-2">
              ⚡ {t('The Setu Advantage', 'सेतु सहायता का अंतर')}
            </Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-setu-950 dark:text-setu-50">
              {t('Why Setu Sahayata beats traditional portals', 'परंपरागत पोर्टलों की तुलना में सेतु सहायता क्यों बेहतर है')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Generic Portals */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 dark:border-rose-950 dark:bg-rose-950/20">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold mb-4">
                <X className="h-5 w-5" />
                <span>{t('Generic Government Portals', 'सामान्य सरकारी पोर्टल')}</span>
              </div>
              <ul className="space-y-3 text-sm text-rose-950/80 dark:text-rose-200">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✗</span>
                  <span>{t('Dense 40-page PDFs full of legal jargon nobody understands', 'घने 40-पृष्ठ वाले पीडीएफ कानूनी भाषा से भरे')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✗</span>
                  <span>{t('Manual searching through 500+ scheme lists one by one', '500+ योजनाओं की सूची में मैनुअल खोज')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✗</span>
                  <span>{t('Zero match score — you guess whether you qualify or fail', 'शून्य मैच स्कोर — आप केवल अनुमान लगाते हैं')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✗</span>
                  <span>{t('Vulnerable to scam agents demanding bribes for approval', 'रिश्वत की मांग करने वाले एजेंटों का शिकार')}</span>
                </li>
              </ul>
            </div>

            {/* Setu Sahayata */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 dark:border-emerald-950 dark:bg-emerald-950/20 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-4">
                <Check className="h-5 w-5" />
                <span>{t('Setu Sahayata (Our Platform)', 'सेतु सहायता (हमारा मंच)')}</span>
              </div>
              <ul className="space-y-3 text-sm text-emerald-950/90 dark:text-emerald-200">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{t('3-bullet AI De-jargonifier summary — "Explain like I\'m 10"', '3-बात में सरल एआई अनुवाद निष्कर्ष')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{t('One document upload triggers instant zero-click discovery', 'एक दस्तावेज़ अपलोड से तुरंत ज़ीरो-क्लिक योजना खोज')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{t('Match % score with transparent passed/failed criteria panel', 'पारदर्शी उत्तीर्ण/अनुत्तीर्ण मानदंडों के साथ मैच %')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{t('Persistent anti-fraud advisory — 100% free citizen protection', 'धोखाधड़ी विरोधी चेतावनी — 100% मुफ़्त नागरिक सुरक्षा')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Competitive Advantage vs MyScheme/UMANG/DigiLocker */}
      <CompetitiveAdvantage />

      {/* Accessibility Selector */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <AccessibilityModeSelector />
      </section>
    </div>
  );
}
