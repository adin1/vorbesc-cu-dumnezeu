export type ConsentPreferences = {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
};

const CONSENT_KEY = 'cookie_consent_preferences_v1';

export function getConsentPreferences(): ConsentPreferences | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(CONSENT_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    return {
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      functional: parsed.functional !== false,
    };
  } catch {
    return null;
  }
}

export function saveConsentPreferences(preferences: ConsentPreferences) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
}

export function hasAnalyticsConsent() {
  return getConsentPreferences()?.analytics === true;
}
