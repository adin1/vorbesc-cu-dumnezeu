import { Card } from '@/components/ui/Card';

type FacebookCommunityCardProps = {
  className?: string;
};

export function FacebookCommunityCard({ className = '' }: FacebookCommunityCardProps) {
  const groupUrl = process.env.NEXT_PUBLIC_FACEBOOK_GROUP_URL?.trim();
  const appUrl =
    process.env.NEXT_PUBLIC_APP_PUBLIC_URL?.trim() ||
    'https://vorbeste-cu-dumnezeu.vercel.app';

  return (
    <Card className={`facebook-community-card ${className}`.trim()}>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>Comunitatea Vorbește cu Dumnezeu</h3>
      <p className="muted" style={{ marginTop: 0 }}>
        Intră în grupul nostru pentru rugăciuni, versete și sprijin.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a
          className="button"
          href={groupUrl || '#'}
          target="_blank"
          rel="noreferrer noopener"
          aria-disabled={!groupUrl}
          onClick={(event) => {
            if (!groupUrl) {
              event.preventDefault();
            }
          }}
        >
          Intră în comunitate
        </a>
        <a className="button button-secondary" href={appUrl} target="_blank" rel="noreferrer noopener">
          Deschide aplicația
        </a>
      </div>

      {!groupUrl ? (
        <p className="muted" style={{ marginBottom: 0, marginTop: 10 }}>
          Linkul grupului Facebook nu este configurat încă.
        </p>
      ) : null}
    </Card>
  );
}