import { Card } from '@/components/ui/Card';

type FacebookGroupCardProps = {
  title?: string;
  description?: string;
  showLargeButton?: boolean;
};

export function FacebookGroupCard({
  title = 'Comunitatea noastra',
  description = 'Spatiu cald de rugaciune, incurajare si sprijin spiritual in fiecare zi.',
  showLargeButton = false,
}: FacebookGroupCardProps) {
  const groupUrl = process.env.NEXT_PUBLIC_FACEBOOK_GROUP_URL?.trim();

  return (
    <Card className="facebook-group-card">
      <div className="facebook-group-header">
        <span className="facebook-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img" focusable="false">
            <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.88 3.78-3.88 1.1 0 2.25.2 2.25.2v2.46H15.2c-1.25 0-1.64.78-1.64 1.57V12h2.8l-.45 2.89h-2.35v6.99A10 10 0 0 0 22 12" />
          </svg>
        </span>
        <div>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>{title}</h3>
          <p className="muted" style={{ marginTop: 0 }}>{description}</p>
        </div>
      </div>

      {groupUrl ? (
        <a
          className={`button facebook-group-button${showLargeButton ? ' facebook-group-button-large' : ''}`}
          href={groupUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          Intra in grupul de rugaciune
        </a>
      ) : (
        <p className="muted" style={{ marginBottom: 0 }}>
          Grupul Facebook va fi disponibil in curand.
        </p>
      )}
    </Card>
  );
}
