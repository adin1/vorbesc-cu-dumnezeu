import Link from 'next/link';
import { Card } from '@/components/ui/Card';

type SocialCtaSectionProps = {
  className?: string;
  source?: 'tiktok' | 'facebook' | 'app';
  medium?: 'landing' | 'bio' | 'video' | 'comment' | 'group' | 'post';
};

export function SocialCtaSection({
  className = '',
  source = 'tiktok',
  medium = 'landing',
}: SocialCtaSectionProps) {
  const premiumUrl = `/premium?utm_source=${source}&utm_medium=${medium}&utm_campaign=monetizare`;

  return (
    <Card className={className}>
      <h3 style={{ marginTop: 0 }}>Susține comunitatea</h3>
      <p className="muted" style={{ marginTop: 0 }}>
        Susținerea este opțională și discretă. Ajută-ne să creștem aplicația fără presiune emoțională.
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
  );
}
