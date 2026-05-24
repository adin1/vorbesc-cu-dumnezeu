import './globals.css';
import type { Metadata } from 'next';
import { Merriweather, Nunito } from 'next/font/google';
import { ServiceWorkerRegister } from '@/components/ui/ServiceWorkerRegister';

const serif = Merriweather({ subsets: ['latin'], variable: '--font-serif' });
const sans = Nunito({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Vorbește cu Dumnezeu',
  description: 'Ghid spiritual creștin cu rugăciuni, versete și reflecție zilnică.',
  themeColor: '#1f3a5f',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className={`${serif.variable} ${sans.variable}`}>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
