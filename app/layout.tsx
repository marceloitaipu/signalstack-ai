import './globals.css';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#22d3ee',
};

export const metadata: Metadata = {
  title: 'SignalStack AI',
  description: 'Commercial crypto trading SaaS starter with signals, alerts, billing flow and premium dashboard.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SignalStack AI',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-512.png',
  },
};

import { FloatingLanguageSwitcher } from '@/components/language-switcher';
import { getLocale } from '@/lib/i18n';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale === 'pt' ? 'pt-BR' : 'en'}>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
        <FloatingLanguageSwitcher current={locale} />
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
          }
        `}</Script>
      </body>
    </html>
  );
}
