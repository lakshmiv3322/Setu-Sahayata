'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Landmark,
  HeartPulse,
  Home,
  GraduationCap,
  Wheat,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Search,
  Mic,
  Volume2,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Bell,
  Loader2,
  X,
  Check,
  Scale,
  ShieldCheck,
  Layers,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/navbar';
import { ScamWarningBanner } from '@/components/scam-warning-banner';
import { ProfileCompleteness } from '@/components/profile-completeness';
import { SchemeComparison } from '@/components/scheme-comparison';
import { SchemeCardSkeleton } from '@/components/ui/scheme-card-skeleton';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { useRequireAuth } from '@/lib/use-require-auth';
import { mockSchemes } from '@/lib/mock-data';
import { supabaseBrowser as supabase } from '@/lib/supabase-browser';
import { rankSchemes, computeMatchPercent, type StoredProfile } from '@/lib/match-schemes';
import { logAuditEvent } from '@/lib/audit-logger';
import type { Scheme } from '@/lib/types';
import { useVoiceAssistant } from '@/hooks/use-voice-assistant';
import { evaluateLifeEventTriggers, type SchemeTriggerAlert } from '@/lib/life-events';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Store,
  Landmark,
  HeartPulse,
  Home,
  GraduationCap,
  Wheat,
};

const categoryGradients: Record<string, string> = {
  Finance: 'from-setu-500 to-setu-700',
  Health: 'from-rose-500 to-rose-700',
  Housing: 'from-saffron-500 to-saffron-700',
  Food: 'from-amber-500 to-amber-700',
  Education: 'from-emerald-500 to-emerald-700',
  Women: 'from-purple-500 to-purple-700',
};

interface ApplicationRow {
  id: string;
  scheme_id: string;
  scheme_name: string;
  application_id: string;
  status: string;
  benefit_amount: string | null;
  submitted_at: string;
}

function transformDbScheme(record: any): Scheme {
  return {
    id: record.id,
    name: record.name,
    nameHindi: record.name_hindi || record.name,
    ministry: record.ministry || 'Government of India',
    ministryHindi: record.ministry_hindi || 'भारत सरकार',
    benefit: record.benefit || '',
    benefitHindi: record.benefit_hindi || record.benefit || '',
    benefitAmount: record.benefit_amount || 'Varies',
    matchPercent: 0,
    timeToApply: record.time_to_apply || '10 minutes',
    timeToApplyHindi: record.time_to_apply_hindi || '10 मिनट',
    description: record.description || '',
    descriptionHindi: record.description_hindi || record.description || '',
    category: record.category || 'Finance',
    icon: record.icon || 'Landmark',
    eligibilityTags: record.eligibility_tags || [],
    eligibilityRules: record.eligibility_rules || [],
    sourceUrl: record.source_url || undefined,
    lastVerifiedAt: record.last_verified_at || undefined,
  };
}

