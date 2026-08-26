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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/navbar';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { useRequireAuth } from '@/lib/use-require-auth';
import { mockSchemes, mockAssistanceCenters } from '@/lib/mock-data';
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

const categoryColors: Record<string, string> = {
  Finance: 'from-trust-500 to-trust-700',
  Health: 'from-rose-500 to-rose-700',
  Housing: 'from-saffron-500 to-saffron-700',
  Food: 'from-amber-500 to-amber-700',
  Education: 'from-emerald-500 to-emerald-700',
  Women: 'from-pink-500 to-purple-600',
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

  // Show access-denied toast when redirected from /admin by middleware
  useEffect(() => {
    if (searchParams.get('toast') === 'access_denied') {
      // Use the sonner toast — it's already wired in layout.tsx
      import('sonner').then(({ toast }) => {
        toast.error(
          t('Access Restricted', 'पहुंच प्रतिबंधित'),
          {
            description: t(
              'The admin dashboard requires verified administrator credentials.',
              'व्यवस्थापक डैशबोर्ड के लिए सत्यापित प्रशासक क्रेडेंशियल आवश्यक हैं।'
            ),
            duration: 6000,
          }
        );
      });
      // Clean the query param from the URL without a full navigation
      const url = new URL(window.location.href);
      url.searchParams.delete('toast');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, t]);

  const [search, setSearch] = useState('');
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>(mockSchemes);
  const [triggerAlerts, setTriggerAlerts] = useState<SchemeTriggerAlert[]>([]);
  const [expandedExplanation, setExpandedExplanation] = useState<Record<string, boolean>>({});
  const [appealData, setAppealData] = useState<Record<string, {
    explanation?: string;
    explanationHindi?: string;
    appealLetter?: string;
    appealLetterHindi?: string;
    cpgramsUrl?: string;
    loading?: boolean;
    error?: string;
  }>>({});

  // Outcome Modal & Community Signal States
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [outcomes, setOutcomes] = useState<Record<string, { success: number; rejected: number; pending: number }>>({});

  const fetchOutcomes = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('application_outcomes')
        .select('scheme_id, outcome');

      if (data) {
        const counts: Record<string, { success: number; rejected: number; pending: number }> = {};
        for (const row of data) {
          if (!counts[row.scheme_id]) {
            counts[row.scheme_id] = { success: 0, rejected: 0, pending: 0 };
          }
          if (row.outcome === 'Success') counts[row.scheme_id].success++;
          else if (row.outcome === 'Rejected') counts[row.scheme_id].rejected++;
          else if (row.outcome === 'Pending') counts[row.scheme_id].pending++;
        }
        setOutcomes(counts);
      }
    } catch (err) {
      console.error('Error fetching outcomes:', err);
    }
  }, []);

  const handleOpenOutcomeModal = (appId: string, schemeId: string) => {
    setSelectedAppId(appId);
    setSelectedSchemeId(schemeId);
    setIsOutcomeModalOpen(true);
  };

  const handleReportOutcome = async (outcome: 'Success' | 'Rejected' | 'Pending') => {
    if (!selectedAppId || !selectedSchemeId || !user) return;
    setUpdatingStatus(true);
    try {
      const statusText = outcome === 'Success' ? 'Approved' : outcome === 'Rejected' ? 'Rejected' : 'Pending';
      const { error: appErr } = await supabase
        .from('applications')
        .update({ status: statusText })
        .eq('id', selectedAppId);

      if (appErr) throw appErr;

      const { error: outErr } = await supabase
        .from('application_outcomes')
        .insert({
          scheme_id: selectedSchemeId,
          outcome: outcome
        });

      if (outErr) throw outErr;

      await logAuditEvent('APPLICATION_OUTCOME_REPORTED', {
        scheme_id: selectedSchemeId,
        outcome: outcome
      });

      const { data: appsData } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (appsData) {
        setApplications(appsData as ApplicationRow[]);
      }

      await fetchOutcomes();
      setIsOutcomeModalOpen(false);
      setSelectedAppId(null);
      setSelectedSchemeId(null);
    } catch (err) {
      console.error('Error reporting outcome:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRequestAppeal = async (schemeId: string, schemeName: string, failedCriteria: string[]) => {
    setAppealData((prev) => ({ ...prev, [schemeId]: { ...prev[schemeId], loading: true, error: undefined } }));
    try {
      const res = await fetch('/api/appeal-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schemeId, schemeName, failedCriteria }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAppealData((prev) => ({
          ...prev,
          [schemeId]: { loading: false, error: data.error || 'Failed to generate appeal guidance.' },
        }));
        return;
      }
      setAppealData((prev) => ({ ...prev, [schemeId]: { ...data, loading: false } }));
    } catch {
      setAppealData((prev) => ({
        ...prev,
        [schemeId]: { loading: false, error: 'Network error generating appeal guidance.' },
      }));
    }
  };

  const userDisplayName =
    (user?.user_metadata?.full_name as string) ||
    user?.email?.split('@')[0] ||
    'User';

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
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
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const loadSchemes = async () => {
      try {
        console.log('[Server/Client Render Branch] Querying schemes from Supabase database...');
        const { data: dbSchemes } = await supabase
          .from('schemes')
          .select('*')
          .eq('active', true);

        let baseSchemes: Scheme[] = mockSchemes;
        if (dbSchemes && dbSchemes.length > 0) {
          console.log('[Server/Client Render Branch] Database schemes successfully loaded: count =', dbSchemes.length);
          baseSchemes = dbSchemes.map(transformDbScheme);
        } else {
          console.log('[Server/Client Render Branch] No schemes returned from database, using mockSchemes fallback.');
        }
        setSchemes(rankSchemes(baseSchemes, profile));
      } catch (err: any) {
        console.error('[Server/Client Render Branch] Error loading schemes from database, using mockSchemes fallback:', err?.message || err);
        setSchemes(rankSchemes(mockSchemes, profile));
      }
    };

    loadSchemes();
    fetchOutcomes();
    setTriggerAlerts(evaluateLifeEventTriggers(profile));
  }, [profile, fetchOutcomes]);

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

  const handleListen = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    const topSchemes = filteredSchemes.slice(0, 5);
    if (topSchemes.length === 0) return;

    const text = isHindi
      ? topSchemes
          .map((s) => `${s.nameHindi}। ${s.benefitHindi}। मिलान ${s.matchPercent} प्रतिशत।`)
          .join(' ')
      : topSchemes
          .map((s) => `${s.name}. ${s.benefit}. Match ${s.matchPercent} percent.`)
          .join(' ');

    speak(text);
  }, [filteredSchemes, isHindi, isSpeaking, speak, stopSpeaking]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-50 via-white to-saffron-50/20">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t('Welcome back,', 'वापसी पर स्वागत है,')}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-trust-900 sm:text-4xl">
              {userDisplayName} 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(
                `We found ${filteredSchemes.length} welfare schemes you may qualify for.`,
                `हमें ${filteredSchemes.length} कल्याण योजनाएं मिलीं जिनके आप पात्र हो सकते हैं।`
              )}
            </p>
          </div>

          {/* Voice narration button */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`gap-1.5 ${isSpeaking ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : ''}`}
              onClick={handleListen}
              title={t('Read schemes aloud', 'योजनाएं पढ़कर सुनाएं')}
            >
              <Mic className={`h-4 w-4 ${isSpeaking ? 'animate-pulse text-emerald-600' : ''}`} />
              {isSpeaking ? t('Stop', 'रोकें') : t('Listen', 'सुनें')}
            </Button>
          </div>
        </motion.div>

        {/* Life Event & Deadline Proactive Alerts Banner */}
        {triggerAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 space-y-3"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-trust-900">
              <Bell className="h-4 w-4 text-saffron-600 animate-bounce" />
              <span>{t('Personalized Milestone Alerts', 'व्यक्तिगत मील के पत्थर की चेतावनी')}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {triggerAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`p-4 border shadow-sm transition-all hover:shadow-md flex items-start justify-between gap-3 ${
                    alert.badgeColor === 'emerald'
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : alert.badgeColor === 'amber'
                      ? 'border-amber-200 bg-amber-50/50'
                      : alert.badgeColor === 'rose'
                      ? 'border-rose-200 bg-rose-50/50'
                      : 'border-trust-200 bg-trust-50/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-trust-900">
                        {isHindi ? alert.schemeNameHindi : alert.schemeName}
                      </span>
                    </div>
                    <p className="text-xs text-trust-800">
                      {isHindi ? alert.triggerReasonHindi : alert.triggerReason}
                    </p>
                  </div>
                  <Link href="/apply">
                    <Button size="sm" variant="outline" className="shrink-0 text-xs gap-1 border-trust-300">
                      {t('Apply', 'आवेदन करें')}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Top section: Eligibility Ring + Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Eligibility Ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="flex h-full flex-col items-center justify-center border-trust-100 bg-white p-8 shadow-lg">
              <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
                {t('Your Eligibility Match', 'आपकी पात्रता मिलान')}
              </h3>
              <EligibilityRing percent={avgMatch} />
              <p className="mt-4 text-center text-sm text-muted-foreground">
                {t(
                  'Average match across all discovered schemes',
                  'सभी खोजी गई योजनाओं में औसत मिलान'
                )}
              </p>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="grid h-full grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { icon: Sparkles, value: String(filteredSchemes.length), label: t('Schemes Found', 'योजनाएं मिलीं'), color: 'text-trust-600', bg: 'bg-trust-50' },
                { icon: TrendingUp, value: `${avgMatch}%`, label: t('Avg Match', 'औसत मिलान'), color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { icon: CheckCircle2, value: `${schemes[0]?.matchPercent ?? 0}%`, label: t('Top Match', 'शीर्ष मिलान'), color: 'text-saffron-600', bg: 'bg-saffron-50' },
                { icon: FileText, value: String(applications.length), label: t('Applications', 'आवेदन'), color: 'text-trust-600', bg: 'bg-trust-50' },
                { icon: Store, value: String(filteredSchemes.filter((s) => s.category === 'Finance').length), label: t('Business Schemes', 'व्यापार योजनाएं'), color: 'text-trust-600', bg: 'bg-trust-50' },
                { icon: HeartPulse, value: String(filteredSchemes.filter((s) => s.category === 'Health').length), label: t('Health Schemes', 'स्वास्थ्य योजनाएं'), color: 'text-rose-600', bg: 'bg-rose-50' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <Card className="h-full border-trust-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-bold text-trust-900">{stat.value}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{stat.label}</div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Submitted Applications */}
        {applications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="overflow-hidden border-trust-100 bg-white shadow-lg">
              <div className="border-b border-trust-100 bg-gradient-to-r from-emerald-50 to-trust-50/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-trust-900">
                      {t('Your Application Kits', 'आपके आवेदन किट')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t('Track and manage your prepared application kits', 'अपने तैयार किए गए आवेदन किट का प्रबंधन करें')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-trust-50">
                {applications.map((app, i) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex flex-col gap-2 p-6 transition-colors hover:bg-trust-50/30 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-trust-900">{app.scheme_name}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {t('Tracking ID:', 'ट्रैकिंग आईडी:')} <span className="font-mono font-medium">{app.application_id}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(app.submitted_at).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {app.benefit_amount && (
                        <Badge className="bg-emerald-50 text-emerald-700">{app.benefit_amount}</Badge>
                      )}
                      <Badge className="bg-trust-50 text-trust-700">
                        {app.status === 'Prepared' || app.status === 'Submitted'
                          ? t('Ready to File', 'जमा करने हेतु तैयार')
                          : app.status}
                      </Badge>
                      {(app.status === 'Prepared' || app.status === 'Submitted') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-trust-200 hover:bg-trust-50 text-trust-700"
                          onClick={() => handleOpenOutcomeModal(app.id, app.scheme_id)}
                        >
                          {t('Mark as Filed', 'दाखिल चिह्नित करें')}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('Search schemes by name...', 'योजना नाम से खोजें...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-2xl border-trust-100 bg-white pl-12 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-trust-500"
          />
        </motion.div>

        {/* Scheme Cards */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSchemes.map((scheme, i) => {
            const Icon = iconMap[scheme.icon] || Store;
            const gradient = categoryColors[scheme.category] || 'from-trust-500 to-trust-700';
            const isExpanded = !!expandedExplanation[scheme.id];
            const explanation = scheme.matchExplanation;

            return (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <Card className="group h-full overflow-hidden border-trust-100 bg-white shadow-lg transition-shadow hover:shadow-xl hover:shadow-trust-500/10 flex flex-col justify-between">
                  <div>
                    {/* Match bar */}
                    <div className="relative h-1.5 w-full overflow-hidden bg-trust-50">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${gradient}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${scheme.matchPercent}%` }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>

                    <div className="p-6 pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-md`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold leading-tight text-trust-900">
                              {isHindi ? scheme.nameHindi : scheme.name}
                            </h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {isHindi ? scheme.ministryHindi : scheme.ministry}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gradient-trust">
                            {scheme.matchPercent}%
                          </div>
                          <div className="text-xs text-muted-foreground">{t('match', 'मिलान')}</div>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {isHindi ? scheme.descriptionHindi : scheme.description}
                      </p>

                      {/* Benefit highlight */}
                      <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3">
                        <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-800">
                          {isHindi ? scheme.benefitHindi : scheme.benefit}
                        </span>
                      </div>

                      {/* Tags + meta */}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="bg-trust-50 text-trust-700">
                          <Clock className="mr-1 h-3 w-3" />
                          {isHindi ? scheme.timeToApplyHindi : scheme.timeToApply}
                        </Badge>
                        {scheme.eligibilityTags.map((tag, ti) => (
                          <Badge key={ti} variant="outline" className="border-trust-200 text-trust-600">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Provenance & Last Verified */}
                      {(scheme.sourceUrl || scheme.lastVerifiedAt) && (
                        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground border-t border-trust-50 pt-2">
                          {scheme.sourceUrl ? (
                            <a
                              href={scheme.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-trust-600 hover:underline flex items-center gap-1 font-medium"
                            >
                              {t('Source: myScheme.gov.in', 'स्रोत: myScheme.gov.in')}
                            </a>
                          ) : (
                            <span>{t('Source: Internal', 'स्रोत: आंतरिक')}</span>
                          )}
                          {scheme.lastVerifiedAt && (
                            <span>
                              {t('Verified: ', 'सत्यापित: ')}
                              {new Date(scheme.lastVerifiedAt).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN')}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Family Eligibility Matches */}
                      {profile?.family_members && profile.family_members.length > 0 && (
                        <div className="mt-3 border-t border-trust-50 pt-2">
                          <div className="text-[11px] font-semibold text-trust-800 mb-1.5 uppercase tracking-wider">
                            {t('Family Member Matches', 'परिवार के सदस्य मिलान')}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {profile.family_members.map((member: any) => {
                              const memberProfile = {
                                income: member.income,
                                category: profile?.category || 'General',
                                occupation: member.occupation,
                                state: profile?.state || '',
                                has_aadhaar: member.has_aadhaar,
                                has_ration_card: member.has_ration_card,
                                has_udyam: member.has_udyam,
                                gender: member.gender,
                              };
                              const match = computeMatchPercent(scheme, memberProfile);
                              const isEligible = match >= 70;
                              return (
                                <div key={member.id} className="flex items-center justify-between p-1.5 bg-trust-50/30 rounded-lg border border-trust-100/50 text-[10px]">
                                  <span className="font-medium text-trust-900">
                                    {member.name} ({t(member.relation, member.relation)})
                                  </span>
                                  <Badge className={`text-[9px] px-1 py-0 border-0 ${
                                    isEligible ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50/80 text-rose-700'
                                  }`}>
                                    {match}% {isEligible ? t('Eligible', 'पात्र') : t('Not Eligible', 'अपात्र')}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Community Signal Badge */}
                      {(() => {
                        const count = outcomes[scheme.id] || { success: 0, rejected: 0, pending: 0 };
                        if (count.success > 0 || count.rejected > 0 || count.pending > 0) {
                          return (
                            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-trust-800 bg-trust-50/50 rounded-lg p-2 border border-trust-100">
                              <span className="font-semibold text-trust-700">👥 {t('Community Signal:', 'सामुदायिक संकेत:')}</span>
                              <span className="font-medium">
                                {count.success > 0 && `${count.success} ${t('Successes', 'सफलताएं')}`}
                                {count.success > 0 && (count.rejected > 0 || count.pending > 0) && ', '}
                                {count.rejected > 0 && `${count.rejected} ${t('Rejections', 'अस्वीकार')}`}
                                {count.rejected > 0 && count.pending > 0 && ', '}
                                {count.pending > 0 && `${count.pending} ${t('Pending', 'लंबित')}`}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Match Explanation Toggle */}
                      {explanation && (explanation.passed.length > 0 || explanation.failed.length > 0) && (
                        <div className="mt-4 border-t border-trust-100 pt-3">
                          <button
                            onClick={() => toggleExplanation(scheme.id)}
                            className="flex items-center justify-between w-full text-xs font-semibold text-trust-700 hover:text-trust-900 transition-colors focus-visible:ring-2 focus-visible:ring-trust-500 rounded"
                          >
                            <span>{t('Why this match score?', 'यह स्कोर क्यों मिला?')}</span>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 space-y-2 overflow-hidden text-xs"
                              >
                                {(isHindi ? explanation.passedHindi : explanation.passed).map((item, idx) => (
                                  <div key={`pass-${idx}`} className="flex items-center gap-2 text-emerald-700 bg-emerald-50/70 p-2 rounded-lg">
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                    <span>{item}</span>
                                  </div>
                                ))}

                                {(isHindi ? explanation.failedHindi : explanation.failed).map((item, idx) => (
                                  <div key={`fail-${idx}`} className="flex items-center gap-2 text-rose-700 bg-rose-50/70 p-2 rounded-lg">
                                    <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                                    <span>{item}</span>
                                  </div>
                                ))}

                                {explanation.failed.length > 0 && (
                                  <div className="mt-3 pt-2 border-t border-trust-100 flex flex-col gap-2">
                                    <Link
                                      href={`/appeal?schemeId=${encodeURIComponent(scheme.id)}&schemeName=${encodeURIComponent(isHindi ? scheme.nameHindi : scheme.name)}&failedCriteria=${encodeURIComponent(JSON.stringify(explanation.failed))}`}
                                      className="w-full"
                                    >
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-xs gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50"
                                      >
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        {t('Open Full Appeal Assistant & CPGRAMS Letter', 'अपील सहायक और CPGRAMS पत्र खोलें')}
                                      </Button>
                                    </Link>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-3 flex gap-2">
                    <Link href="/apply" className="flex-1">
                      <Button className="w-full gap-1.5 bg-trust-600 hover:bg-trust-700 focus-visible:ring-2 focus-visible:ring-trust-500">
                        {t('Apply Now', 'आवेदन करें')}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/de-jargonifier" className="flex-1">
                      <Button variant="outline" className="w-full gap-1.5 border-trust-200 focus-visible:ring-2 focus-visible:ring-trust-500">
                        <Volume2 className="h-4 w-4" />
                        {t('Explain', 'समझाएं')}
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Nearby Assistance Centers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-trust-100 bg-white shadow-lg">
            <div className="border-b border-trust-100 bg-gradient-to-r from-trust-50 to-saffron-50/50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-saffron-500 to-saffron-700 shadow-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-trust-900">
                    {t('Nearby Assistance Centers', 'आस-पास सहायता केंद्र')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      'Prefer human help? Visit one of these centers for free assistance.',
                      'मानवीय सहायता चाहिए? मुफ़्त सहायता के लिए इनमें से किसी भी केंद्र पर जाएं।'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-trust-50">
              {mockAssistanceCenters.map((center, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col gap-4 p-6 transition-colors hover:bg-trust-50/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-trust-900">
                      {isHindi ? center.nameHindi : center.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {isHindi ? center.addressHindi : center.address}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {isHindi ? center.hoursHindi : center.hours}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        {center.phone}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-trust-50 text-trust-700">{center.distance}</Badge>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {t('Directions', 'दिशा-निर्देश')}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Outcome Modal */}
      <AnimatePresence>
        {isOutcomeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-trust-100 bg-white p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-trust-50 pb-3">
                <h3 className="text-lg font-bold text-trust-900">
                  {t('Report Application Outcome', 'आवेदन परिणाम रिपोर्ट करें')}
                </h3>
                <button
                  onClick={() => {
                    setIsOutcomeModalOpen(false);
                    setSelectedAppId(null);
                    setSelectedSchemeId(null);
                  }}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-trust-50 hover:text-trust-900 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(
                    'Was your application approved? Did this scheme work for you? Your response is completely anonymous and helps other citizens gauge success rates.',
                    'क्या आपका आवेदन स्वीकृत हुआ? क्या यह योजना आपके लिए काम कर पाई? आपकी प्रतिक्रिया पूरी तरह से गुमनाम है और अन्य नागरिकों को सफलता दर जानने में मदद करती है।'
                  )}
                </p>
                
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    disabled={updatingStatus}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    onClick={() => handleReportOutcome('Success')}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {t('Yes, it was Approved / Successful', 'हाँ, यह स्वीकृत / सफल रहा')}
                  </Button>
                  <Button
                    disabled={updatingStatus}
                    variant="outline"
                    className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 gap-2"
                    onClick={() => handleReportOutcome('Rejected')}
                  >
                    <XCircle className="h-4 w-4" />
                    {t('No, it was Rejected', 'नहीं, इसे अस्वीकार कर दिया गया')}
                  </Button>
                  <Button
                    disabled={updatingStatus}
                    variant="secondary"
                    className="w-full bg-trust-50 hover:bg-trust-100 text-trust-800 gap-2"
                    onClick={() => handleReportOutcome('Pending')}
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('It is still Pending / In Progress', 'यह अभी भी लंबित / प्रक्रिया में है')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EligibilityRing({ percent }: { percent: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-44 w-44">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="hsl(214 32% 91%)"
          strokeWidth="10"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(214 84% 56%)" />
            <stop offset="50%" stopColor="hsl(142 71% 50%)" />
            <stop offset="100%" stopColor="hsl(25 95% 53%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="text-4xl font-bold text-gradient-trust"
        >
          {percent}%
        </motion.div>
        <div className="text-xs text-muted-foreground">Avg Match</div>
      </div>
    </div>
  );
}
