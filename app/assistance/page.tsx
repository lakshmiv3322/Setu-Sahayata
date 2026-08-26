'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Search, ArrowLeft, CheckCircle2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { useLanguage } from '@/lib/language-context';
import { mockAssistanceCenters } from '@/lib/mock-data';

export default function AssistanceCenterLocatorPage() {
  const { t, isHindi } = useLanguage();
  const [search, setSearch] = useState('');

  const filteredCenters = mockAssistanceCenters.filter((c) =>
    isHindi
      ? c.nameHindi.toLowerCase().includes(search.toLowerCase()) || c.addressHindi.toLowerCase().includes(search.toLowerCase())
      : c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase())
  );

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
            <Building2 className="h-3.5 w-3.5" />
            {t('Physical Help Centers', 'भौतिक सहायता केंद्र')}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-trust-900 sm:text-4xl">
            {t('CSC Assistance Center Locator', 'सीएससी सहायता केंद्र खोजें')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              'For elderly or low-literacy citizens needing offline help: visit your nearest Common Service Center (CSC) with required documents.',
              'ऑफ़लाइन सहायता की आवश्यकता वाले बुजुर्ग या कम साक्षर नागरिकों के लिए: आवश्यक दस्तावेजों के साथ अपने निकटतम सामान्य सेवा केंद्र (सीएससी) पर जाएं।'
            )}
          </p>
        </motion.div>

        {/* Search Input */}
        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search by city, pincode, or center name...', 'शहर, पिनकोड या केंद्र का नाम खोजें...')}
            className="pl-10"
          />
        </div>

        {/* Center Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCenters.map((center, idx) => (
            <Card key={idx} className="border-trust-100 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-trust-900 text-base">{t(center.name, center.nameHindi)}</h3>
                  <Badge variant="outline" className="mt-1 bg-trust-50 text-trust-700 text-[10px]">
                    <MapPin className="h-3 w-3 mr-1" />
                    {center.distance}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-trust-600 shrink-0" />
                  <span>{t(center.address, center.addressHindi)}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-trust-600 shrink-0" />
                  <span>{t(center.hours, center.hoursHindi)}</span>
                </p>
                <p className="flex items-center gap-2 font-medium text-trust-800">
                  <Phone className="h-4 w-4 text-trust-600 shrink-0" />
                  <span>{center.phone}</span>
                </p>
              </div>

              {/* What to bring checklist */}
              <div className="mt-4 pt-3 border-t border-trust-50 bg-trust-50/50 rounded-xl p-3 text-xs">
                <span className="font-bold text-trust-900 block mb-1">
                  {t('Mandatory Documents to Bring:', 'साथ लाने वाले अनिवार्य दस्तावेज़:')}
                </span>
                <ul className="space-y-1 text-muted-foreground text-[11px]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Original Aadhaar Card + Xerox Copy</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Ration Card / Income Certificate</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Bank Passbook (for Direct Benefit Transfer)</span>
                  </li>
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
