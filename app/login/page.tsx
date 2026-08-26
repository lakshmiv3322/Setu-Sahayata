'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, Loader2, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillPreset = (type: 'citizen' | 'admin') => {
    if (type === 'citizen') {
      setEmail('citizen.demo@setusahayata.in');
      setPassword('Citizen@123');
    } else {
      setEmail('admin.demo@setusahayata.in');
      setPassword('Admin@123');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-setu-50 via-white to-saffron-50/30 px-4">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-setu-200/40 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-saffron-200/30 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-setu-500 to-setu-700 shadow-lg shadow-setu-500/30"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </motion.div>
          <span className="text-xl font-bold tracking-tight text-setu-900">
            {t('Setu Sahayata', 'सेतु सहायता')}
          </span>
        </Link>

        <Card className="border-setu-100 bg-white/80 p-8 shadow-xl backdrop-blur-xl">
          <h1 className="text-2xl font-bold tracking-tight text-setu-900">
            {t('Welcome back', 'वापसी पर स्वागत है')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('Sign in to continue to your dashboard', 'अपने डैशबोर्ड पर जाने के लिए साइन इन करें')}
          </p>

          {/* Quick Jury / Demo Preset Login Buttons */}
          <div className="mt-4 rounded-xl border border-setu-100 bg-setu-50/60 p-3 space-y-2">
            <span className="text-[11px] font-bold text-setu-800 uppercase tracking-wider flex items-center justify-center gap-1">
              <Zap className="h-3 w-3 text-saffron-500" />
              {t('Instant Demo Sign-In', 'त्वरित डेमो साइन-इन')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillPreset('citizen')}
                className="text-xs bg-white border-setu-200 hover:bg-setu-100 text-setu-900 gap-1"
              >
                👤 Citizen
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillPreset('admin')}
                className="text-xs bg-white border-setu-200 hover:bg-setu-100 text-setu-900 gap-1"
              >
                🛡️ Admin
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground">
              {t('Click above, then Sign In — works even without Supabase', 'ऊपर क्लिक करें, फिर साइन इन — Supabase के बिना भी काम करता है')}
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-setu-800">
                {t('Email', 'ईमेल')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-xl border-setu-200 pl-10 focus-visible:ring-setu-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-setu-800">
                {t('Password', 'पासवर्ड')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl border-setu-200 pl-10 focus-visible:ring-setu-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 rounded-xl bg-setu-600 hover:bg-setu-700 active:scale-[0.98] transition-all shadow-md shadow-setu-500/20"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {t('Sign In', 'साइन इन')}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("Don't have an account?", 'खाता नहीं है?')}{' '}
            <Link href="/signup" className="font-semibold text-setu-600 hover:text-setu-700">
              {t('Sign up', 'साइन अप')}
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
