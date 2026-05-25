import { hasAnalyticsConsent } from '@/lib/consent';
import { postAcquisition } from '@/lib/api-client';

export type AcquisitionSource = 'tiktok' | 'facebook' | 'direct';

export type AcquisitionPayload = {
  source: AcquisitionSource;
  medium?: string;
  campaign?: string;
  landingPage?: string;
  referrer?: string;
  firstVisitAt?: string;
  userId?: string;
};

export const ACQUISITION_KEY = 'first_acquisition_payload_v2';
const ACQUISITION_POSTED_KEY = 'first_acquisition_posted_v2';

const FIELD_KEYS = {
  source: 'acquisition_source',
  medium: 'acquisition_medium',
  campaign: 'acquisition_campaign',
  firstVisitAt: 'acquisition_first_visit_at',
  landingPage: 'acquisition_landing_page',
};

function normalizeSource(value?: string | null): AcquisitionSource {
  const source = String(value || '').trim().toLowerCase();
  if (source === 'tiktok' || source === 'facebook') {
    return source;
  }
  return 'direct';
}

function persistFields(payload: AcquisitionPayload) {
  window.localStorage.setItem(FIELD_KEYS.source, payload.source);
  window.localStorage.setItem(FIELD_KEYS.medium, payload.medium || '');
  window.localStorage.setItem(FIELD_KEYS.campaign, payload.campaign || '');
  window.localStorage.setItem(FIELD_KEYS.firstVisitAt, payload.firstVisitAt || '');
  window.localStorage.setItem(FIELD_KEYS.landingPage, payload.landingPage || '');
}

export function getStoredAcquisition(): AcquisitionPayload | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(ACQUISITION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AcquisitionPayload>;
    return {
      source: normalizeSource(parsed.source),
      medium: parsed.medium || undefined,
      campaign: parsed.campaign || undefined,
      landingPage: parsed.landingPage || undefined,
      referrer: parsed.referrer || undefined,
      firstVisitAt: parsed.firstVisitAt || undefined,
      userId: parsed.userId || undefined,
    };
  } catch {
    return null;
  }
}

export function captureFirstAcquisition() {
  if (typeof window === 'undefined') {
    return null;
  }

  const existing = getStoredAcquisition();
  if (existing) {
    persistFields(existing);
    return existing;
  }

  const params = new URLSearchParams(window.location.search);
  const payload: AcquisitionPayload = {
    source: normalizeSource(params.get('utm_source')),
    medium: params.get('utm_medium') || undefined,
    campaign: params.get('utm_campaign') || undefined,
    landingPage: window.location.pathname,
    referrer: document.referrer || undefined,
    firstVisitAt: new Date().toISOString(),
  };

  window.localStorage.setItem(ACQUISITION_KEY, JSON.stringify(payload));
  persistFields(payload);
  return payload;
}

export async function postAcquisitionIfAllowed(payload?: AcquisitionPayload | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!hasAnalyticsConsent()) {
    return;
  }

  if (window.localStorage.getItem(ACQUISITION_POSTED_KEY) === '1') {
    return;
  }

  const candidate = payload ?? captureFirstAcquisition();
  if (!candidate) {
    return;
  }

  await postAcquisition(candidate);
  window.localStorage.setItem(ACQUISITION_POSTED_KEY, '1');
}