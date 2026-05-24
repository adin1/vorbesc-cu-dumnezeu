'use client';

import { Button } from './Button';
import { FacebookShareBox } from './FacebookShareBox';
import type { PrayerRequest } from '@/lib/api-client';

type PrayerRequestCardProps = {
  request: PrayerRequest;
  onSupport: (id: string) => Promise<void>;
  onReport: (id: string) => Promise<void>;
};

export function PrayerRequestCard({ request, onSupport, onReport }: PrayerRequestCardProps) {
  return (
    <li style={{ marginBottom: 12 }}>
      <div>{request.content}</div>
      <div className="muted">
        {request.supports.length} susțineri | status: {request.status}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <Button type="button" variant="secondary" onClick={() => onSupport(request.id)}>
          Mă rog pentru tine
        </Button>
        <Button type="button" variant="secondary" onClick={() => onReport(request.id)}>
          Raportează
        </Button>
      </div>
      {request.shareTarget === 'FACEBOOK_PREP' && request.facebookShareText ? (
        <FacebookShareBox text={request.facebookShareText} />
      ) : null}
    </li>
  );
}
