'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { postSocialActivity } from '@/lib/api-client';
import { hasAnalyticsConsent } from '@/lib/consent';
import { appendUtm, socialConfig } from '@/lib/social-config';
import { consumeDailySocialNudge } from '@/lib/social-nudge';

type FacebookCommunityCardProps = {
  className?: string;
};

export function FacebookCommunityCard({ className = '' }: FacebookCommunityCardProps) {
  const [visible, setVisible] = useState(false);
  const groupUrl = socialConfig.urls.facebook
    ? appendUtm(socialConfig.urls.facebook, socialConfig.utm.facebook.group)
    : '';
  const appLanding = appendUtm(`${socialConfig.urls.app}/`, socialConfig.utm.facebook.landing);

  const trackClick = () => {
    if (!socialConfig.tracking.enabled || !hasAnalyticsConsent()) {
      return;
    }

    postSocialActivity({
      platform: 'facebook',
      type: 'clicked_facebook_link',
      source: 'facebook',
      campaign: 'facebook_community_card',
      metadata: { path: window.location.pathname },
    }).catch(() => undefined);
  };

  useEffect(() => {
    setVisible(consumeDailySocialNudge(2));
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <Card className={`facebook-community-card ${className}`.trim()}>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>Comunitatea Vorbește cu Dumnezeu</h3>
      <p className="muted" style={{ marginTop: 0 }}>
        Intră în comunitate pentru rugăciuni, versete, reflecții și sprijin sufletesc.
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
              return;
            }
            trackClick();
          }}
        >
          {socialConfig.ctas.joinFacebook}
        </a>
        <a className="button button-secondary" href={appLanding}>
          {socialConfig.ctas.openApp}
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
