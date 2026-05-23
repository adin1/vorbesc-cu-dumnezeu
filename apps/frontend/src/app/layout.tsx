import './globals.css';
import type { Metadata } from 'next';
import { Merriweather, Nunito } from 'next/font/google';

const serif = Merriweather({ subsets: ['latin'], variable: '--font-serif' });
const sans = Nunito({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Vorbește cu Dumnezeu',
  description: 'Ghid spiritual creștin cu rugăciuni, versete și reflecție zilnică.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className={`${serif.variable} ${sans.variable}`}>
        {children}
      </body>
    </html>
  );
}
