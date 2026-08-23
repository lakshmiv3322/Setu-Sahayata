import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LanguageProvider } from '@/lib/language-context';
import { AuthProvider } from '@/lib/auth-context';
import { FloatingAssistant } from '@/components/floating-assistant';
import { PWAProvider } from '@/components/pwa-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Setu Sahayata — Government Benefits, Simplified',
  description:
    'A Unified Citizen Empowerment Portal: discover welfare schemes you qualify for and understand government documents with AI assistance.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Setu Sahayata — Government Benefits, Simplified',
    description:
      'Discover your eligible welfare schemes and decode government legalese with AI. Built for every citizen.',
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Setu Sahayata" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <LanguageProvider>
          <AuthProvider>
            <PWAProvider>
              {children}
              <FloatingAssistant />
            </PWAProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
