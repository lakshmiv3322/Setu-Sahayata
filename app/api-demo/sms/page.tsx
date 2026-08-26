'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PhoneCall, MessageSquare, Send, ArrowLeft, CheckCircle2, Sparkles, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/navbar';
import { useLanguage } from '@/lib/language-context';

export default function SmsDemoPage() {
  const { t } = useLanguage();
  const [command, setCommand] = useState('SCHEME 400001');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleTestSms = async () => {
    if (!command.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/sms-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: command }),
      });
      const data = await res.json();
      setResponse(data);
    } catch {
      setResponse({ error: 'Network error calling SMS gateway API.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-50 via-white to-white">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
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
            <Smartphone className="h-3.5 w-3.5" />
            Offline / Non-Smartphone Outreach Simulator
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-trust-900 sm:text-4xl">
            SMS / WhatsApp / IVR Architecture Prototype
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Demonstrating multi-channel inclusion for citizens without smartphones or internet access.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <Card className="border-trust-100 bg-white p-6 shadow-md">
            <h2 className="text-base font-bold text-trust-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-trust-600" />
              Simulate Inbound SMS Command
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-trust-800 block mb-1">Enter Text Command:</label>
                <div className="flex gap-2">
                  <Input
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="e.g. SCHEME 400001 or STATUS APP-101"
                    className="font-mono text-xs"
                  />
                  <Button onClick={handleTestSms} disabled={loading} className="bg-trust-600 hover:bg-trust-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-2 border-t border-trust-100">
                <span className="font-semibold text-muted-foreground block mb-2">Quick Test Presets:</span>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCommand('SCHEME 400001')} className="text-[11px]">
                    SCHEME 400001
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => setCommand('STATUS APP-2026-8891')} className="text-[11px]">
                    STATUS APP-2026-8891
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => setCommand('HELP')} className="text-[11px]">
                    HELP
                  </Button>
                </div>
              </div>

              <div className="rounded-xl bg-trust-50 p-4 border border-trust-100 text-trust-800">
                <span className="font-bold flex items-center gap-1 mb-1">
                  <PhoneCall className="h-3.5 w-3.5 text-trust-600" />
                  Toll-Free IVR Hotline Simulation
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Dial <strong>1800-111-222</strong> for automated DTMF menu or missed-call scheme verification.
                </p>
              </div>
            </div>
          </Card>

          {/* Response Output */}
          <Card className="border-trust-100 bg-white p-6 shadow-md">
            <h2 className="text-base font-bold text-trust-900 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              Simulated Telemetry Output
            </h2>

            {response ? (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-trust-900">SMS Response Payload (160-Char Compliant):</span>
                    <span className="font-mono text-[10px] bg-trust-100 px-2 py-0.5 rounded text-trust-800">
                      {response.smsLength || 0} / 160 Chars
                    </span>
                  </div>
                  <div className="font-mono bg-gray-900 text-emerald-400 p-3 rounded-xl text-[11px] leading-relaxed break-words">
                    {response.smsText || response.error}
                  </div>
                </div>

                {response.whatsappText && (
                  <div>
                    <span className="font-semibold text-trust-900 block mb-1">WhatsApp Rich Business Response:</span>
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[11px] text-emerald-950 whitespace-pre-line">
                      {response.whatsappText}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Smartphone className="h-10 w-10 text-trust-300 mb-2" />
                <p className="text-xs">Click Send above to simulate receiving an SMS/WhatsApp response.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
