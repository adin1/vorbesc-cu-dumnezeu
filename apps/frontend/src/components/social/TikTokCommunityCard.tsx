'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { postSocialActivity } from '@/lib/api-client';
import { hasAnalyticsConsent } from '@/lib/consent';
import { appendUtm, socialConfig } from '@/lib/social-config';
import { consumeDailySocialNudge } from '@/lib/social-nudge';

type TikTokCommunityCardProps = {
  className?: string;
};

export function TikTokCommunityCard({ className = '' }: TikTokCommunityCardProps) {
  const [visible, setVisible] = useState(false);
  const tiktokUrl = socialConfig.urls.tiktok;
  const groupUrl = socialConfig.urls.facebook
    ? appendUtm(socialConfig.urls.facebook, socialConfig.utm.tiktok.landing)
    : '';
  const premiumUrl = `/premium?${socialConfig.utm.tiktok.landing.replace('campaign=profile', 'campaign=monetizare')}`;

  const track = (type: 'clicked_tiktok_link' | 'clicked_facebook_link') => {
    if (!socialConfig.tracking.enabled || !hasAnalyticsConsent()) {
      return;
    }

    postSocialActivity({
      platform: type === 'clicked_tiktok_link' ? 'tiktok' : 'facebook',
      type,
      source: type === 'clicked_tiktok_link' ? 'tiktok' : 'facebook',
      campaign: 'community_card',
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
    <Card className={`tiktok-community-card ${className}`.trim()}>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>Social Hub: TikTok + Facebook</h3>
      <p className="muted" style={{ marginTop: 0 }}>
        Descoperă clipuri zilnice, intră în comunitatea Facebook și continuă planul spiritual în aplicație.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a
          className="button"
          href={tiktokUrl}
          target="_blank"
          rel="noreferrer noopener"
          onClick={() => track('clicked_tiktok_link')}
        >
          {socialConfig.ctas.followTikTok}
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
              return;
            }
            track('clicked_facebook_link');
          }}
        >
          {socialConfig.ctas.joinFacebook}
        </a>
        <a className="button button-secondary" href={premiumUrl}>
          {socialConfig.ctas.support}
        </a>
      </div>

      <p className="muted" style={{ marginBottom: 0, marginTop: 10 }}>
        Monetizare discretă: donații și Premium, fără presiune emoțională.
      </p>
    </Card>
  );
}
