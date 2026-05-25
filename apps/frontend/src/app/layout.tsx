import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Merriweather, Nunito } from 'next/font/google';
import { AcquisitionTracker } from '@/components/ui/AcquisitionTracker';
import { CookieConsentBanner } from '@/components/ui/CookieConsentBanner';
import { ServiceWorkerRegister } from '@/components/ui/ServiceWorkerRegister';

const serif = Merriweather({ subsets: ['latin'], variable: '--font-serif' });
const sans = Nunito({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      process.env.NEXT_PUBLIC_APP_PUBLIC_URL?.trim() ||
      'https://vorbeste-cu-dumnezeu.vercel.app',
  ),
  title: 'Vorbește cu Dumnezeu',
  description: 'Ghid spiritual creștin cu rugăciuni, versete și reflecție zilnică.',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#1f3a5f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className={`${serif.variable} ${sans.variable}`}>
        <AcquisitionTracker />
        <ServiceWorkerRegister />
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
