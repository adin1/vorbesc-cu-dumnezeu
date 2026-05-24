'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getAdminMetrics, type AdminMetricsResponse } from '@/lib/api-client';
import { getToken } from '@/lib/auth-token';

export default function AdminPage() {
  const [metrics, setMetrics] = useState<AdminMetricsResponse | null>(null);
  const [status, setStatus] = useState('Se încarcă...');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesară.');
      return;
    }

    setLoading(true);
    try {
      const data = await getAdminMetrics(token);
      setMetrics(data);
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
    </div>
  );
}
