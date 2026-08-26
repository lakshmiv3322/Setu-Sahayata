import './globals.css';
import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import { LanguageProvider } from '@/lib/language-context';
import { AuthProvider } from '@/lib/auth-context';
import { FloatingAssistant } from '@/components/floating-assistant';
import { PWAProvider } from '@/components/pwa-provider';
import { AccessibilityProvider } from '@/lib/accessibility-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://setu-sahayata.netlify.app'),
  title: 'Setu Sahayata — Government Benefits, Simplified',
  description:
    'A Unified Citizen Empowerment Portal: discover welfare schemes you qualify for and understand government documents with AI assistance.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Setu Sahayata — Government Benefits, Simplified',
    description:
      'Discover your eligible welfare schemes and decode government legalese with AI. Built for every citizen.',
    images: [{ url: '/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [{ url: '/og-image.png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0F4C5C" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Setu Sahayata" />
      </head>
      <body className={`${inter.variable} ${sora.variable} font-sans`}>
        <AccessibilityProvider>
          <LanguageProvider>
            <AuthProvider>
              <PWAProvider>
                {children}
                <FloatingAssistant />
              </PWAProvider>
            </AuthProvider>
          </LanguageProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
