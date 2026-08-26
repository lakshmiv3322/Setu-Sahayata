'use client';

import { motion } from 'framer-motion';
import { Check, X, Sparkles, Shield, Cpu, Languages, PhoneCall, FileText } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export function CompetitiveAdvantage() {
  const { t } = useLanguage();

  const comparisonData = [
    {
      feature: t('Eligibility Engine', 'पात्रता इंजन'),
      myScheme: 'Keyword search only',
      umang: 'Manual browsing',
      digilocker: 'Document storage only',
      setu: 'AI 16-Rule Precision Match (0-100% Score)',
      icon: Cpu,
    },
    {
      feature: t('Document De-Jargonifier', 'दस्तावेज़ सरलीकरण'),
      myScheme: '❌ None',
      umang: '❌ None',
      digilocker: '❌ Raw PDFs only',
      setu: 'Gemini Vision 3-Point Plain Language Summary',
      icon: FileText,
    },
    {
      feature: t('Language Inclusivity', 'भाषा समावेशिता'),
      myScheme: 'English / Hindi',
      umang: 'Limited languages',
      digilocker: 'English / Hindi',
      setu: '7 Native Languages + Web Speech Voice I/O',
      icon: Languages,
    },
    {
      feature: t('Non-Smartphone Access', 'गैर-स्मार्टफोन पहुंच'),
      myScheme: '❌ Web only',
      umang: '❌ App required',
      digilocker: '❌ App required',
      setu: 'SMS / WhatsApp / Toll-Free IVR Protocol',
      icon: PhoneCall,
    },
    {
      feature: t('Rejection Appeal Generator', 'अस्वीकृति अपील जनरेटर'),
      myScheme: '❌ None',
      umang: '❌ None',
      digilocker: '❌ None',
      setu: 'Automated CPGRAMS Grievance Letter Generator',
      icon: Shield,
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white via-trust-50/50 to-white border-y border-trust-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-trust-100 px-3 py-1 text-xs font-bold text-trust-800 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-trust-600" />
            {t('Why Choose Setu Sahayata?', 'सेतु सहायता क्यों चुनें?')}
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-trust-900 sm:text-4xl">
            {t('Bridging the Gap Beyond Existing Government Portals', 'मौजूदा सरकारी पोर्टलों से आगे का सेतु')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(
              'How Setu Sahayata solves the core accessibility, trust, and literacy barriers present in MyScheme, UMANG, and DigiLocker.',
              'सेतु सहायता कैसे माईस्कीम, उमंग और डिजिलॉकर में मौजूद पहुंच, विश्वास और साक्षरता की बाधाओं को दूर करती है।'
            )}
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-3xl border border-trust-100 bg-white shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-trust-900 text-white">
                <th className="p-4 font-bold text-sm">{t('Feature Capabilities', 'सुविधा क्षमताएं')}</th>
                <th className="p-4 font-semibold text-white/70">MyScheme</th>
                <th className="p-4 font-semibold text-white/70">UMANG</th>
                <th className="p-4 font-semibold text-white/70">DigiLocker</th>
                <th className="p-4 font-bold bg-trust-600 text-white text-sm">
                  ✨ Setu Sahayata
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-trust-100">
              {comparisonData.map((row, idx) => {
                const Icon = row.icon;
                return (
                  <tr key={idx} className="hover:bg-trust-50/50 transition">
                    <td className="p-4 font-bold text-trust-900 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-trust-100 text-trust-600">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{row.feature}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">{row.myScheme}</td>
                    <td className="p-4 text-muted-foreground">{row.umang}</td>
                    <td className="p-4 text-muted-foreground">{row.digilocker}</td>
                    <td className="p-4 font-bold bg-emerald-50/60 text-emerald-950 border-l-2 border-emerald-500">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{row.setu}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
