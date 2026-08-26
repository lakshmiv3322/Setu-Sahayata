'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailConfirmNeeded, setEmailConfirmNeeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signUp(email, password, name);
      if (result.error) {
        setError(result.error);
      } else if (result.needsEmailConfirm) {
        setEmailConfirmNeeded(true);
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setName('Priya Sharma');
    setEmail('citizen.demo@setusahayata.in');
    setPassword('Citizen@123');
  };

  if (emailConfirmNeeded) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-setu-50 via-white to-saffron-50/30 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-setu-900">{t('Check your email!', 'अपना ईमेल जांचें!')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(
              `We've sent a confirmation link to ${email}. Click it to activate your account.`,
              `हमने ${email} पर एक पुष्टिकरण लिंक भेजा है। अपना खाता सक्रिय करने के लिए उस पर क्लिक करें।`
            )}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            {t('Tip: Disable "Confirm email" in Supabase Auth settings to skip this step during development.', 'सुझाव: विकास के दौरान इस चरण को छोड़ने के लिए Supabase Auth सेटिंग में "ईमेल की पुष्टि करें" अक्षम करें।')}
          </p>
          <Link href="/login" className="mt-6 inline-block">
            <Button className="gap-2 rounded-xl bg-setu-600 hover:bg-setu-700">
              {t('Go to Sign In', 'साइन इन करें')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-setu-50 via-white to-saffron-50/30 px-4">
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
            {t('Create your account', 'अपना खाता बनाएं')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('Start discovering your benefits in seconds', 'सेकंडों में अपने लाभ खोजना शुरू करें')}
          </p>

          {/* Quick Demo Preset */}
          <div className="mt-4 rounded-xl border border-setu-100 bg-setu-50/60 p-3">
            <span className="block text-center text-[11px] font-bold uppercase tracking-wider text-setu-800">
              ⚡ {t('Quick Demo Sign-Up', 'त्वरित डेमो साइन-अप')}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillDemo}
              className="mt-2 w-full bg-white border-setu-200 hover:bg-setu-100 text-setu-900 text-xs gap-1"
            >
              <Zap className="h-3 w-3 text-saffron-500" />
              {t('Fill demo credentials', 'डेमो क्रेडेंशियल भरें')}
            </Button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-setu-800">
                {t('Full Name', 'पूरा नाम')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('Priya Sharma', 'प्रिया शर्मा')}
                  className="rounded-xl border-setu-200 pl-10 focus-visible:ring-setu-400"
                />
              </div>
            </div>

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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl border-setu-200 pl-10 focus-visible:ring-setu-400"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('Minimum 6 characters', 'न्यूनतम 6 अक्षर')}
              </p>
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
                  {t('Create Account', 'खाता बनाएं')}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('Already have an account?', 'पहले से खाता है?')}{' '}
            <Link href="/login" className="font-semibold text-setu-600 hover:text-setu-700">
              {t('Sign in', 'साइन इन')}
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
