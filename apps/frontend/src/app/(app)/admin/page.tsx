'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  getAdminMetrics,
  getPendingPrayerRequests,
  me,
  moderatePrayerRequest,
  type AdminMetricsResponse,
  type PrayerRequest,
} from '@/lib/api-client';
import { getToken } from '@/lib/auth-token';

export default function AdminPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<AdminMetricsResponse | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Array<PrayerRequest & { user?: { name: string } }>>([]);
  const [status, setStatus] = useState('Se încarcă...');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesară.');
      router.push('/home');
      return;
    }

    setLoading(true);
    try {
      const user = await me(token);
      if (user.role !== 'ADMIN') {
        router.push('/home');
        return;
      }

      const data = await getAdminMetrics(token);
      setMetrics(data);
      const pending = await getPendingPrayerRequests(token);
      setPendingRequests(pending);
      setStatus('Metricile au fost actualizate.');
    } catch {
      setMetrics(null);
      setStatus('Nu ai acces la zona de administrare sau ceva nu a mers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleModerate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const token = getToken();
    if (!token) {
      return;
    }

    setLoading(true);
    try {
      await moderatePrayerRequest(token, id, { status });
      await load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-grid animate-in">
      <SectionHeader title="Admin" subtitle="Metrici de bază pentru MVP" />
      <Card>
        <Button type="button" variant="secondary" onClick={load} disabled={loading}>
          {loading ? 'Se încarcă...' : 'Refresh metrics'}
        </Button>
        <p className="muted" style={{ marginTop: 8 }}>
          {status}
        </p>
      </Card>
      {metrics ? (
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <div className="card">
              <strong>{metrics.users}</strong>
              <div className="muted">Utilizatori</div>
            </div>
            <div className="card">
              <strong>{metrics.prayers}</strong>
              <div className="muted">Rugăciuni</div>
            </div>
            <div className="card">
              <strong>{metrics.journalEntries}</strong>
              <div className="muted">Intrări jurnal</div>
            </div>
            <div className="card">
              <strong>{metrics.prayerRequests}</strong>
              <div className="muted">Cereri de rugăciune</div>
            </div>
            <div className="card">
              <strong>{metrics.activePlans}</strong>
              <div className="muted">Planuri active</div>
            </div>
            <div className="card">
              <strong>{(metrics.totalDonations / 100).toFixed(2)} RON</strong>
              <div className="muted">Total donații</div>
            </div>
            <div className="card">
              <strong>{metrics.totalSubscriptions}</strong>
              <div className="muted">Total abonamente</div>
            </div>
            <div className="card">
              <strong>{(metrics.estimatedMonthlyRevenue / 100).toFixed(2)} RON</strong>
              <div className="muted">Venit lunar estimat</div>
            </div>
            <div className="card">
              <strong>{metrics.premiumUsers}</strong>
              <div className="muted">Utilizatori premium</div>
            </div>
            <div className="card">
              <strong>{metrics.tiktokVisitors}</strong>
              <div className="muted">Vizitatori TikTok</div>
            </div>
            <div className="card">
              <strong>{metrics.tiktokRegisteredUsers}</strong>
              <div className="muted">Înregistrați din TikTok</div>
            </div>
            <div className="card">
              <strong>{metrics.tiktokPremiumUsers}</strong>
              <div className="muted">Premium din TikTok</div>
            </div>
            <div className="card">
              <strong>{metrics.tiktokUsersStartedPlan}</strong>
              <div className="muted">Din TikTok care au început un plan</div>
            </div>
            <div className="card">
              <strong>{metrics.facebookVisitors}</strong>
              <div className="muted">Vizitatori din Facebook</div>
            </div>
            <div className="card">
              <strong>{metrics.facebookRegisteredUsers}</strong>
              <div className="muted">Înregistrați din Facebook</div>
            </div>
            <div className="card">
              <strong>{metrics.facebookUsersStartedPlan}</strong>
              <div className="muted">Din Facebook care au început un plan</div>
            </div>
            <div className="card">
              <strong>{metrics.facebookUsersPostedPrayerRequest}</strong>
              <div className="muted">Din Facebook care au postat cerere</div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <h4>Surse trafic și monetizare</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              <div className="card">
                <strong>{(metrics.tiktokDonations / 100).toFixed(2)} RON</strong>
                <div className="muted">Donații din TikTok</div>
              </div>
              <div className="card">
                <strong>{(metrics.tiktokToPremiumConversion * 100).toFixed(1)}%</strong>
                <div className="muted">Conversie TikTok către Premium</div>
              </div>
              <div className="card">
                <strong>{(metrics.totalDonations / 100).toFixed(2)} RON</strong>
                <div className="muted">Total donații</div>
              </div>
              <div className="card">
                <strong>{(metrics.estimatedMonthlyRevenue / 100).toFixed(2)} RON</strong>
                <div className="muted">Estimare venit lunar</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <h4>Planuri monetizare active</h4>
            {metrics.activeMonetizationPlans.length ? (
              <ul>
                {metrics.activeMonetizationPlans.map((plan) => (
                  <li key={plan.slug}>
                    {plan.name}: {plan.subscribers} abonați
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Nu există planuri active momentan.</p>
            )}
          </div>
          <p className="muted" style={{ marginTop: 10 }}>
            Ultima actualizare: {new Date(metrics.refreshedAt).toLocaleString('ro-RO')}
          </p>
        </Card>
      ) : null}

      <Card>
        <h3>Moderare cereri de rugăciune</h3>
        {pendingRequests.length ? (
          <ul>
            {pendingRequests.map((request) => (
              <li key={request.id} style={{ marginBottom: 10 }}>
                <div>{request.content}</div>
                <div className="muted">Autor: {request.user?.name || 'Anonim'} | status: {request.status}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Button type="button" variant="secondary" onClick={() => handleModerate(request.id, 'APPROVED')}>
                    Aprobă
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => handleModerate(request.id, 'REJECTED')}>
                    Respinge
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Nu există cereri în așteptare.</p>
        )}
      </Card>
    </div>
  );
}
