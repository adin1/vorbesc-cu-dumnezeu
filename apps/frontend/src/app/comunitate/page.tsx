import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function ComunitatePublicPage() {
  const groupUrl = process.env.NEXT_PUBLIC_FACEBOOK_GROUP_URL?.trim();
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_PUBLIC_URL?.trim() ||
    'https://vorbeste-cu-dumnezeu.vercel.app';

  return (
    <main className="page-grid" style={{ maxWidth: 920, margin: '0 auto', padding: 24 }}>
      <SectionHeader
        title="Comunitatea Vorbește cu Dumnezeu"
        subtitle="Un loc pentru rugăciune, liniște și sprijin sufletesc."
      />

      <Card className="premium-hero-card">
        <h3>O comunitate reală, caldă și autentică</h3>
        <p>
          În aplicația Vorbește cu Dumnezeu găsești ghid spiritual, jurnal, rugăciuni și planuri de reflecție.
          În grupul Facebook continuăm împreună prin rugăciune, versete și sprijin reciproc.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {groupUrl ? (
            <a className="button" href={groupUrl} target="_blank" rel="noreferrer noopener">
              Intră în comunitate
            </a>
          ) : (
            <span className="button" aria-disabled="true" style={{ opacity: 0.65, cursor: 'not-allowed' }}>
              Intră în comunitate
            </span>
          )}
          <a className="button button-secondary" href={appUrl} target="_blank" rel="noreferrer noopener">
            Deschide aplicația
          </a>
        </div>
        {!groupUrl ? (
          <p className="muted" style={{ marginTop: 10 }}>
            Linkul grupului Facebook nu este încă setat în variabilele de mediu.
          </p>
        ) : null}
      </Card>

      <Card>
        <h3>Ce găsești în aplicație</h3>
        <ul>
          <li>Versetul zilei și ghid spiritual blând</li>
          <li>Rugăciuni pe categorii și reflecții zilnice</li>
          <li>Jurnal spiritual personal</li>
          <li>Planuri spirituale pentru ritmul tău</li>
        </ul>
        <Link className="button button-secondary" href="/">
          Mergi la autentificare
        </Link>
      </Card>
    </main>
  );
}