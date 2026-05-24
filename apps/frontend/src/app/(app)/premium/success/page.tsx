'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getToken } from '@/lib/auth-token';
import { verifyCheckoutSession, type CheckoutVerificationResponse } from '@/lib/api-client';

export default function PremiumSuccessPage() {
  const params = useSearchParams();
  const [result, setResult] = useState<CheckoutVerificationResponse | null>(null);
  const [status, setStatus] = useState('Verificăm plata...');

  useEffect(() => {
    const sessionId = params.get('session_id');
    const token = getToken();

    if (!sessionId || !token) {
      setStatus('Sesiunea de checkout nu a putut fi verificată.');
      return;
    }

    verifyCheckoutSession(token, sessionId)
      .then((data) => {
        setResult(data);
        setStatus('Plata a fost confirmată cu succes. Îți mulțumim!');
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Eroare necunoscută';
        setStatus(`Nu am putut verifica sesiunea: ${message}`);
      });
  }, [params]);

  return (
    <div className="page-grid animate-in">
      <SectionHeader title="Plată confirmată" subtitle="Mulțumim pentru susținere" />
      <Card>
        <p>{status}</p>
        {result ? (
          <>
            <p>
              <strong>Status:</strong> {result.paymentStatus ?? result.status}
            </p>
            <p>
              <strong>Suma:</strong> {result.amountTotal ? `${(result.amountTotal / 100).toFixed(2)} ${(result.currency ?? '').toUpperCase()}` : '-'}
            </p>
          </>
        ) : null}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="button" href="/home">
            Continuă călătoria spirituală
          </Link>
          <Link className="button button-secondary" href="/premium">
            Înapoi la Premium
          </Link>
        </div>
      </Card>
    </div>
  );
}
