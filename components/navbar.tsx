'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Globe, Menu, X, LogOut, User as UserIcon, ShieldCheck, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { SUPPORTED_LANGUAGES, type Language } from '@/lib/types';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  const navItems = [
    { href: '/', label: t('Home', 'होम') },
    { href: '/discover', label: t('Discover', 'खोज') },
    { href: '/dashboard', label: t('Dashboard', 'डैशबोर्ड') },
    { href: '/de-jargonifier', label: t('De-Jargonifier', 'द-जैगनिफायर') },
  ];

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const userDisplayName =
    (user?.user_metadata?.full_name as string) ||
    user?.email?.split('@')[0] ||
    'User';
  const initials = userDisplayName
    .split(' ')
    .map((s: string) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (isAuthPage) return null;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="glass border-b border-white/40 shadow-sm">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-trust-500 to-trust-700 shadow-lg shadow-trust-500/30"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-lg font-bold tracking-tight text-trust-900">
                {t('Setu Sahayata', 'सेतु सहायता')}
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-trust-700'
                        : 'text-muted-foreground hover:text-trust-600'
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-lg bg-trust-50"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              {/* 6-Language Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5 font-medium">
                    <Globe className="h-4 w-4 text-trust-600" />
                    <span>{currentLang.nativeLabel}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Select Language</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as Language)}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{lang.nativeLabel} ({lang.label})</span>
                      {language === lang.code && <Check className="h-4 w-4 text-emerald-600" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden items-center gap-2 rounded-xl border border-trust-100 bg-white/60 px-2 py-1 transition-all hover:bg-trust-50 md:flex">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-gradient-to-br from-trust-500 to-trust-700 text-xs text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-trust-800">
                        {userDisplayName}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold">{userDisplayName}</span>
                      <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      {t('Dashboard', 'डैशबोर्ड')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <ShieldCheck className="mr-2 h-4 w-4 text-trust-600" />
                      {t('Privacy & Data Settings', 'गोपनीयता और डेटा')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('Sign Out', 'साइन आउट')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden items-center gap-2 md:flex">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      {t('Sign In', 'साइन इन')}
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-trust-600 hover:bg-trust-700">
                      {t('Sign Up', 'साइन अप')}
                    </Button>
                  </Link>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass border-b border-white/40 md:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-trust-50 text-trust-700'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                {user && (
                  <Link
                    href="/settings"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted flex items-center gap-2"
                  >
                    <ShieldCheck className="h-4 w-4 text-trust-600" />
                    {t('Privacy & Settings', 'गोपनीयता और सेटिंग्स')}
                  </Link>
                )}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-trust-100">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code as Language); setMobileOpen(false); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${language === lang.code ? 'bg-trust-600 text-white' : 'bg-trust-50 text-trust-700'}`}
                    >
                      {lang.nativeLabel}
                    </button>
                  ))}
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
