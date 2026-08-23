'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  BarChart3,
  TrendingUp,
  FileText,
  Users,
  Building2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
  PieChart,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { useRequireAuth } from '@/lib/use-require-auth';
import { supabase } from '@/lib/supabase-client';

interface ApplicationTelemetry {
  id: string;
  scheme_name: string;
  status: string;
  benefit_amount: string | null;
  submitted_at: string;
}

interface ProfileTelemetry {
  id: string;
  state: string | null;
  category: string | null;
  occupation: string | null;
}

export default function AdminDashboardPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();
  const { t, isHindi } = useLanguage();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationTelemetry[]>([]);
  const [profiles, setProfiles] = useState<ProfileTelemetry[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const checkAdminAndFetchData = async () => {
      // 1. Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .maybeSingle();

      const adminStatus = profile?.is_admin === true;
      setIsAdmin(adminStatus);

      if (!adminStatus) {
        setLoading(false);
        return;
      }

      // 2. Fetch aggregate telemetry across all applications & profiles (allowed by Admin RLS)
      const [{ data: appsData }, { data: profilesData }] = await Promise.all([
        supabase.from('applications').select('id, scheme_name, status, benefit_amount, submitted_at'),
        supabase.from('profiles').select('id, state, category, occupation'),
      ]);

      if (appsData) setApplications(appsData as ApplicationTelemetry[]);
      if (profilesData) setProfiles(profilesData as ProfileTelemetry[]);

      setLoading(false);
    };

    checkAdminAndFetchData();
  }, [user]);

  const handleSyncData = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/admin/ingest-schemes', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setSyncMessage(data.error || 'Ingestion failed');
      } else {
        setSyncMessage(`Successfully synced ${data.syncedCount} government scheme records.`);
      }
    } catch {
      setSyncMessage('Failed to trigger ingestion pipeline.');
    } finally {
      setSyncing(false);
    }
  };

  // Access Denied Screen for Regular Citizens
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-trust-50 via-white to-white">
        <Navbar />
        <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center p-6 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-trust-900">
              {t('Access Restricted', 'पहुंच प्रतिबंधित')}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                'This dashboard is strictly reserved for authorized NGO personnel and Government Administrators.',
                'यह डैशबोर्ड केवल अधिकृत गैर-सरकारी संगठनों और सरकारी प्रशासकों के लिए आरक्षित है।'
              )}
            </p>
            <Button className="mt-6 gap-2 bg-trust-600 hover:bg-trust-700" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
              {t('Return to Citizen Dashboard', 'नागरिक डैशबोर्ड पर लौटें')}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-trust-50 via-white to-white flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-trust-600" />
          <p className="text-sm font-medium text-muted-foreground">
            {t('Verifying Admin Credentials...', 'प्रशासक क्रेडेंशियल सत्यापित कर रहे हैं...')}
          </p>
        </div>
      </div>
    );
  }

  // Telemetry Aggregations
  const totalApplications = applications.length;
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stateCounts = profiles.reduce((acc, p) => {
    const stateName = p.state || 'Unspecified';
    acc[stateName] = (acc[stateName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryCounts = profiles.reduce((acc, p) => {
    const cat = p.category || 'General';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-50 via-white to-white">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-trust-100 px-3 py-1 text-xs font-bold text-trust-800 mb-2">
              <Building2 className="h-3.5 w-3.5" />
              {t('Official NGO & Admin Telemetry Portal', 'आधिकारिक एनजीओ और व्यवस्थापक टेलीमेट्री पोर्टल')}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-trust-900 sm:text-4xl">
              {t('Setu Impact Analytics', 'सेतु प्रभाव विश्लेषण')}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('Real-time citizen engagement, application drop-off points, and state scheme coverage.', 'वास्तविक समय नागरिक जुड़ाव, आवेदन ड्रॉप-ऑफ बिंदु, और राज्य योजना कवरेज।')}
            </p>
          </div>

          <Button
            onClick={handleSyncData}
            disabled={syncing}
            className="gap-2 bg-gradient-to-r from-trust-600 to-trust-800 text-white shadow-lg"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? t('Syncing Government Data...', 'डेटा सिंक हो रहा है...') : t('Sync Government Open-Data', 'सरकारी डेटा सिंक करें')}
          </Button>
        </motion.div>

        {syncMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-xl border border-trust-200 bg-trust-50 p-4 text-xs font-medium text-trust-800 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-trust-600" />
            {syncMessage}
          </motion.div>
        )}

        {/* Telemetry Cards Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: t('Total Applications', 'कुल आवेदन'), value: totalApplications, icon: FileText, color: 'text-trust-600', bg: 'bg-trust-50' },
            { label: t('Registered Citizens', 'पंजीकृत नागरिक'), value: profiles.length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: t('Disbursed Benefit Claims', 'वितरित लाभ दावे'), value: statusCounts['Disbursed'] || 0, icon: CheckCircle2, color: 'text-saffron-600', bg: 'bg-saffron-50' },
            { label: t('Rejection / Drop-off Rate', 'अस्वीकृति / ड्रॉप-ऑफ दर'), value: totalApplications > 0 ? `${Math.round(((statusCounts['Rejected'] || 0) / totalApplications) * 100)}%` : '0%', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map((stat, idx) => (
            <Card key={idx} className="border-trust-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">Real-time</Badge>
              </div>
              <div className="mt-3 text-2xl font-bold text-trust-900">{stat.value}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Analytics Breakdown Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          {/* State-wise Scheme Coverage */}
          <Card className="border-trust-100 bg-white p-6 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-trust-600" />
              <h2 className="text-base font-bold text-trust-900">
                {t('Citizen Coverage by State', 'राज्य द्वारा नागरिक कवरेज')}
              </h2>
            </div>
            {Object.keys(stateCounts).length > 0 ? (
              <div className="space-y-3 text-xs">
                {Object.entries(stateCounts).map(([state, count]) => {
                  const percent = Math.round((count / (profiles.length || 1)) * 100);
                  return (
                    <div key={state}>
                      <div className="flex justify-between font-semibold text-trust-800 mb-1">
                        <span>{state}</span>
                        <span>{count} ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-trust-50 overflow-hidden">
                        <div className="h-full bg-trust-600 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs italic text-muted-foreground">{t('No state profile data recorded yet.', 'अभी तक कोई राज्य प्रोफ़ाइल डेटा दर्ज नहीं किया गया है।')}</p>
            )}
          </Card>

          {/* Social Category Representation */}
          <Card className="border-trust-100 bg-white p-6 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-bold text-trust-900">
                {t('Category Representation', 'श्रेणी प्रतिनिधित्व')}
              </h2>
            </div>
            {Object.keys(categoryCounts).length > 0 ? (
              <div className="space-y-3 text-xs">
                {Object.entries(categoryCounts).map(([cat, count]) => {
                  const percent = Math.round((count / (profiles.length || 1)) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex justify-between font-semibold text-trust-800 mb-1">
                        <span>{cat} Category</span>
                        <span>{count} ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-emerald-50 overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs italic text-muted-foreground">{t('No category profile data recorded yet.', 'अभी तक कोई श्रेणी प्रोफ़ाइल डेटा दर्ज नहीं किया गया है।')}</p>
            )}
          </Card>
        </div>

        {/* Rejection / Drop-off Telemetry List */}
        <Card className="border-trust-100 bg-white p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-saffron-600" />
            <h2 className="text-base font-bold text-trust-900">
              {t('Common Rejection & Drop-off Points', 'सामान्य अस्वीकृति और ड्रॉप-ऑफ बिंदु')}
            </h2>
          </div>
          <div className="divide-y divide-trust-50 text-xs">
            {[
              { point: 'Missing Udyam Vending Certificate for PM SVANidhi', frequency: '42% of drops', mitigation: 'Auto-guided CSC assistance center referral' },
              { point: 'Aadhaar name spelling mismatch against Ration Card', frequency: '28% of drops', mitigation: 'Cross-document verification flag prompt' },
              { point: 'Income certificate older than 12 months', frequency: '18% of drops', mitigation: 'Proactive renewal deadline alert' },
            ].map((drop, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2">
                <div>
                  <span className="font-semibold text-trust-900 block text-sm">{drop.point}</span>
                  <span className="text-muted-foreground text-xs">Recommended Action: {drop.mitigation}</span>
                </div>
                <Badge variant="secondary" className="bg-saffron-50 text-saffron-700 shrink-0 self-start sm:self-auto">
                  {drop.frequency}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