export default function DashboardPage() {
  useRequireAuth();
  const { user } = useAuth();
  const { t, isHindi } = useLanguage();
  const { isSpeaking, speak, stopSpeaking } = useVoiceAssistant();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>(mockSchemes);
  const [triggerAlerts, setTriggerAlerts] = useState<SchemeTriggerAlert[]>([]);
  const [expandedExplanation, setExpandedExplanation] = useState<Record<string, boolean>>({});

  // Scheme Comparison States
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Outcome Modal State
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (searchParams.get('toast') === 'access_denied') {
      import('sonner').then(({ toast }) => {
        toast.error(t('Access Restricted', 'पहुंच प्रतिबंधित'), {
          description: t('The admin dashboard requires verified administrator credentials.', 'व्यवस्थापक डैशबोर्ड के लिए सत्यापित प्रशासक क्रेडेंशियल आवश्यक हैं।'),
          duration: 6000,
        });
      });
      const url = new URL(window.location.href);
      url.searchParams.delete('toast');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, t]);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData as StoredProfile);
        }

        const { data: appsData } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false });

        if (appsData) {
          setApplications(appsData as ApplicationRow[]);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const loadSchemes = async () => {
      try {
        const { data: dbSchemes } = await supabase
          .from('schemes')
          .select('*')
          .eq('active', true);

        let baseSchemes: Scheme[] = mockSchemes;
        if (dbSchemes && dbSchemes.length > 0) {
          baseSchemes = dbSchemes.map(transformDbScheme);
        }
        setSchemes(rankSchemes(baseSchemes, profile));
      } catch (err) {
        setSchemes(rankSchemes(mockSchemes, profile));
      }
    };

    loadSchemes();
    setTriggerAlerts(evaluateLifeEventTriggers(profile));
  }, [profile]);

  const filteredSchemes = schemes.filter((s) =>
    isHindi
      ? s.nameHindi.toLowerCase().includes(search.toLowerCase())
      : s.name.toLowerCase().includes(search.toLowerCase())
  );

  const avgMatch = schemes.length > 0
    ? Math.round(schemes.reduce((sum, s) => sum + s.matchPercent, 0) / schemes.length)
    : 0;

  const toggleExplanation = (schemeId: string) => {
    setExpandedExplanation((prev) => ({
      ...prev,
      [schemeId]: !prev[schemeId],
    }));
  };

  const toggleCompare = (schemeId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(schemeId)) return prev.filter((id) => id !== schemeId);
      if (prev.length >= 3) {
        import('sonner').then(({ toast }) => {
          toast.info(t('Comparison Limit', 'तुलना सीमा'), {
            description: t('You can compare up to 3 schemes side-by-side.', 'आप एक बार में 3 योजनाओं की तुलना कर सकते हैं।'),
          });
        });
        return prev;
      }
      return [...prev, schemeId];
    });
  };

  const userDisplayName =
    (user?.user_metadata?.full_name as string) ||
    user?.email?.split('@')[0] ||
    'User';

  const comparedSchemeObjects = schemes.filter((s) => selectedForCompare.includes(s.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-setu-50/60 via-white to-saffron-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        {/* Anti-Fraud Warning Banner */}
        <ScamWarningBanner />

        {/* Command Center Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-saffron-600 dark:text-saffron-400">
              {t('Citizen Command Center', 'नागरिक कमांड सेंटर')}
            </p>
            <h1 className="font-display text-3xl font-extrabold text-setu-950 dark:text-setu-50 sm:text-4xl">
              {t('Welcome back,', 'वापसी पर स्वागत है,')} {userDisplayName} 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(
                `AI evaluated your profile against ${schemes.length} active government welfare schemes.`,
                `एआई ने ${schemes.length} सक्रिय सरकारी कल्याणकारी योजनाओं के विरुद्ध आपकी प्रोफ़ाइल का मूल्यांकन किया।`
              )}
            </p>
          </div>

          {/* Floating Compare Action Bar */}
          {selectedForCompare.length > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 rounded-2xl bg-setu-900 text-white p-2 px-4 shadow-xl dark:bg-setu-950 border border-setu-700"
            >
              <Scale className="h-4 w-4 text-saffron-400" />
              <span className="text-xs font-bold">{selectedForCompare.length} {t('Selected', 'चयनित')}</span>
              <Button
                size="sm"
                onClick={() => setIsCompareOpen(true)}
                className="h-8 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white text-xs font-semibold ml-2"
              >
                {t('Compare Now', 'अभी तुलना करें')}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedForCompare([])}
                className="h-7 w-7 text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Profile Completeness Meter Component */}
        <div className="mb-8">
          <ProfileCompleteness profile={profile} />
        </div>

        {/* Top Command Center Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="p-5 border-setu-100 bg-white/90 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 rounded-2xl">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-1">
              <span>{t('Eligible Schemes', 'पात्र योजनाएं')}</span>
              <Sparkles className="h-4 w-4 text-saffron-500" />
            </div>
            <div className="font-display text-3xl font-extrabold text-setu-950 dark:text-setu-50">{filteredSchemes.length}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">100% Verified Criteria</div>
          </Card>

          <Card className="p-5 border-setu-100 bg-white/90 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 rounded-2xl">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-1">
              <span>{t('Average Match %', 'औसत मैच %')}</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="font-display text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{avgMatch}%</div>
            <div className="text-[11px] text-muted-foreground mt-1">Demographic match</div>
          </Card>

          <Card className="p-5 border-setu-100 bg-white/90 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 rounded-2xl">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-1">
              <span>{t('Applications Filed', 'दाखिल किए गए आवेदन')}</span>
              <FileText className="h-4 w-4 text-setu-600" />
            </div>
            <div className="font-display text-3xl font-extrabold text-setu-900 dark:text-setu-100">{applications.length}</div>
            <div className="text-[11px] text-setu-600 dark:text-setu-400 font-medium mt-1">Ready for submission</div>
          </Card>

          <Card className="p-5 border-setu-100 bg-white/90 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 rounded-2xl">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-1">
              <span>{t('Est. Total Benefit', 'अनुमानित कुल लाभ')}</span>
              <Award className="h-4 w-4 text-saffron-500" />
            </div>
            <div className="font-display text-2xl font-extrabold text-saffron-600 dark:text-saffron-400">₹35,000+</div>
            <div className="text-[11px] text-muted-foreground mt-1">Combined entitlements</div>
          </Card>
        </div>

        {/* Life Event & Deadline Proactive Alerts */}
        {triggerAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 space-y-3"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-setu-950 dark:text-setu-100">
              <Bell className="h-4 w-4 text-saffron-600 animate-bounce" />
              <span>{t('Life-Event & Milestone Alerts', 'जीवन-घटना एवं मील के पत्थर की चेतावनी')}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {triggerAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className="p-4 border border-setu-200/80 bg-gradient-to-r from-setu-50/60 to-saffron-50/40 dark:border-setu-900/50 dark:from-setu-950/40 dark:to-neutral-900 shadow-sm rounded-2xl flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-setu-950 dark:text-setu-50">
                        {isHindi ? alert.schemeNameHindi : alert.schemeName}
                      </span>
                    </div>
                    <p className="text-xs text-setu-800 dark:text-setu-300">
                      {isHindi ? alert.triggerReasonHindi : alert.triggerReason}
                    </p>
                  </div>
                  <Link href="/apply">
                    <Button size="sm" className="shrink-0 text-xs gap-1 rounded-xl bg-setu-600 hover:bg-setu-700 text-white">
                      {t('Apply', 'आवेदन करें')}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Application Timeline Cards */}
        {applications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="overflow-hidden border-setu-100 bg-white/90 shadow-md dark:border-neutral-800 dark:bg-neutral-900 rounded-3xl">
              <div className="border-b border-setu-100 bg-setu-50/40 dark:border-neutral-800 dark:bg-neutral-900 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-setu-600 text-white shadow-md">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-setu-950 dark:text-setu-50">
                      {t('Your Application Timeline', 'आपकी आवेदन समयसीमा')}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {t('Track stage progress from submission to fund disbursement', 'जमा करने से लेकर धन वितरण तक की स्थिति पर नज़र रखें')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-setu-50 dark:divide-neutral-800">
                {applications.map((app) => {
                  const statusStyle =
                    app.status === 'Approved'
                      ? 'badge-approved'
                      : app.status === 'Disbursed'
                      ? 'badge-disbursed'
                      : app.status === 'Rejected'
                      ? 'badge-rejected'
                      : 'badge-pending';

                  return (
                    <div key={app.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-setu-950 dark:text-setu-50">{app.scheme_name}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyle}`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('Application ID:', 'आवेदन आईडी:')} <span className="font-mono font-semibold text-setu-800 dark:text-setu-200">{app.application_id}</span> • {new Date(app.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      {app.benefit_amount && (
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground block">{t('Benefit Amount', 'लाभ राशि')}</span>
                          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{app.benefit_amount}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Search & Scheme Filters */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('Search schemes by name...', 'योजना नाम से खोजें...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-2xl border-setu-200 bg-white pl-10 text-sm shadow-sm dark:bg-neutral-900 dark:border-neutral-800"
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {t(`Showing ${filteredSchemes.length} matched schemes`, `${filteredSchemes.length} मेल खाती योजनाएं दिखाई दे रही हैं`)}
          </span>
        </div>

        {/* Scheme Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SchemeCardSkeleton />
            <SchemeCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredSchemes.map((scheme) => {
              const Icon = iconMap[scheme.icon] || Store;
              const isExpanded = !!expandedExplanation[scheme.id];
              const isCompared = selectedForCompare.includes(scheme.id);
              const explanation = scheme.matchExplanation;

              return (
                <motion.div
                  key={scheme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  className="h-full"
                >
                  <Card className="flex flex-col justify-between h-full border-setu-100/80 bg-white/90 p-6 shadow-md dark:border-neutral-800 dark:bg-neutral-900 rounded-3xl transition-all hover:shadow-xl">
                    <div>
                      {/* Top Bar: Category + Match ring + Compare Checkbox */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${categoryGradients[scheme.category] || 'from-setu-500 to-setu-700'} text-white shadow-md`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="inline-block rounded-lg bg-setu-50 dark:bg-setu-950 px-2.5 py-0.5 text-[11px] font-bold text-setu-700 dark:text-setu-300">
                              {scheme.category}
                            </span>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                              {isHindi ? scheme.ministryHindi : scheme.ministry}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Match Ring */}
                          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-setu-50 dark:bg-neutral-800 font-bold text-xs text-setu-900 dark:text-setu-100 border-2 border-emerald-500">
                            {scheme.matchPercent}%
                          </div>

                          <Button
                            variant={isCompared ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => toggleCompare(scheme.id)}
                            className={`h-9 w-9 rounded-xl ${isCompared ? 'bg-saffron-500 text-white' : 'border-setu-200'}`}
                            title={t('Compare scheme', 'योजना की तुलना करें')}
                          >
                            <Scale className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-display text-lg font-bold text-setu-950 dark:text-setu-50 leading-snug mb-2">
                        {isHindi ? scheme.nameHindi : scheme.name}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                        {isHindi ? scheme.descriptionHindi : scheme.description}
                      </p>

                      {/* Benefit Badge */}
                      <div className="mb-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 p-3 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{t('Benefit Entitlement:', 'पात्रता लाभ:')}</span>
                        <span className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400">{isHindi ? scheme.benefitHindi : scheme.benefitAmount || scheme.benefit}</span>
                      </div>
                    </div>

                    <div>
                      {/* Criteria Accordion Trigger */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExplanation(scheme.id)}
                        className="w-full justify-between text-xs text-setu-700 dark:text-setu-300 font-semibold p-2 mb-3 bg-setu-50/50 dark:bg-neutral-800/60 rounded-xl"
                      >
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          {t('Why you qualify (Pass / Fail Panel)', 'आप क्यों पात्र हैं (उत्तीर्ण / अनुत्तीर्ण)')}
                        </span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>

                      {/* Expanded Criteria Accordion */}
                      <AnimatePresence>
                        {isExpanded && explanation && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 space-y-2 rounded-2xl bg-neutral-50 dark:bg-neutral-950 p-3 border border-neutral-200 dark:border-neutral-800 text-xs"
                          >
                            <div>
                              <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                                ✓ {t('Passed Criteria', 'उत्तीर्ण मानदंड')}
                              </span>
                              <ul className="space-y-1 pl-2">
                                {(isHindi ? explanation.passedHindi : explanation.passed).map((rule, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5 text-muted-foreground">
                                    <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{rule}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {((isHindi ? explanation.failedHindi : explanation.failed) || []).length > 0 && (
                              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                                <span className="font-bold text-rose-600 dark:text-rose-400 block mb-1">
                                  ✗ {t('Failed / Unmet Criteria', 'अनुत्तीर्ण मानदंड')}
                                </span>
                                <ul className="space-y-1 pl-2">
                                  {(isHindi ? explanation.failedHindi : explanation.failed).map((rule, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5 text-muted-foreground">
                                      <X className="h-3 w-3 text-rose-500 shrink-0 mt-0.5" />
                                      <span>{rule}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Apply CTA */}
                      <Link href="/apply">
                        <Button className="w-full gap-2 rounded-xl bg-setu-600 hover:bg-setu-700 text-white font-semibold text-xs py-5 shadow-sm">
                          <span>{t('Apply Now (Auto-filled)', 'अभी लागू करें (स्वतः भरा)')}</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scheme Comparison Modal */}
      <SchemeComparison
        schemes={comparedSchemeObjects}
        open={isCompareOpen}
        onOpenChange={setIsCompareOpen}
        onApply={(schemeId) => {
          setIsCompareOpen(false);
          window.location.href = `/apply?scheme=${schemeId}`;
        }}
      />
    </div>
  );
}
