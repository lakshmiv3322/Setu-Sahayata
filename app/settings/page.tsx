'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Trash2,
  Lock,
  History,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  FileText,
  UserX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { useRequireAuth } from '@/lib/use-require-auth';
import { supabase } from '@/lib/supabase-client';
import { logAuditEvent } from '@/lib/audit-logger';

interface AuditLogRow {
  id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

export default function SettingsPage() {
  useRequireAuth();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { t, isHindi } = useLanguage();

  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) setAuditLogs(data as AuditLogRow[]);
    };
    fetchLogs();
  }, [user]);

  const handleDeleteAllData = async () => {
    if (!user) return;
    setDeleting(true);

    try {
      // 1. Log final audit entry before purge
      await logAuditEvent('ACCOUNT_DELETED', {
        reason: 'USER_REQUESTED_PURGE',
      });

      // 2. Cascade delete user data across all tables
      await Promise.all([
        supabase.from('profiles').delete().eq('user_id', user.id),
        supabase.from('documents').delete().eq('user_id', user.id),
        supabase.from('applications').delete().eq('user_id', user.id),
        supabase.from('audit_logs').delete().eq('user_id', user.id),
      ]);

      // 3. Clear localStorage cache if any
      localStorage.clear();

      // 4. Sign out & redirect home
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Error purging data:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-50 via-white to-white">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 gap-1.5 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            {t('Back', 'वापस')}
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-trust-500 to-trust-700 shadow-lg text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-trust-900">
                {t('Privacy & Data Settings', 'गोपनीयता और डेटा सेटिंग्स')}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('Manage your consent, view audit logs, or permanently delete your account data.', 'अपनी सहमति प्रबंधित करें, ऑडिट लॉग देखें, या अपना खाता डेटा स्थायी रूप से हटाएं।')}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Data Retention & Privacy Policy Card */}
          <Card className="border-trust-100 bg-white p-6 shadow-md">
            <div className="flex items-center gap-2 mb-3 text-trust-900 font-bold">
              <Lock className="h-5 w-5 text-trust-600" />
              <h2>{t('Data Retention & DPDP Rights', 'डेटा प्रतिधारण और डीपीडीपी अधिकार')}</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                {t(
                  'Setu Sahayata complies with the Digital Personal Data Protection (DPDP) Act. All personal attributes (Aadhaar status, income, occupation) are encrypted at rest and scoped strictly to your authenticated session using Row-Level Security (RLS).',
                  'सेतु सहायता डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम का अनुपालन करती है। सभी व्यक्तिगत जानकारी रो-लेवल सिक्योरिटी (RLS) का उपयोग करके एन्क्रिप्ट की जाती हैं।'
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl bg-trust-50/50 p-3 border border-trust-100 text-xs">
                  <span className="font-semibold text-trust-900 block mb-1">🔒 {t('Storage Scope', 'भंडारण का दायरा')}</span>
                  {t('Stored exclusively under your user ID. Never sold or shared with commercial entities.', 'केवल आपकी यूज़र आईडी के तहत सहेजा गया। कभी बेचा या साझा नहीं किया गया।')}
                </div>
                <div className="rounded-xl bg-trust-50/50 p-3 border border-trust-100 text-xs">
                  <span className="font-semibold text-trust-900 block mb-1">🗑️ {t('Right to Erasure', 'मिटाने का अधिकार')}</span>
                  {t('You can permanently delete your entire profile and application history anytime below.', 'आप नीचे कभी भी अपनी संपूर्ण प्रोफ़ाइल और आवेदन इतिहास को स्थायी रूप से हटा सकते हैं।')}
                </div>
              </div>
            </div>
          </Card>

          {/* Audit Logs Viewer */}
          <Card className="border-trust-100 bg-white p-6 shadow-md">
            <div className="flex items-center gap-2 mb-4 text-trust-900 font-bold">
              <History className="h-5 w-5 text-trust-600" />
              <h2>{t('Your Data Audit Log', 'आपका डेटा ऑडिट लॉग')}</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {t('Immutable log of security & data access events associated with your account.', 'आपके खाते से जुड़े सुरक्षा और डेटा एक्सेस इवेंट का अपरिवर्तनीय लॉग।')}
            </p>

            {auditLogs.length > 0 ? (
              <div className="divide-y divide-trust-50 border border-trust-100 rounded-xl overflow-hidden text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-white hover:bg-trust-50/30 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Badge variant="outline" className="bg-trust-50 text-trust-700 font-mono text-[10px]">
                        {log.action}
                      </Badge>
                      <span className="text-trust-800 font-medium">
                        {log.action === 'CONSENT_GRANTED'
                          ? t('Granted explicit data consent', 'स्पष्ट डेटा सहमति दी')
                          : log.action === 'PROFILE_UPDATED'
                          ? t('Updated user profile', 'उपयोगकर्ता प्रोफ़ाइल अपडेट की')
                          : log.action === 'DOCUMENT_EXTRACTED'
                          ? t('Extracted document fields', 'दस्तावेज़ फ़ील्ड निकाले')
                          : log.action}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-[11px]">
                      {new Date(log.created_at).toLocaleString(isHindi ? 'hi-IN' : 'en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-muted-foreground">{t('No audit events logged yet.', 'अभी तक कोई ऑडिट इवेंट लॉग नहीं हुआ है।')}</p>
            )}
          </Card>

          {/* Delete Account & Data Card */}
          <Card className="border-rose-200 bg-rose-50/20 p-6 shadow-md">
            <div className="flex items-center gap-2 mb-2 text-rose-900 font-bold">
              <UserX className="h-5 w-5 text-rose-600" />
              <h2>{t('Delete My Data & Account', 'मेरा डेटा और खाता हटाएं')}</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {t(
                'Permanently remove your profile, uploaded documents, submitted applications, and audit logs from our databases. This action cannot be undone.',
                'हमारे डेटाबेस से अपनी प्रोफ़ाइल, अपलोड किए गए दस्तावेज़, जमा किए गए आवेदन और ऑडिट लॉग स्थायी रूप से हटाएं। यह कार्रवाई पूर्ववत नहीं की जा सकती।'
              )}
            </p>

            {isConfirmingDelete ? (
              <div className="rounded-xl border border-rose-300 bg-rose-100/50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-rose-900">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  {t('Are you absolutely sure?', 'क्या आप पूरी तरह सुनिश्चित हैं?')}
                </div>
                <p className="text-xs text-rose-800">
                  {t('All your saved documents and application tracking IDs will be purged immediately.', 'आपके सभी सहेजे गए दस्तावेज़ और आवेदन तुरंत मिटा दिए जाएंगे।')}
                </p>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsConfirmingDelete(false)}
                    disabled={deleting}
                  >
                    {t('Cancel', 'रद्द करें')}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
                    onClick={handleDeleteAllData}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleting ? t('Purging Data...', 'डेटा मिटा रहा है...') : t('Confirm & Delete Everything', 'पुष्टि करें और सब कुछ हटाएं')}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="border-rose-300 text-rose-700 hover:bg-rose-100 hover:text-rose-800 gap-2"
                onClick={() => setIsConfirmingDelete(true)}
              >
                <Trash2 className="h-4 w-4" />
                {t('Delete My Account & Data', 'मेरा खाता और डेटा हटाएं')}
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
