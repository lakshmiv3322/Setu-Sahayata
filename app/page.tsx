'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';
import { AccessibilityModeSelector } from '@/components/accessibility-mode-selector';
import { CompetitiveAdvantage } from '@/components/competitive-advantage';
import { useLanguage } from '@/lib/language-context';
import { statTickerItems } from '@/lib/mock-data';

export default function LandingPage() {
  const { t } = useLanguage();
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const isInView = useInView(featuresRef, { once: true, margin: '-100px' });

  const features = [
    {
      icon: Search,
      title: t('Zero-Click Scheme Discovery', 'ज़ीरो-क्लिक योजना खोज'),
      desc: t(
        'Upload your Aadhaar or Ration Card and our AI instantly finds every welfare scheme you qualify for — no forms to fill.',
        'अपना आधार या राशन कार्ड अपलोड करें और हमारी एआई तुरंत हर वे कल्याण योजना खोज लेगी जिसके आप पात्र हैं — कोई फॉर्म भरने की ज़रूरत नहीं।'
      ),
      link: '/discover',
      gradient: 'from-trust-500 to-trust-700',
    },
    {
      icon: FileText,
      title: t('AI De-Jargonifier', 'एआई द-जैगनिफायर'),
      desc: t(
        'Dense government legalese translated into 3 simple bullets — "explain like I\'m 10." Understand any document in seconds.',
        'घने सरकारी दस्तावेज़ों को 3 सरल बातों में अनुवादित — "10 साल के बच्चे को समझाएं जैसे।" किसी भी दस्तावेज़ को सेकंडों में समझें।'
      ),
      link: '/de-jargonifier',
      gradient: 'from-saffron-500 to-saffron-700',
    },
    {
      icon: ClipboardCheck,
      title: t('Auto-Fill Applications', 'ऑटो-फिल आवेदन'),
      desc: t(
        '90% of your application is pre-filled from your documents. Just review, verify, and submit with one click.',
        'आपके आवेदन का 90% आपके दस्तावेज़ों से पहले से भरा हुआ। बस समीक्षा करें, सत्यापित करें, और एक क्लिक से जमा करें।'
      ),
      link: '/apply',
      gradient: 'from-emerald-500 to-emerald-700',
    },
  ];

  const stats = [
    { icon: Users, value: t('For Every Citizen', 'हर नागरिक के लिए'), label: t('Designed for all communities', 'सभी समुदायों के लिए डिज़ाइन किया गया') },
    { icon: Building2, value: t('Real Schemes', 'वास्तविक योजनाएं'), label: t('Genuine government programs', 'वास्तविक सरकारी कार्यक्रम') },
    { icon: TrendingUp, value: t('Free to Use', 'उपयोग करने के लिए मुफ़्त'), label: t('No fees, no hidden charges', 'कोई शुल्क नहीं, कोई छिपा हुआ शुल्क नहीं') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-50 via-white to-saffron-50/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-trust-200/40 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-saffron-200/30 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-1/2 top-60 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl"
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-trust-200 bg-white/80 px-4 py-2 text-sm font-medium text-trust-700 shadow-sm backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-saffron-500" />
            {t('AI-Powered Citizen Empowerment Portal', 'एआई-संचालित नागरिक सशक्तिकरण पोर्टल')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-balance text-5xl font-bold leading-[1.1] tracking-tight text-trust-900 sm:text-6xl lg:text-7xl"
          >
            {t('Government Benefits,', 'सरकारी लाभ,')}
            <br />
            <span className="text-gradient-hero">{t('Simplified.', 'सरल बनाए।')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl"
          >
            {t(
              'Millions of citizens miss out on benefits they deserve — because the paperwork is too confusing. We fix that with AI.',
              'लाखों नागरिक उन लाभों से वंचित रह जाते हैं जिनके वे हकदार हैं — क्योंकि कागज़ी कार्रवाई बहुत जटिल है। हम इसे एआई से ठीक करते हैं।'
            )}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/discover">
              <Button
                size="lg"
                className="group h-14 gap-2 rounded-2xl bg-trust-600 px-8 text-base shadow-xl shadow-trust-500/30 hover:bg-trust-700 hover:shadow-trust-500/40"
              >
                <Search className="h-5 w-5" />
                {t('Discover My Eligibility', 'मेरी पात्रता खोजें')}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/de-jargonifier">
              <Button
                size="lg"
                variant="outline"
                className="group h-14 gap-2 rounded-2xl border-saffron-300 bg-white/80 px-8 text-base text-saffron-700 shadow-lg backdrop-blur-sm hover:bg-saffron-50 hover:text-saffron-800"
              >
                <FileText className="h-5 w-5" />
                {t('Explain a Document', 'दस्तावेज़ समझाएं')}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 border border-emerald-200">
              <Lock className="h-4 w-4" />
              {t(
                'Your documents are processed securely and never stored without consent',
                'आपके दस्तावेज़ सुरक्षित रूप से संसाधित होते हैं और बिना सहमति के कभी संग्रहीत नहीं होते'
              )}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-trust-50 px-4 py-2 text-sm font-medium text-trust-700 border border-trust-200">
              <WifiOff className="h-4 w-4" />
              {t('Works offline-friendly, low-data mode', 'ऑफलाइन-अनुकूल, कम-डेटा मोड में काम करता है')}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stat Ticker */}
      <section className="relative border-y border-trust-100 bg-white/60 py-4 backdrop-blur-sm">
        <div className="overflow-hidden">
          <div className="flex w-max animate-ticker gap-12">
            {[...statTickerItems, ...statTickerItems].map((item, i) => (
              <div key={i} className="flex items-center gap-2 whitespace-nowrap">
                <Sparkles className="h-4 w-4 text-saffron-500" />
                <span className="text-sm font-semibold text-trust-800">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="group relative overflow-hidden border-trust-100 bg-white/80 p-8 text-center shadow-lg transition-all hover:shadow-xl hover:shadow-trust-500/10">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-trust-50 to-trust-100 text-trust-600 transition-transform group-hover:scale-110">
                  <stat.icon className="h-7 w-7" />
                </div>
                <div className="text-lg font-bold text-trust-900">{stat.value}</div>
                <div className="mt-2 text-sm font-medium text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flagship Competitive Advantage vs MyScheme/UMANG/DigiLocker */}
      <CompetitiveAdvantage />

      {/* Features */}
      <section ref={featuresRef} className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-trust-900 sm:text-4xl">
            {t('Three problems. One solution.', 'तीन समस्याएं। एक समाधान।')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t(
              'Every feature here solves a real pain citizens face with government services today.',
              'यहाँ हर फीचर आज नागरिकों द्वारा सरकारी सेवाओं के साथ एक वास्तविक समस्या का समाधान करता है।'
            )}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <Link href={feature.link}>
                <Card className="group relative h-full cursor-pointer overflow-hidden border-trust-100 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-trust-500/15">
                  <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-trust-900">{feature.title}</h3>
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                  <div className="flex items-center gap-1 text-sm font-semibold text-trust-600 transition-transform group-hover:gap-2">
                    {t('Try it now', 'अभी आज़माएं')}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-10 ${feature.gradient}" />
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-trust-900 sm:text-4xl">
            {t('How it works', 'यह कैसे काम करता है')}
          </h2>
        </motion.div>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-trust-200 via-saffron-200 to-emerald-200 md:block" />

          {[
            { step: '01', title: t('Upload or Answer', 'अपलोड करें या उत्तर दें'), desc: t('Drop your Aadhaar or answer 3 quick questions. No document? No problem.', 'अपना आधार डालें या 3 सरल प्रश्नों के उत्तर दें। दस्तावेज़ नहीं है? कोई बात नहीं।'), color: 'from-trust-500 to-trust-700' },
            { step: '02', title: t('AI Matches & Explains', 'एआई मिलाता है और समझाता है'), desc: t('We match you to eligible schemes and decode every document into plain language.', 'हम आपको पात्र योजनाओं से मिलाते हैं और हर दस्तावेज़ को सरल भाषा में समझाते हैं।'), color: 'from-saffron-500 to-saffron-700' },
            { step: '03', title: t('Apply with One Click', 'एक क्लिक से आवेदन'), desc: t('90% of your form is auto-filled. Review, submit, and track — all in one place.', 'आपका 90% फॉर्म स्वतः भरा जाता है। समीक्षा करें, जमा करें, और ट्रैक करें — सब एक जगह।'), color: 'from-emerald-500 to-emerald-700' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="relative text-center"
            >
              <div className={`relative z-10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-2xl font-bold text-white shadow-lg`}>
                {item.step}
              </div>
              <h3 className="mb-2 text-lg font-bold text-trust-900">{item.title}</h3>
              <p className="mx-auto max-w-xs text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Accessibility & Language */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="overflow-hidden border-trust-100 bg-gradient-to-br from-trust-50 to-white p-10 shadow-lg">
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-2xl font-bold text-trust-900">
                  {t('Built for every citizen', 'हर नागरिक के लिए बनाया गया')}
                </h2>
                <p className="mb-6 text-muted-foreground">
                  {t(
                    'From low-literacy users to rural communities — we designed this for the people most intimidated by government paperwork.',
                    'कम साक्षरता वाले उपयोगकर्ताओं से लेकर ग्रामीण समुदायों तक — हमने इसे उन लोगों के लिए बनाया जो सरकारी कागज़ी कार्रवाई से सबसे अधिक डरते हैं।'
                  )}
                </p>
                <div className="space-y-3">
                  {[
                    { icon: Languages, text: t('Hindi & English toggle on every screen', 'हर स्क्रीन पर हिंदी और अंग्रेज़ी टॉगल') },
                    { icon: Mic, text: t('Voice narration for low-literacy users', 'कम साक्षरता वाले उपयोगकर्ताओं के लिए वॉइस नैरेशन') },
                    { icon: WifiOff, text: t('Low-data mode for rural bandwidth', 'ग्रामीण बैंडविड्थ के लिए कम-डेटा मोड') },
                    { icon: ShieldCheck, text: t('Privacy-first: nothing stored without consent', 'गोपनीयता-प्रथम: बिना सहमति के कुछ संग्रहीत नहीं') },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-trust-600 shadow-sm">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium text-trust-800">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <div className="flex h-48 w-48 items-center justify-center rounded-3xl bg-gradient-to-br from-trust-500 via-trust-600 to-trust-800 shadow-2xl shadow-trust-500/30">
                    <div className="text-center text-white">
                      <CheckCircle2 className="mx-auto mb-2 h-12 w-12" strokeWidth={1.5} />
                      <div className="text-2xl font-bold">100%</div>
                      <div className="text-sm opacity-90">{t('Citizen-First', 'नागरिक-प्रथम')}</div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ y: [0, 10, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -bottom-6 -right-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-saffron-400 to-saffron-600 shadow-xl"
                  >
                    <Sparkles className="h-10 w-10 text-white" />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-trust-700 via-trust-800 to-trust-900 p-12 text-center shadow-2xl"
        >
          <div className="pointer-events-none absolute inset-0 bg-hero-pattern opacity-30" />
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              {t('Ready to find your benefits?', 'अपने लाभ खोजने के लिए तैयार?')}
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-trust-100">
              {t(
                'It takes 30 seconds. No login, no fees, no jargon.',
                'इसमें 30 सेकंड लगते हैं। कोई लॉगिन नहीं, कोई शुल्क नहीं, कोई जटिल भाषा नहीं।'
              )}
            </p>
            <Link href="/discover">
              <Button
                size="lg"
                className="group h-14 gap-2 rounded-2xl bg-white px-8 text-base text-trust-700 shadow-xl hover:bg-saffron-50"
              >
                <Search className="h-5 w-5" />
                {t('Start Now — It\'s Free', 'अभी शुरू करें — यह मुफ़्त है')}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-trust-100 bg-white/60 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-trust-500 to-trust-700">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-trust-900">{t('Setu Sahayata', 'सेतु सहायता')}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t(
              'A citizen empowerment prototype — built for hackathon demonstration.',
              'एक नागरिक सशक्तिकरण प्रोटोटाइप — हैकाथन प्रदर्शन के लिए बनाया गया।'
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}
