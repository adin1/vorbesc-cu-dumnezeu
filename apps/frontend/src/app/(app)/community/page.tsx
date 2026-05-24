'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FacebookGroupCard } from '@/components/ui/FacebookGroupCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  createPrayerRequest,
  getPrayerRequests,
  reportPrayerRequest,
  supportPrayerRequest,
  type PrayerRequest,
} from '@/lib/api-client';
import { getToken } from '@/lib/auth-token';

export default function CommunityPage() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');

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

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      await createPrayerRequest(token, { content, anonymous: true });
      setContent('');
      setStatus('Cererea de rugaciune a fost publicata.');
      await loadRequests();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
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
      <FacebookGroupCard
        title="Vorbeste cu Dumnezeu - Comunitate de rugaciune si sprijin"
        description="Intra in grupul oficial pentru cereri de rugaciune, versete zilnice, incurajare si reflexie in pace."
      />
      {process.env.NEXT_PUBLIC_FACEBOOK_GROUP_URL ? (
        <Card>
          <h3>Acces rapid catre grup</h3>
          <a
            className="button facebook-group-button facebook-group-button-large"
            href={process.env.NEXT_PUBLIC_FACEBOOK_GROUP_URL}
            target="_blank"
            rel="noreferrer noopener"
          >
            Intra in grupul de rugaciune
          </a>
        </Card>
      ) : null}
      <Card>
        <h3>Publica o cerere de rugaciune</h3>
        <form className="form-grid" onSubmit={handleCreate}>
          <label>
            Cererea ta (anonim)
            <textarea
              rows={4}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              minLength={3}
              required
            />
          </label>
          <Button type="submit">Publica cererea</Button>
        </form>
      </Card>
      <Card>
        <h3>Cereri din API</h3>
        {requests.length ? (
          <ul>
            {requests.slice(0, 8).map((request) => (
              <li key={request.id} style={{ marginBottom: 12 }}>
                <div>{request.content}</div>
                <div className="muted">
                  {request.supports.length} sustineri | status: {request.status}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Button type="button" variant="secondary" onClick={() => handleSupport(request.id)}>
                    Ma rog pentru tine
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => handleReport(request.id)}>
                    Raporteaza
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Nu există încă cereri active.</p>
        )}
      </Card>
      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}
