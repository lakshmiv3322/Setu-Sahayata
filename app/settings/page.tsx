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
    
    // reset form
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
          {/* Household & Family Members Card */}
          <Card className="border-trust-100 bg-white p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-trust-900 font-bold">
                <Users className="h-5 w-5 text-trust-600" />
                <h2>{t('Household & Family Members', 'परिवार के सदस्य')}</h2>
              </div>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                size="sm"
                className="bg-trust-600 hover:bg-trust-700 text-white gap-1"
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
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-trust-600"></div>
              </div>
            ) : familyMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {familyMembers.map((member) => (
                  <div key={member.id} className="relative rounded-xl border border-trust-100 bg-trust-50/20 p-4 space-y-2 hover:shadow-sm transition-all">
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-rose-600 transition-colors p-1"
                      title={t('Delete Member', 'सदस्य हटाएं')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div>
                      <h4 className="font-bold text-trust-900 text-sm">{member.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {t(member.relation, member.relation)} • {member.age} {t('yrs', 'वर्ष')} • {t(member.gender, member.gender)}
                      </p>
                    </div>
                    <div className="text-xs space-y-1 text-trust-800">
                      <div>
                        <span className="text-muted-foreground">{t('Income:', 'आय:')}</span> ₹{member.income?.toLocaleString(isHindi ? 'hi-IN' : 'en-IN')}/yr
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('Occupation:', 'व्यवसाय:')}</span> {member.occupation}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {member.has_aadhaar && (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0.5">
                          {t('Aadhaar', 'आधार')}
                        </Badge>
                      )}
                      {member.has_ration_card && (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0.5">
                          {t('Ration', 'राशन')}
                        </Badge>
                      )}
                      {member.has_udyam && (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0.5">
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

          {/* Modal using Framer Motion */}
          <AnimatePresence>
            {isAddModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="w-full max-w-lg overflow-hidden rounded-2xl border border-trust-100 bg-white p-6 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-trust-50 pb-3">
                    <h3 className="text-lg font-bold text-trust-900">
                      {t('Add Family Member', 'परिवार का सदस्य जोड़ें')}
                    </h3>
                    <button
                      onClick={() => setIsAddModalOpen(false)}
                      className="rounded-lg p-1 text-muted-foreground hover:bg-trust-50 hover:text-trust-900 transition-all"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddMember} className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-trust-800 mb-1">
                          {t('Full Name', 'पूरा नाम')}
                        </label>
                        <input
                          type="text"
                          required
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder={t('e.g. Ramesh Kumar', 'जैसे: रमेश कुमार')}
                          className="w-full rounded-xl border border-trust-200 px-4 py-2.5 outline-none focus:border-trust-500 focus:ring-2 focus:ring-trust-500/20"
                        />
                      </div>

                      {/* Age */}
                      <div>
                        <label className="block text-xs font-semibold text-trust-800 mb-1">
                          {t('Age', 'उम्र')}
                        </label>
                        <input
                          type="number"
                          required
                          value={newMemberAge}
                          onChange={(e) => setNewMemberAge(e.target.value)}
                          placeholder={t('e.g. 15', 'जैसे: 15')}
                          className="w-full rounded-xl border border-trust-200 px-4 py-2.5 outline-none focus:border-trust-500 focus:ring-2 focus:ring-trust-500/20"
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-xs font-semibold text-trust-800 mb-1">
                          {t('Gender', 'लिंग')}
                        </label>
                        <select
                          value={newMemberGender}
                          onChange={(e) => setNewMemberGender(e.target.value)}
                          className="w-full rounded-xl border border-trust-200 px-4 py-2.5 bg-white outline-none focus:border-trust-500"
                        >
                          <option value="Female">{t('Female', 'महिला')}</option>
                          <option value="Male">{t('Male', 'पुरुष')}</option>
                          <option value="Other">{t('Other', 'अन्य')}</option>
                        </select>
                      </div>

                      {/* Relation */}
                      <div>
                        <label className="block text-xs font-semibold text-trust-800 mb-1">
                          {t('Relation', 'संबंध')}
                        </label>
                        <select
                          value={newMemberRelation}
                          onChange={(e) => setNewMemberRelation(e.target.value)}
                          className="w-full rounded-xl border border-trust-200 px-4 py-2.5 bg-white outline-none focus:border-trust-500"
                        >
                          <option value="Spouse">{t('Spouse', 'जीवनसाथी')}</option>
                          <option value="Son">{t('Son', 'बेटा')}</option>
                          <option value="Daughter">{t('Daughter', 'बेटी')}</option>
                          <option value="Mother">{t('Mother', 'माता')}</option>
                          <option value="Father">{t('Father', 'पिता')}</option>
                          <option value="Brother">{t('Brother', 'भाई')}</option>
                          <option value="Sister">{t('Sister', 'बहन')}</option>
                          <option value="Other">{t('Other', 'अन्य')}</option>
                        </select>
                      </div>

                      {/* Income */}
                      <div>
                        <label className="block text-xs font-semibold text-trust-800 mb-1">
                          {t('Annual Income (₹)', 'वार्षिक आय (₹)')}
                        </label>
                        <input
                          type="number"
                          required
                          value={newMemberIncome}
                          onChange={(e) => setNewMemberIncome(e.target.value)}
                          placeholder={t('e.g. 50000', 'जैसे: 50000')}
                          className="w-full rounded-xl border border-trust-200 px-4 py-2.5 outline-none focus:border-trust-500 focus:ring-2 focus:ring-trust-500/20"
                        />
                      </div>

                      {/* Occupation */}
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-trust-800 mb-1">
                          {t('Occupation', 'व्यवसाय')}
                        </label>
                        <input
                          type="text"
                          value={newMemberOccupation}
                          onChange={(e) => setNewMemberOccupation(e.target.value)}
                          placeholder={t('e.g. Student, Tailor', 'जैसे: छात्र, दर्जी')}
                          className="w-full rounded-xl border border-trust-200 px-4 py-2.5 outline-none focus:border-trust-500 focus:ring-2 focus:ring-trust-500/20"
                        />
                      </div>
                    </div>

                    {/* Status switches (checkboxes) */}
                    <div className="border-t border-trust-50 pt-3 space-y-2">
                      <label className="block text-xs font-bold text-trust-900 uppercase tracking-wider mb-2">
                        {t('Document / Registration Status', 'दस्तावेज़ / पंजीकरण स्थिति')}
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <label className="flex items-center gap-2 p-2.5 rounded-xl border border-trust-100 bg-trust-50/20 hover:bg-trust-50 transition-all cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newMemberAadhaar}
                            onChange={(e) => setNewMemberAadhaar(e.target.checked)}
                            className="rounded border-trust-200 text-trust-600 focus:ring-trust-500 h-4 w-4"
                          />
                          <span className="text-xs font-medium text-trust-800">{t('Aadhaar', 'आधार')}</span>
                        </label>

                        <label className="flex items-center gap-2 p-2.5 rounded-xl border border-trust-100 bg-trust-50/20 hover:bg-trust-50 transition-all cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newMemberRation}
                            onChange={(e) => setNewMemberRation(e.target.checked)}
                            className="rounded border-trust-200 text-trust-600 focus:ring-trust-500 h-4 w-4"
                          />
                          <span className="text-xs font-medium text-trust-800">{t('Ration', 'राशन')}</span>
                        </label>

                        <label className="flex items-center gap-2 p-2.5 rounded-xl border border-trust-100 bg-trust-50/20 hover:bg-trust-50 transition-all cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newMemberUdyam}
                            onChange={(e) => setNewMemberUdyam(e.target.checked)}
                            className="rounded border-trust-200 text-trust-600 focus:ring-trust-500 h-4 w-4"
                          />
                          <span className="text-xs font-medium text-trust-800">{t('Udyam', 'उद्यम')}</span>
                        </label>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-3 border-t border-trust-50">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsAddModalOpen(false)}
                      >
                        {t('Cancel', 'रद्द करें')}
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-trust-600 hover:bg-trust-700 text-white"
                      >
                        {t('Add Member', 'सदस्य जोड़ें')}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Accessibility Mode Card */}
          <Card className="border-trust-100 bg-white p-6 shadow-md">
            <div className="flex items-center gap-2 mb-4 text-trust-900 font-bold">
              <Eye className="h-5 w-5 text-trust-600" />
              <h2>{t('Accessibility & Display', 'पहुँच और प्रदर्शन')}</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {t(
                'Choose a display mode to improve readability based on your needs.',
                'अपनी आवश्यकताओं के अनुसार पठनीयता सुधारने के लिए एक प्रदर्शन मोड चुनें।'
              )}
            </p>
            <AccessibilityModeSelector />
          </Card>

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
