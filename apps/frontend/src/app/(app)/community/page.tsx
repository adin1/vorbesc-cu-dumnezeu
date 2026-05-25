'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Disclaimer } from '@/components/ui/Disclaimer';
import { FacebookCommunityCard } from '@/components/ui/FacebookCommunityCard';
import { PrayerRequestCard } from '@/components/ui/PrayerRequestCard';
import { PrayerRequestForm } from '@/components/ui/PrayerRequestForm';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TikTokCommunityCard } from '@/components/social/TikTokCommunityCard';
import {
  createPrayerRequestWithMode,
  getPrayerRequests,
  reportPrayerRequest,
  supportPrayerRequest,
  type PrayerRequest,
} from '@/lib/api-client';
import { getToken } from '@/lib/auth-token';

export default function CommunityPage() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRequests = async () => {
    const token = getToken();
    if (!token) {
      return;
    }

    getPrayerRequests(token).then(setRequests).catch(() => setRequests([]));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCreate = async (payload: {
    content: string;
    anonymous: boolean;
    publishMode: 'APP_ONLY' | 'FACEBOOK_PREP';
  }) => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      setSubmitting(true);
      await createPrayerRequestWithMode(token, payload);
      setStatus('Cererea de rugaciune a fost trimisa spre moderare.');
      await loadRequests();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupport = async (id: string) => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      await supportPrayerRequest(token, id);
      setStatus('Ai sustinut aceasta cerere in rugaciune.');
      await loadRequests();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  const handleReport = async (id: string) => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      await reportPrayerRequest(token, id, 'Continut nepotrivit raportat din UI');
      setStatus('Cererea a fost raportata pentru moderare.');
      await loadRequests();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  return (
    <div className="page-grid animate-in">
      <SectionHeader title="Comunitate" subtitle="Cereri de rugaciune, sprijin spiritual si legatura cu grupul oficial" />
      <Card>
        <h3>Mesaj inspirational</h3>
        <p>
          "Unde sunt doi sau trei adunati in Numele Meu, acolo sunt si Eu in mijlocul lor."
        </p>
        <p className="muted" style={{ marginTop: 0 }}>Matei 18:20</p>
      </Card>
      <FacebookCommunityCard />
      <TikTokCommunityCard />
      <Card>
        <h3>Trimite o cerere de rugaciune</h3>
        <PrayerRequestForm loading={submitting} onSubmit={handleCreate} />
      </Card>
      <Card>
        <h3>Cereri aprobate</h3>
        {requests.length ? (
          <ul>
            {requests.slice(0, 8).map((request) => (
              <PrayerRequestCard
                key={request.id}
                request={request}
                onSupport={handleSupport}
                onReport={handleReport}
              />
            ))}
          </ul>
        ) : (
          <p className="muted">Nu există încă cereri active.</p>
        )}
      </Card>
      {status ? <p className="muted">{status}</p> : null}
      <Disclaimer />
    </div>
  );
}
