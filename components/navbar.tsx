'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, Globe, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
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
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, toggle, isHindi } = useLanguage();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  const navItems = [
    { href: '/', label: t('Home', 'होम') },
    { href: '/discover', label: t('Discover', 'खोज') },
    { href: '/dashboard', label: t('Dashboard', 'डैशबोर्ड') },
    { href: '/de-jargonifier', label: t('De-Jargonifier', 'द-जैगनिफायर') },
  ];

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
              <Button
                variant="ghost"
                size="sm"
                onClick={toggle}
                className="hidden gap-1.5 sm:flex"
              >
                <Globe className="h-4 w-4" />
                {isHindi ? 'EN' : 'हिं'}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex"
                title={t('Voice narration', 'वॉइस नैरेशन')}
              >
                <Mic className="h-4 w-4" />
              </Button>

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
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={toggle} className="flex-1 gap-1.5">
                    <Globe className="h-4 w-4" />
                    {isHindi ? 'English' : 'हिंदी'}
                  </Button>
                  {user ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="flex-1 gap-1.5"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('Sign Out', 'साइन आउट')}
                    </Button>
                  ) : (
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                      <Button size="sm" className="w-full bg-trust-600 hover:bg-trust-700">
                        {t('Sign In', 'साइन इन')}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
