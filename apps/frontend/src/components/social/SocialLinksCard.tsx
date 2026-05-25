'use client';

import { Card } from '@/components/ui/Card';
import { postSocialActivity } from '@/lib/api-client';
import { hasAnalyticsConsent } from '@/lib/consent';
import { appendUtm, socialConfig } from '@/lib/social-config';

type SocialLinksCardProps = {
  className?: string;
  campaign?: string;
};

export function SocialLinksCard({ className = '', campaign = 'social_links_card' }: SocialLinksCardProps) {
  const tiktokUrl = appendUtm(socialConfig.urls.tiktok, socialConfig.utm.tiktok.bio);
  const facebookUrl = socialConfig.urls.facebook
    ? appendUtm(socialConfig.urls.facebook, socialConfig.utm.facebook.group)
    : '';
  const appUrl = appendUtm(`${socialConfig.urls.app}/`, socialConfig.utm.tiktok.landing);

  const track = (platform: 'tiktok' | 'facebook', type: 'clicked_tiktok_link' | 'clicked_facebook_link') => {
    if (!socialConfig.tracking.enabled || !hasAnalyticsConsent()) {
      return;
    }

    postSocialActivity({
      platform,
      type,
      source: platform,
      campaign,
      metadata: {
        path: window.location.pathname,
      },
    }).catch(() => undefined);
  };

  return (
    <Card className={className}>
      <h3 style={{ marginTop: 0 }}>Social links</h3>
      <p className="muted" style={{ marginTop: 0 }}>
        Rămâi aproape de comunitate prin TikTok, Facebook și aplicația principală.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a
          className="button"
          href={tiktokUrl}
          target="_blank"
          rel="noreferrer noopener"
          onClick={() => track('tiktok', 'clicked_tiktok_link')}
        >
          Urmărește-ne pe TikTok
        </a>
        <a
          className="button button-secondary"
          href={facebookUrl || '#'}
          target="_blank"
          rel="noreferrer noopener"
          aria-disabled={!facebookUrl}
          onClick={(event) => {
            if (!facebookUrl) {
              event.preventDefault();
              return;
            }
            track('facebook', 'clicked_facebook_link');
          }}
        >
          Intră în comunitatea Facebook
        </a>
        <a className="button button-secondary" href={appUrl}>
          Deschide aplicația
        </a>
      </div>
    </Card>
  );
}
