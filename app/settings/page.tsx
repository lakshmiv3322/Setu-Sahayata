'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Eye,
  Plus,
  X,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { useRequireAuth } from '@/lib/use-require-auth';
import { supabaseBrowser as supabase } from '@/lib/supabase-browser';
import { logAuditEvent } from '@/lib/audit-logger';
import { AccessibilityModeSelector } from '@/components/accessibility-mode-selector';

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

  // Household Management States
  const [profile, setProfile] = useState<any>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAge, setNewMemberAge] = useState('');
  const [newMemberGender, setNewMemberGender] = useState('Female');
  const [newMemberRelation, setNewMemberRelation] = useState('Son');
  const [newMemberIncome, setNewMemberIncome] = useState('');
  const [newMemberOccupation, setNewMemberOccupation] = useState('');
  const [newMemberAadhaar, setNewMemberAadhaar] = useState(false);
  const [newMemberRation, setNewMemberRation] = useState(false);
  const [newMemberUdyam, setNewMemberUdyam] = useState(false);

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

    const fetchUserData = async () => {
      setLoadingProfile(true);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        setFamilyMembers(data.family_members || []);
      }
      setLoadingProfile(false);
    };

    fetchLogs();
    fetchUserData();
  }, [user]);

  const saveFamilyMembers = async (newMembers: any[]) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user.id,
            name: profile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
            family_members: newMembers,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Error saving family members:', error);
      } else {
        setFamilyMembers(newMembers);
        setProfile((prev: any) => ({ ...prev, family_members: newMembers }));
        await logAuditEvent('PROFILE_UPDATED', {
          action: 'FAMILY_MEMBERS_UPDATED',
          family_members_count: newMembers.length,
        });
      }
    } catch (err) {
      console.error('Error in saveFamilyMembers:', err);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberAge) return;

    const newMember = {
      id: Math.random().toString(36).substring(2, 9),
      name: newMemberName.trim(),
      age: parseInt(newMemberAge) || 0,
      gender: newMemberGender,
      relation: newMemberRelation,
      income: parseInt(newMemberIncome) || 0,
      occupation: newMemberOccupation.trim() || 'Unemployed',
      has_aadhaar: newMemberAadhaar,
      has_ration_card: newMemberRation,
      has_udyam: newMemberUdyam,
    };

    const updated = [...familyMembers, newMember];
    await saveFamilyMembers(updated);

    setNewMemberName('');
    setNewMemberAge('');
    setNewMemberGender('Female');
    setNewMemberRelation('Son');
    setNewMemberIncome('');
    setNewMemberOccupation('');
    setNewMemberAadhaar(false);
    setNewMemberRation(false);
    setNewMemberUdyam(false);
    setIsAddModalOpen(false);
  };

  const handleDeleteMember = async (id: string) => {
    const updated = familyMembers.filter((m) => m.id !== id);
    await saveFamilyMembers(updated);
  };

  const handleDeleteAllData = async () => {
    if (!user) return;
    setDeleting(true);

    try {
      await logAuditEvent('ACCOUNT_DELETED', {
        reason: 'USER_REQUESTED_PURGE',
      });

      await Promise.all([
        supabase.from('profiles').delete().eq('user_id', user.id),
        supabase.from('documents').delete().eq('user_id', user.id),
        supabase.from('applications').delete().eq('user_id', user.id),
        supabase.from('audit_logs').delete().eq('user_id', user.id),
      ]);

      localStorage.clear();
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Error purging data:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-setu-50/60 via-white to-saffron-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 gap-1.5 text-muted-foreground rounded-xl">
            <ArrowLeft className="h-4 w-4" />
            {t('Back', 'वापस')}
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-setu-500 to-setu-700 shadow-lg text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold text-setu-950 dark:text-setu-50">
                {t('Privacy & Data Settings', 'गोपनीयता और डेटा सेटिंग्स')}
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t('Manage your consent, view audit logs, or permanently delete your account data.', 'अपनी सहमति प्रबंधित करें, ऑडिट लॉग देखें, या अपना खाता डेटा स्थायी रूप से हटाएं।')}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Household & Family Members Card */}
          <Card className="border-setu-100 bg-white/90 p-6 shadow-md dark:border-neutral-800 dark:bg-neutral-900 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-setu-950 dark:text-setu-50 font-bold">
                <Users className="h-5 w-5 text-setu-600 dark:text-setu-400" />
                <h2>{t('Household & Family Members', 'परिवार के सदस्य')}</h2>
              </div>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                size="sm"
                className="bg-setu-600 hover:bg-setu-700 text-white gap-1 rounded-xl text-xs font-semibold"
              >
                <Plus className="h-4 w-4" />
                {t('Add Member', 'सदस्य जोड़ें')}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              {t(
                'Add family members to check their eligibility for government welfare schemes.',
                'कल्याणकारी योजनाओं के लिए उनकी पात्रता की जांच करने के लिए परिवार के सदस्यों को जोड़ें।'
              )}
            </p>

            {loadingProfile ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-setu-600"></div>
              </div>
            ) : familyMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {familyMembers.map((member) => (
                  <div key={member.id} className="relative rounded-2xl border border-setu-100 bg-setu-50/40 p-4 space-y-2 hover:shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-950">
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-rose-600 transition-colors p-1"
                      title={t('Delete Member', 'सदस्य हटाएं')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div>
                      <h4 className="font-bold text-setu-950 dark:text-setu-50 text-sm">{member.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {t(member.relation, member.relation)} • {member.age} {t('yrs', 'वर्ष')} • {t(member.gender, member.gender)}
                      </p>
                    </div>
                    <div className="text-xs space-y-1 text-setu-800 dark:text-setu-200">
                      <div>
                        <span className="text-muted-foreground">{t('Income:', 'आय:')}</span> ₹{member.income?.toLocaleString(isHindi ? 'hi-IN' : 'en-IN')}/yr
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('Occupation:', 'व्यवसाय:')}</span> {member.occupation}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {member.has_aadhaar && (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0.5 dark:bg-emerald-950 dark:text-emerald-300">
                          {t('Aadhaar', 'आधार')}
                        </Badge>
                      )}
                      {member.has_ration_card && (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0.5 dark:bg-emerald-950 dark:text-emerald-300">
                          {t('Ration', 'राशन')}
                        </Badge>
                      )}
                      {member.has_udyam && (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0.5 dark:bg-emerald-950 dark:text-emerald-300">
                          {t('Udyam', 'उद्यम')}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-muted-foreground py-4 text-center">
                {t('No family members added yet.', 'अभी तक परिवार का कोई सदस्य नहीं जोड़ा गया है।')}
              </p>
            )}
          </Card>

          {/* Add Member Modal */}
          <AnimatePresence>
            {isAddModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="w-full max-w-lg overflow-hidden rounded-3xl border border-setu-100 bg-white p-6 shadow-2xl space-y-4 dark:bg-neutral-900 dark:border-neutral-800"
                >
                  <div className="flex items-center justify-between border-b border-setu-50 dark:border-neutral-800 pb-3">
                    <h3 className="text-lg font-bold text-setu-950 dark:text-setu-50 font-display">
                      {t('Add Family Member', 'परिवार का सदस्य जोड़ें')}
                    </h3>
                    <button
                      onClick={() => setIsAddModalOpen(false)}
                      className="rounded-lg p-1 text-muted-foreground hover:bg-setu-50 transition-all"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddMember} className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-setu-900 dark:text-setu-200 mb-1">
                          {t('Full Name', 'पूरा नाम')}
                        </label>
                        <input
                          type="text"
                          required
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder={t('e.g. Ramesh Kumar', 'जैसे: रमेश कुमार')}
                          className="w-full rounded-xl border border-setu-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-setu-500 dark:bg-neutral-950 dark:border-neutral-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-setu-900 dark:text-setu-200 mb-1">
                          {t('Age', 'उम्र')}
                        </label>
                        <input
                          type="number"
                          required
                          value={newMemberAge}
                          onChange={(e) => setNewMemberAge(e.target.value)}
                          placeholder="15"
                          className="w-full rounded-xl border border-setu-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-setu-500 dark:bg-neutral-950 dark:border-neutral-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-setu-900 dark:text-setu-200 mb-1">
                          {t('Gender', 'लिंग')}
                        </label>
                        <select
                          value={newMemberGender}
                          onChange={(e) => setNewMemberGender(e.target.value)}
                          className="w-full rounded-xl border border-setu-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-setu-500 dark:bg-neutral-950 dark:border-neutral-800"
                        >
                          <option value="Female">{t('Female', 'महिला')}</option>
                          <option value="Male">{t('Male', 'पुरुष')}</option>
                          <option value="Other">{t('Other', 'अन्य')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-setu-900 dark:text-setu-200 mb-1">
                          {t('Relation', 'संबंध')}
                        </label>
                        <select
                          value={newMemberRelation}
                          onChange={(e) => setNewMemberRelation(e.target.value)}
                          className="w-full rounded-xl border border-setu-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-setu-500 dark:bg-neutral-950 dark:border-neutral-800"
                        >
                          <option value="Spouse">{t('Spouse', 'जीवनसाथी')}</option>
                          <option value="Son">{t('Son', 'बेटा')}</option>
                          <option value="Daughter">{t('Daughter', 'बेटी')}</option>
                          <option value="Mother">{t('Mother', 'माता')}</option>
                          <option value="Father">{t('Father', 'पिता')}</option>
                          <option value="Brother">{t('Brother', 'भाई')}</option>
                          <option value="Sister">{t('Sister', 'बहन')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-setu-900 dark:text-setu-200 mb-1">
                          {t('Annual Income (₹)', 'वार्षिक आय (₹)')}
                        </label>
                        <input
                          type="number"
                          required
                          value={newMemberIncome}
                          onChange={(e) => setNewMemberIncome(e.target.value)}
                          placeholder="50000"
                          className="w-full rounded-xl border border-setu-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-setu-500 dark:bg-neutral-950 dark:border-neutral-800"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3 border-t border-setu-50 dark:border-neutral-800">
                      <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsAddModalOpen(false)}>
                        {t('Cancel', 'रद्द करें')}
                      </Button>
                      <Button type="submit" className="flex-1 rounded-xl bg-setu-600 hover:bg-setu-700 text-white font-semibold">
                        {t('Add Member', 'सदस्य जोड़ें')}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Accessibility Mode Card */}
          <Card className="border-setu-100 bg-white/90 p-6 shadow-md dark:border-neutral-800 dark:bg-neutral-900 rounded-3xl">
            <div className="flex items-center gap-2 mb-4 text-setu-950 dark:text-setu-50 font-bold">
              <Eye className="h-5 w-5 text-setu-600 dark:text-setu-400" />
              <h2>{t('Accessibility & Display Modes', 'सुलभता और प्रदर्शन मोड')}</h2>
            </div>
            <AccessibilityModeSelector />
          </Card>

          {/* Audit Logs Viewer */}
          <Card className="border-setu-100 bg-white/90 p-6 shadow-md dark:border-neutral-800 dark:bg-neutral-900 rounded-3xl">
            <div className="flex items-center gap-2 mb-4 text-setu-950 dark:text-setu-50 font-bold">
              <History className="h-5 w-5 text-setu-600 dark:text-setu-400" />
              <h2>{t('Citizen Data Audit Log', 'नागरिक डेटा ऑडिट लॉग')}</h2>
            </div>
            {auditLogs.length > 0 ? (
              <div className="divide-y divide-setu-50 dark:divide-neutral-800 border border-setu-100 dark:border-neutral-800 rounded-2xl overflow-hidden text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3.5 bg-white dark:bg-neutral-950">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-setu-50 text-setu-700 dark:bg-setu-950 dark:text-setu-300 font-mono text-[10px]">
                        {log.action}
                      </Badge>
                      <span className="text-setu-900 dark:text-setu-100 font-medium">{log.action}</span>
                    </div>
                    <span className="text-muted-foreground text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">{t('No audit logs recorded yet.', 'अभी तक कोई ऑडिट लॉग दर्ज नहीं किया गया है।')}</p>
            )}
          </Card>

          {/* Delete Account Card */}
          <Card className="border-rose-200 bg-rose-50/40 p-6 shadow-md dark:border-rose-950 dark:bg-rose-950/20 rounded-3xl">
            <div className="flex items-center gap-2 mb-2 text-rose-900 dark:text-rose-200 font-bold">
              <UserX className="h-5 w-5 text-rose-600" />
              <h2>{t('Delete My Data & Account', 'मेरा डेटा और खाता हटाएं')}</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {t('Permanently remove your profile and document vault data from our database.', 'हमारे डेटाबेस से अपनी प्रोफ़ाइल और दस्तावेज़ वॉल्ट डेटा को स्थायी रूप से हटाएं।')}
            </p>

            {isConfirmingDelete ? (
              <div className="rounded-2xl border border-rose-300 bg-rose-100/50 p-4 space-y-3 dark:border-rose-900 dark:bg-rose-950/40">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-900 dark:text-rose-200">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  {t('Are you sure you want to permanently delete all your data?', 'क्या आप निश्चित रूप से अपना संपूर्ण डेटा मिटाना चाहते हैं?')}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsConfirmingDelete(false)} disabled={deleting} className="rounded-xl text-xs">
                    {t('Cancel', 'रद्द करें')}
                  </Button>
                  <Button size="sm" onClick={handleDeleteAllData} disabled={deleting} className="rounded-xl bg-rose-600 text-white text-xs font-semibold">
                    {deleting ? t('Purging...', 'मिटाया जा रहा है...') : t('Confirm Purge Data', 'डेटा मिटाने की पुष्टि करें')}
                  </Button>
                </div>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsConfirmingDelete(true)} className="rounded-xl border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:text-rose-300 text-xs font-semibold">
                <Trash2 className="h-4 w-4 mr-1.5" />
                {t('Request Data Purge', 'डेटा मिटाने का अनुरोध करें')}
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
