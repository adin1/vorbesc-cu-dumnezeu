import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';

const appBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_PUBLIC_URL?.trim() ||
  'https://vorbeste-cu-dumnezeu.vercel.app';

const tiktokPageUrl = `${appBaseUrl}/tiktok`;

export const metadata: Metadata = {
  title: 'Vorbește cu Dumnezeu - Rugăciuni și versete pentru fiecare zi',
  description: 'Aplicație spirituală cu rugăciuni, versete, jurnal și comunitate.',
  openGraph: {
    title: 'Vorbește cu Dumnezeu - Rugăciuni și versete pentru fiecare zi',
    description: 'Aplicație spirituală cu rugăciuni, versete, jurnal și comunitate.',
    url: tiktokPageUrl,
    images: ['/social/tiktok-preview.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vorbește cu Dumnezeu - Rugăciuni și versete pentru fiecare zi',
    description: 'Aplicație spirituală cu rugăciuni, versete, jurnal și comunitate.',
    images: ['/social/tiktok-preview.png'],
  },
};

export default function TikTokLandingPage() {
  const appUrl = '/?utm_source=tiktok&utm_medium=landing&utm_campaign=profile';
  const premiumUrl = '/premium?utm_source=tiktok&utm_medium=landing&utm_campaign=monetizare';
  const groupUrl = process.env.NEXT_PUBLIC_FACEBOOK_GROUP_URL?.trim();
  const groupUrlWithUtm = groupUrl
    ? `${groupUrl}${groupUrl.includes('?') ? '&' : '?'}utm_source=tiktok&utm_medium=landing&utm_campaign=facebook_group`
    : undefined;

  return (
    <main className="page-grid" style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <SectionHeader
        title="Bine ai venit în Vorbește cu Dumnezeu"
        subtitle="Rugăciuni, versete și planuri spirituale pentru fiecare zi."
      />

      <Card className="premium-hero-card">
        <h3>Un spațiu de liniște, rugăciune și reflecție</h3>
        <p className="muted">
          Aplicația oferă sprijin spiritual zilnic și nu pretinde că vorbește în numele lui Dumnezeu.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="button" href={appUrl}>
            Deschide aplicația
          </Link>
          {groupUrlWithUtm ? (
            <a className="button button-secondary" href={groupUrlWithUtm} target="_blank" rel="noreferrer noopener">
              Intră în comunitatea Facebook
            </a>
          ) : (
            <span className="button button-secondary" aria-disabled="true" style={{ opacity: 0.65, cursor: 'not-allowed' }}>
              Intră în comunitatea Facebook
            </span>
          )}
        </div>
      </Card>

      <Card>
        <h3>Ce găsești aici?</h3>
        <ul>
          <li>rugăciuni</li>
          <li>versetul zilei</li>
          <li>jurnal spiritual</li>
          <li>planuri spirituale</li>
          <li>cereri de rugăciune</li>
        </ul>
      </Card>

      <Card>
        <h3>Poți susține comunitatea prin donații sau Premium.</h3>
        <p className="muted">
          Susținerea este opțională, discretă și orientată către creșterea unei comunități sănătoase.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="button" href={premiumUrl}>
            Susține comunitatea
          </Link>
          <Link className="button button-secondary" href={premiumUrl}>
            Descoperă Premium
          </Link>
          <Link className="button button-secondary" href={premiumUrl}>
            Ajută proiectul să crească
          </Link>
        </div>
      </Card>

      <Card>
        <h3>Comunitatea Facebook</h3>
        <p>Intră în comunitatea noastră pentru rugăciuni, versete și sprijin.</p>
        {groupUrlWithUtm ? (
          <a className="button button-secondary" href={groupUrlWithUtm} target="_blank" rel="noreferrer noopener">
            Intră în comunitatea Facebook
          </a>
        ) : (
          <p className="muted">Adaugă NEXT_PUBLIC_FACEBOOK_GROUP_URL pentru a activa butonul.</p>
        )}
      </Card>
    </main>
  );
}