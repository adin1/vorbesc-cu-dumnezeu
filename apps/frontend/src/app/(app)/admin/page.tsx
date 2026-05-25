'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  exportSocialGrowthCsv,
  getAdminMetrics,
  getSocialGrowthDashboard,
  getPendingPrayerRequests,
  me,
  moderatePrayerRequest,
  type AdminMetricsResponse,
  type PrayerRequest,
  type SocialGrowthDashboard,
} from '@/lib/api-client';
import { getToken } from '@/lib/auth-token';

export default function AdminPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<AdminMetricsResponse | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Array<PrayerRequest & { user?: { name: string } }>>([]);
  const [socialDashboard, setSocialDashboard] = useState<SocialGrowthDashboard | null>(null);
  const [status, setStatus] = useState('Se încarcă...');
  const [socialStatus, setSocialStatus] = useState('Se încarcă...');
  const [loading, setLoading] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

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
      const social = await getSocialGrowthDashboard(token);
      setSocialDashboard(social);
      setStatus('Metricile au fost actualizate.');
      setSocialStatus('Dashboard social actualizat.');
    } catch {
      setMetrics(null);
      setSocialDashboard(null);
      setStatus('Nu ai acces la zona de administrare sau ceva nu a mers.');
      setSocialStatus('Dashboard social indisponibil.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    const token = getToken();
    if (!token) {
      return;
    }

    setExportingCsv(true);
    try {
      const csv = await exportSocialGrowthCsv(token);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `social-growth-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setSocialStatus('CSV exportat cu succes.');
    } catch {
      setSocialStatus('Exportul CSV a eșuat.');
    } finally {
      setExportingCsv(false);
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

      {socialDashboard ? (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0 }}>Social Media & Growth</h3>
            <Button type="button" variant="secondary" onClick={handleExportCsv} disabled={exportingCsv}>
              {exportingCsv ? 'Se exportă...' : 'Export CSV'}
            </Button>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>{socialStatus}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <div className="card">
              <strong>{socialDashboard.tiktok.visitors}</strong>
              <div className="muted">TikTok visitors</div>
            </div>
            <div className="card">
              <strong>{socialDashboard.tiktok.registrations}</strong>
              <div className="muted">TikTok registrations</div>
            </div>
            <div className="card">
              <strong>{socialDashboard.facebook.visitors}</strong>
              <div className="muted">Facebook visitors</div>
            </div>
            <div className="card">
              <strong>{socialDashboard.facebook.registrations}</strong>
              <div className="muted">Facebook registrations</div>
            </div>
            <div className="card">
              <strong>{socialDashboard.app.dau}</strong>
              <div className="muted">DAU</div>
            </div>
            <div className="card">
              <strong>{socialDashboard.app.wau}</strong>
              <div className="muted">WAU</div>
            </div>
            <div className="card">
              <strong>{socialDashboard.activity.totalEvents}</strong>
              <div className="muted">Evenimente sociale</div>
            </div>
            <div className="card">
              <strong>{(socialDashboard.app.retention * 100).toFixed(1)}%</strong>
              <div className="muted">Retenție WAU/Total</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <h4>Funnel conversion</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
              <div className="card">
                <strong>TikTok</strong>
                <div className="muted">
                  {socialDashboard.charts.conversionFunnel.tiktok.visitors} vizitatori →{' '}
                  {socialDashboard.charts.conversionFunnel.tiktok.registrations} conturi →{' '}
                  {socialDashboard.charts.conversionFunnel.tiktok.startedPlans} planuri →{' '}
                  {socialDashboard.charts.conversionFunnel.tiktok.premium} premium
                </div>
              </div>
              <div className="card">
                <strong>Facebook</strong>
                <div className="muted">
                  {socialDashboard.charts.conversionFunnel.facebook.visitors} vizitatori →{' '}
                  {socialDashboard.charts.conversionFunnel.facebook.registrations} conturi →{' '}
                  {socialDashboard.charts.conversionFunnel.facebook.startedPlans} planuri →{' '}
                  {socialDashboard.charts.conversionFunnel.facebook.premium} premium
                </div>
              </div>
            </div>
          </div>

          <p className="muted" style={{ marginTop: 10 }}>
            Generat la: {new Date(socialDashboard.generatedAt).toLocaleString('ro-RO')}
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
