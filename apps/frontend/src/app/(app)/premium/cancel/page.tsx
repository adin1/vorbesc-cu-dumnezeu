import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function PremiumCancelPage() {
  return (
    <div className="page-grid animate-in">
      <SectionHeader title="Checkout anulat" subtitle="Plata a fost anulată. Poți reveni oricând." />
      <Card>
        <p className="muted">Plata a fost anulată. Poți reveni oricând.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="button" href="/premium">
            Înapoi la Premium
          </Link>
          <Link className="button button-secondary" href="/home">
            Mergi la Acasă
          </Link>
        </div>
      </Card>
    </div>
  );
}
