import { Card } from '@/components/ui/Card';

type TikTokCommunityCardProps = {
  className?: string;
};

export function TikTokCommunityCard({ className = '' }: TikTokCommunityCardProps) {
  const tiktokUrl =
    process.env.NEXT_PUBLIC_TIKTOK_URL?.trim() ||
    'https://www.tiktok.com/@vorbestecudumnezeu';
  const groupUrl = process.env.NEXT_PUBLIC_FACEBOOK_GROUP_URL?.trim();
  const premiumUrl = '/premium?utm_source=tiktok&utm_medium=landing&utm_campaign=monetizare';

  return (
    <Card className={`tiktok-community-card ${className}`.trim()}>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>Comunitatea noastră TikTok și Facebook</h3>
      <p className="muted" style={{ marginTop: 0 }}>
        Urmărește-ne pentru rugăciuni zilnice, versete și sprijin sufletesc.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a className="button" href={tiktokUrl} target="_blank" rel="noreferrer noopener">
          Urmărește-ne pe TikTok
        </a>
        <a
          className="button button-secondary"
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
          Intră în comunitatea Facebook
        </a>
        <a className="button button-secondary" href={premiumUrl}>
          Susține comunitatea
        </a>
      </div>

      <p className="muted" style={{ marginBottom: 0, marginTop: 10 }}>
        Poți susține comunitatea prin donații sau Premium, fără presiune și fără promisiuni nerealiste.
      </p>
    </Card>
  );
}