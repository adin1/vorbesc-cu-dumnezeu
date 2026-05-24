'use client';

import { useMemo, useState } from 'react';
import { Button } from './Button';
import { getConsentPreferences, saveConsentPreferences, type ConsentPreferences } from '@/lib/consent';

export function CookieConsentBanner() {
  const existing = useMemo(() => getConsentPreferences(), []);
  const [visible, setVisible] = useState(!existing);
  const [customize, setCustomize] = useState(false);
  const [consent, setConsent] = useState<ConsentPreferences>(
    existing ?? { analytics: false, marketing: false, functional: true },
  );

  if (!visible) {
    return null;
  }

  const acceptAll = () => {
    saveConsentPreferences({ analytics: true, marketing: true, functional: true });
    setVisible(false);
  };

  const rejectAll = () => {
    saveConsentPreferences({ analytics: false, marketing: false, functional: true });
    setVisible(false);
  };

  const saveCustom = () => {
    saveConsentPreferences(consent);
    setVisible(false);
  };

  return (
    <div
      className="card"
      style={{ position: 'fixed', left: 16, right: 16, bottom: 16, zIndex: 40, maxWidth: 780, margin: '0 auto' }}
    >
      <h3 style={{ marginTop: 0 }}>Setări cookie și confidențialitate</h3>
      <p className="muted">
        Folosim doar date minime pentru funcționare, analytics și marketing. Poți accepta, respinge sau personaliza.
      </p>

      {customize ? (
        <div className="form-grid" style={{ marginTop: 8 }}>
          <label>
            <input
              type="checkbox"
              checked={consent.functional}
              onChange={(event) =>
                setConsent((prev) => ({ ...prev, functional: event.target.checked || true }))
              }
            />
            Functional (necesar pentru funcționarea aplicației)
          </label>
          <label>
            <input
              type="checkbox"
              checked={consent.analytics}
              onChange={(event) => setConsent((prev) => ({ ...prev, analytics: event.target.checked }))}
            />
            Analytics
          </label>
          <label>
            <input
              type="checkbox"
              checked={consent.marketing}
              onChange={(event) => setConsent((prev) => ({ ...prev, marketing: event.target.checked }))}
            />
            Marketing
          </label>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
        <Button type="button" variant="secondary" onClick={acceptAll}>
          Accept
        </Button>
        <Button type="button" variant="secondary" onClick={rejectAll}>
          Reject
        </Button>
        <Button type="button" variant="secondary" onClick={() => setCustomize((prev) => !prev)}>
          Personalize
        </Button>
        {customize ? (
          <Button type="button" onClick={saveCustom}>
            Salvează preferințele
          </Button>
        ) : null}
      </div>
    </div>
  );
}
