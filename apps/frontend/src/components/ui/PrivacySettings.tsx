'use client';

import { useEffect, useState } from 'react';
import { Button } from './Button';
import { getConsentPreferences, saveConsentPreferences, type ConsentPreferences } from '@/lib/consent';

export function PrivacySettings() {
  const [consent, setConsent] = useState<ConsentPreferences>({ analytics: false, marketing: false, functional: true });
  const [status, setStatus] = useState('');

  useEffect(() => {
    const existing = getConsentPreferences();
    if (existing) {
      setConsent(existing);
    }
  }, []);

  const save = () => {
    saveConsentPreferences({ ...consent, functional: true });
    setStatus('Preferințele de confidențialitate au fost salvate.');
  };

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <h3 style={{ marginTop: 0 }}>Privacy settings</h3>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={consent.analytics}
          onChange={(event) => setConsent((prev) => ({ ...prev, analytics: event.target.checked }))}
        />
        Analytics consent
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={consent.marketing}
          onChange={(event) => setConsent((prev) => ({ ...prev, marketing: event.target.checked }))}
        />
        Marketing consent
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked disabled />
        Functional consent (necesar)
      </label>
      <div style={{ marginTop: 10 }}>
        <Button type="button" variant="secondary" onClick={save}>
          Salvează setările
        </Button>
      </div>
      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}
