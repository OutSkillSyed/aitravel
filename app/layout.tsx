import type { Metadata } from 'next';

import { Chrome } from '@/components/chrome';
import { Providers } from '@/components/providers';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { fontBody, fontDisplay, fontMono } from '@/lib/fonts';
import { clientEnv } from '@/lib/env';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_APP_URL),
  title: {
    default: 'aitravel — AI-powered budget travel planner',
    template: '%s · aitravel',
  },
  description:
    'Plan real trips from a budget. Compare flights, trains, buses and hotels. Ranked as Best, Cheapest and Comfort by an AI planner that uses live supplier pricing.',
  applicationName: 'aitravel',
  openGraph: {
    type: 'website',
    siteName: 'aitravel',
    title: 'aitravel — AI-powered budget travel planner',
    description: 'Start with a budget. Get a realistic, bookable itinerary.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fontBody.variable} ${fontDisplay.variable} ${fontMono.variable}`}
    >
      <body className="min-h-screen bg-surface text-ink antialiased">
        <Providers>
          <Chrome header={<SiteHeader />} footer={<SiteFooter />}>
            {children}
          </Chrome>
        </Providers>
      </body>
    </html>
  );
}
