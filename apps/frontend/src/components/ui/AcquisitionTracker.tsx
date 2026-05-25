'use client';

import { useEffect } from 'react';
import { captureFirstAcquisition, postAcquisitionIfAllowed } from '@/lib/acquisition';

export function AcquisitionTracker() {
  useEffect(() => {
    const payload = captureFirstAcquisition();
    postAcquisitionIfAllowed(payload).catch(() => undefined);

    const onConsentUpdated = () => {
      postAcquisitionIfAllowed(captureFirstAcquisition()).catch(() => undefined);
    };

    window.addEventListener('consent-preferences-updated', onConsentUpdated);
    return () => {
      window.removeEventListener('consent-preferences-updated', onConsentUpdated);
    };
  }, []);

  return null;
}