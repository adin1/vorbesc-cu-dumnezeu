import Link from 'next/link';
import { Card } from '@/components/ui/Card';

type PremiumFeatureCardProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
};

export function PremiumFeatureCard({
  title = 'Această funcție face parte din experiența Premium.',
  description = 'Descoperă funcțiile complete pentru o călătorie spirituală susținută, fără reclame agresive.',
  actionLabel = 'Descoperă Premium',
}: PremiumFeatureCardProps) {
  return (
    <Card className="premium-soft-card">
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      <Link className="button" href="/premium">
        {actionLabel}
      </Link>
    </Card>
  );
}
