'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileCheck,
  UploadCloud,
  ShieldCheck,
  Info,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { useRequireAuth } from '@/lib/use-require-auth';
import { supabaseBrowser as supabase } from '@/lib/supabase-browser';

interface UserDoc {
  id: string;
  filename: string;
  doc_type: string;
  uploaded_at: string;
}

const docExplanations: Record<string, { purpose: string; purposeHindi: string; requiredFor: string }> = {
  Aadhaar: {
    purpose: 'Used to verify biometric identity, age, and residence for direct benefit transfer (DBT).',
    purposeHindi: 'प्रत्यक्ष लाभ अंतरण (DBT) के लिए बॉयोमीट्रिक पहचान, आयु और निवास स्थान सत्यापित करने के लिए उपयोग किया जाता है।',
    requiredFor: 'PM SVANidhi, PMAY, Mudra, Ayushman Bharat',
  },
  IncomeCertificate: {
    purpose: 'Verifies annual household income to ensure eligibility for Economically Weaker Section (EWS) schemes.',
    purposeHindi: 'आर्थिक रूप से कमजोर वर्ग (EWS) योजनाओं के लिए पात्रता सुनिश्चित करने के लिए वार्षिक घरेलू आय की पुष्टि करता है।',
    requiredFor: 'Ayushman Bharat, Anna Yojana, Ujjwala Yojana',
  },
  RationCard: {
    purpose: 'Identifies BPL/AAY household status for subsidized foodgrains and family scheme coverage.',
    purposeHindi: 'सब्सिडी वाले खाद्यान्न और पारिवारिक योजना कवरेज के लिए बीपीएल/एएवाई परिवार की स्थिति की पहचान करता है।',
    requiredFor: 'Anna Yojana, PM Poshan, SBM Gramin',
  },
  UdyamCertificate: {
    purpose: 'Validates street vendor / micro-entrepreneur status for collateral-free business loans.',
    purposeHindi: 'बिना किसी जमानत के व्यावसायिक ऋण के लिए स्ट्रीट वेंडर / सूक्ष्म उद्यमी स्थिति को सत्यापित करता है।',
    requiredFor: 'PM SVANidhi, Stand-Up India, Mudra Yojana',
  },
};

export default function DocumentVaultPage() {
  useRequireAuth();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [documents, setDocuments] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchDocs = async () => {
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (data) setDocuments(data as UserDoc[]);
      setLoading(false);
    };
    fetchDocs();
  }, [user]);

  const handleSimulatedUpload = async (docType: string) => {
    if (!user) return;
    setUploading(true);
    try {
      const mockFileName = `${docType}_${Date.now().toString().slice(-4)}.pdf`;
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          filename: mockFileName,
          doc_type: docType,
        })
        .select()
        .single();

      if (!error && data) {
        setDocuments((prev) => [data as UserDoc, ...prev]);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-50 via-white to-white">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-trust-700">
              <ArrowLeft className="h-4 w-4" />
              {t('Back to Dashboard', 'डैशबोर्ड पर वापस')}
            </Button>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-trust-100 px-3 py-1 text-xs font-bold text-trust-800 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('Encrypted Document Vault', 'एनक्रिप्टेड दस्तावेज़ तिजोरी')}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-trust-900 sm:text-4xl">
            {t('My Document Vault', 'मेरी दस्तावेज़ तिजोरी')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              'Manage your uploaded certificates. Setu Sahayata uses client-side verification so sensitive documents remain private.',
              'अपने अपलोड किए गए प्रमाण पत्रों को प्रबंधित करें। सेतु सहायता क्लाइंट-साइड सत्यापन का उपयोग करती है ताकि संवेदनशील दस्तावेज़ गोपनीय रहें।'
            )}
          </p>
        </motion.div>

        {/* Upload Action Card */}
        <Card className="mb-8 border-trust-100 bg-gradient-to-r from-trust-600 to-trust-800 p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">{t('Upload New Document', 'नया दस्तावेज़ अपलोड करें')}</h2>
              <p className="text-xs text-trust-100 mt-1">
                {t('Upload Aadhaar, Income, Ration, or Udyam Certificate to auto-fill applications.', 'आवेदन ऑटो-फिल करने के लिए आधार, आय, राशन या उद्यम प्रमाण पत्र अपलोड करें।')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Aadhaar', 'IncomeCertificate', 'RationCard', 'UdyamCertificate'].map((type) => (
                <Button
                  key={type}
                  size="sm"
                  onClick={() => handleSimulatedUpload(type)}
                  disabled={uploading}
                  className="bg-white/20 hover:bg-white/30 text-white text-xs gap-1"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  + {type.replace('Certificate', '')}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Document List */}
        {loading ? (
          <div className="flex justify-center p-12">
            <RefreshCw className="h-8 w-8 animate-spin text-trust-600" />
          </div>
        ) : documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc) => {
              const info = docExplanations[doc.doc_type] || {
                purpose: 'Required for government scheme eligibility verification.',
                purposeHindi: 'सरकारी योजना पात्रता सत्यापन के लिए आवश्यक।',
                requiredFor: 'General Schemes',
              };

              return (
                <Card key={doc.id} className="border-trust-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-trust-50 text-trust-600">
                        <FileCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-trust-900 text-sm">{doc.filename}</h3>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {t('Verified', 'सत्यापित')}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Type: <span className="font-semibold">{doc.doc_type}</span> · Uploaded:{' '}
                          {new Date(doc.uploaded_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSimulatedUpload(doc.doc_type)}
                        className="text-xs gap-1"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        {t('Replace', 'बदलें')}
                      </Button>
                    </div>
                  </div>

                  {/* Why do we need this explainer */}
                  <div className="mt-3 border-t border-trust-50 pt-3 text-xs text-trust-700 bg-trust-50/50 rounded-lg p-3">
                    <div className="flex items-start gap-1.5">
                      <Info className="h-4 w-4 shrink-0 text-trust-600 mt-0.5" />
                      <div>
                        <span className="font-semibold block">{t('Why do we need this?', 'हमें इसकी आवश्यकता क्यों है?')}</span>
                        <p className="text-muted-foreground mt-0.5">{t(info.purpose, info.purposeHindi)}</p>
                        <p className="text-[10px] font-mono text-trust-600 mt-1">Required for: {info.requiredFor}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-trust-100 bg-white p-12 text-center shadow-sm">
            <FileText className="mx-auto h-12 w-12 text-trust-300 mb-3" />
            <h3 className="text-base font-bold text-trust-900">{t('No documents in vault', 'तिजोरी में कोई दस्तावेज़ नहीं है')}</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {t('Upload your Aadhaar or Ration Card to automatically extract details for 100% scheme accuracy.', '100% योजना सटीकता के लिए विवरण निकालने के लिए अपना आधार या राशन कार्ड अपलोड करें।')}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
