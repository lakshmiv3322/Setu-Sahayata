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
import { NotificationsCenter } from '@/components/notifications-center';
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
        <div className="glass border-b border-white/40 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-setu-500 via-setu-600 to-setu-700 shadow-md shadow-setu-500/25"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold tracking-tight text-setu-950 dark:text-setu-50 group-hover:text-setu-600 transition-colors">
                  {t('Setu Sahayata', 'सेतु सहायता')}
                </span>
                <span className="text-[10px] font-semibold text-saffron-600 dark:text-saffron-400 tracking-wider uppercase -mt-1">
                  {t('Citizen Portal', 'नागरिक पोर्टल')}
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-setu-700 font-semibold dark:text-setu-300'
                        : 'text-muted-foreground hover:text-setu-600 dark:hover:text-setu-300'
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-xl bg-setu-50 dark:bg-setu-950/60"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              {/* 7-Language Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5 font-medium rounded-xl hover:bg-setu-50 dark:hover:bg-setu-950/50">
                    <Globe className="h-4 w-4 text-setu-600 dark:text-setu-400" />
                    <span className="text-xs font-semibold">{currentLang.nativeLabel}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-xl border-setu-100 dark:border-neutral-800">
                  <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1 font-semibold uppercase tracking-wider">
                    {t('Select Language', 'भाषा चुनें')}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as Language)}
                      className="flex items-center justify-between rounded-xl px-2.5 py-2 cursor-pointer text-xs"
                    >
                      <span className="font-medium">{lang.nativeLabel} <span className="text-muted-foreground">({lang.label})</span></span>
                      {language === lang.code && <Check className="h-4 w-4 text-emerald-600" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {user && <NotificationsCenter />}

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden items-center gap-2 rounded-xl border border-setu-100 bg-white/70 px-2.5 py-1 transition-all hover:bg-setu-50 dark:border-neutral-800 dark:bg-neutral-900 md:flex">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-gradient-to-br from-setu-500 to-setu-700 text-xs font-bold text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold text-setu-900 dark:text-setu-100">
                        {userDisplayName}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-xl">
                    <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5">
                      <span className="text-sm font-bold text-setu-950 dark:text-setu-50">{userDisplayName}</span>
                      <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')} className="rounded-xl cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4 text-setu-600" />
                      {t('Dashboard', 'डैशबोर्ड')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-xl cursor-pointer">
                      <ShieldCheck className="mr-2 h-4 w-4 text-setu-600" />
                      {t('Privacy & Data Settings', 'गोपनीयता और डेटा')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive rounded-xl cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('Sign Out', 'साइन आउट')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden items-center gap-2 md:flex">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="rounded-xl">
                      {t('Sign In', 'साइन इन')}
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="rounded-xl bg-setu-600 hover:bg-setu-700 text-white font-semibold shadow-md shadow-setu-600/20">
                      {t('Sign Up', 'साइन अप')}
                    </Button>
                  </Link>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-xl"
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
              className="glass border-b border-white/40 md:hidden dark:bg-neutral-900"
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-setu-50 text-setu-700 font-semibold dark:bg-setu-950 dark:text-setu-300'
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
                    className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted flex items-center gap-2"
                  >
                    <ShieldCheck className="h-4 w-4 text-setu-600" />
                    {t('Privacy & Settings', 'गोपनीयता और सेटिंग्स')}
                  </Link>
                )}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-setu-100 dark:border-neutral-800">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code as Language); setMobileOpen(false); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${language === lang.code ? 'bg-setu-600 text-white' : 'bg-setu-50 text-setu-700 dark:bg-neutral-800 dark:text-neutral-200'}`}
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
