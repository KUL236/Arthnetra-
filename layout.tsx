import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/layout/Providers';

export const metadata: Metadata = {
  title: "ArthNetra — India's AI Financial Intelligence Platform",
  description:
    'ArthNetra gives you real-time NSE/BSE market data, AI-powered financial guidance, sector analysis, and investment insights in Hindi & English. Free for Indian investors.',
  manifest: '/manifest.json',
  keywords: [
    'Indian stock market', 'NSE live data', 'BSE Sensex', 'NIFTY 50', 'AI financial advisor India',
    'SIP calculator', 'mutual funds India', 'investment guidance Hindi', 'ArthNetra',
    'share market India', 'sector analysis NSE', 'stock market AI',
  ],
  authors: [{ name: 'ArthNetra' }],
  creator: 'ArthNetra',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'ArthNetra — AI Finance Platform for India',
    description: 'Real-time NIFTY/SENSEX data, sector analysis, and AI financial guidance in Hindi & English',
    type: 'website',
    url: 'https://arthnetra.netlify.app',
    siteName: 'ArthNetra',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ArthNetra — AI Finance for India',
    description: 'Real-time market data & AI financial guidance in Hindi & English',
  },
  alternates: {
    canonical: 'https://arthnetra.netlify.app',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+Devanagari:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
