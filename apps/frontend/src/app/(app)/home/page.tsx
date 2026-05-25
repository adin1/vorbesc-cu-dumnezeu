'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Disclaimer } from '@/components/ui/Disclaimer';
import { FacebookCommunityCard } from '@/components/ui/FacebookCommunityCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TikTokCommunityCard } from '@/components/social/TikTokCommunityCard';
import {
  clearDashboardCache,
  clearDashboardCacheAll,
  getDashboard,
  getDashboardCachePermissions,
  getDashboardCacheStats,
  getSpiritualDaily,
  me,
  resetDashboardCacheStats,
  type DashboardCacheStats,
  type DashboardResponse,
  type JournalTrendResponse,
  type ProfileStats,
} from '@/lib/api-client';
import { getToken } from '@/lib/auth-token';

export default function HomePage() {
  const diagnosticsEnabled =
    process.env.NEXT_PUBLIC_ENABLE_DASHBOARD_DIAGNOSTICS === 'true' ||
    process.env.NODE_ENV !== 'production';
  const diagnosticsForcedByFlag = process.env.NEXT_PUBLIC_ENABLE_DASHBOARD_DIAGNOSTICS === 'true';

  const [welcome, setWelcome] = useState('Bine ai revenit!');
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [trend, setTrend] = useState<JournalTrendResponse | null>(null);
  const [latestNotifications, setLatestNotifications] = useState<DashboardResponse['latestNotifications']>([]);
  const [recommendation, setRecommendation] = useState<DashboardResponse['recommendation'] | null>(null);
  const [quickActions, setQuickActions] = useState<DashboardResponse['quickActions']>([]);
  const [cacheStats, setCacheStats] = useState<DashboardCacheStats | null>(null);
  const [cacheBusy, setCacheBusy] = useState(false);
  const [canClearAllCache, setCanClearAllCache] = useState(false);
  const [verseOfDay, setVerseOfDay] = useState('Filipeni 4:6-7 - Nu vă îngrijorați de nimic.');
  const [prayerOfDay, setPrayerOfDay] = useState(
    'Doamne, dă-mi pace în inimă și claritate în gânduri pentru ziua aceasta.',
  );

  const refreshCacheStats = (token: string) => {
    return getDashboardCacheStats(token)
      .then((statsData) => setCacheStats(statsData))
      .catch(() => setCacheStats(null));
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    me(token)
      .then((user) => setWelcome(`Bine ai revenit, ${user.name}!`))
      .catch(() => setWelcome('Bine ai revenit!'));

    getDashboard(token, 7)
      .then((data) => {
        setStats(data.stats);
        setTrend(data.trend);
        setLatestNotifications(data.latestNotifications);
        setRecommendation(data.recommendation);
        setQuickActions(data.quickActions);
      })
      .catch(() => {
        setStats(null);
        setTrend(null);
        setLatestNotifications([]);
        setRecommendation(null);
        setQuickActions([]);
      });

    if (diagnosticsEnabled) {
      refreshCacheStats(token);
      getDashboardCachePermissions(token)
        .then((perm) => setCanClearAllCache(perm.canClearAll))
        .catch(() => setCanClearAllCache(false));
    }

    getSpiritualDaily(token)
      .then((daily) => {
        setVerseOfDay(daily.verseOfDay);
        setPrayerOfDay(daily.prayerOfDay);
      })
      .catch(() => undefined);
  }, []);

  const handleResetCacheStats = async () => {
    const token = getToken();
    if (!token) {
      return;
    }

    setCacheBusy(true);
    try {
      const data = await resetDashboardCacheStats(token);
      setCacheStats(data);
    } catch {
      setCacheStats(null);
    } finally {
      setCacheBusy(false);
    }
  };

  const handleRefreshCacheStats = async () => {
    const token = getToken();
    if (!token) {
      return;
    }

    setCacheBusy(true);
    try {
      await refreshCacheStats(token);
    } finally {
      setCacheBusy(false);
    }
  };

  const handleClearDashboardCache = async () => {
    const token = getToken();
    if (!token) {
      return;
    }

    setCacheBusy(true);
    try {
      const result = await clearDashboardCache(token);
      setCacheStats(result.stats);
      const refreshedDashboard = await getDashboard(token, 7);
      setStats(refreshedDashboard.stats);
      setTrend(refreshedDashboard.trend);
      setLatestNotifications(refreshedDashboard.latestNotifications);
      setRecommendation(refreshedDashboard.recommendation);
      setQuickActions(refreshedDashboard.quickActions);
    } finally {
      setCacheBusy(false);
    }
  };

  const handleClearDashboardCacheAll = async () => {
    const token = getToken();
    if (!token) {
      return;
    }

    setCacheBusy(true);
    try {
      const result = await clearDashboardCacheAll(token);
      setCacheStats(result.stats);
      const refreshedDashboard = await getDashboard(token, 7);
      setStats(refreshedDashboard.stats);
      setTrend(refreshedDashboard.trend);
      setLatestNotifications(refreshedDashboard.latestNotifications);
      setRecommendation(refreshedDashboard.recommendation);
      setQuickActions(refreshedDashboard.quickActions);
    } finally {
      setCacheBusy(false);
    }
  };

  const handleExportStatsCsv = () => {
    if (!stats) {
      return;
    }

    const rows = [
      ['metric', 'value'],
      ['favoriteVerses', String(stats.favoriteVerses)],
      ['savedPrayers', String(stats.savedPrayers)],
      ['unreadNotifications', String(stats.unreadNotifications)],
      ['journalEntries', String(stats.journalEntries)],
      ['prayerRequests', String(stats.prayerRequests)],
    ];

    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'spiritual-dashboard-stats.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-grid animate-in">
      <SectionHeader title="Acasă" subtitle="Spațiul tău zilnic de rugăciune și reflecție" />
      <Card>
        <h3>{welcome}</h3>
        {diagnosticsEnabled ? (
          <p className="muted" style={{ marginTop: 8 }}>
            Diagnostic cache activ {diagnosticsForcedByFlag ? 'prin feature flag' : 'în development'}.
          </p>
        ) : null}
      </Card>
        <Disclaimer />
      <Card>
        <h3>Tablou spiritual</h3>
        {stats ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
            <div className="card">
              <strong>{stats.favoriteVerses}</strong>
              <div className="muted">Versete favorite</div>
            </div>
            <div className="card">
              <strong>{stats.savedPrayers}</strong>
              <div className="muted">Rugăciuni salvate</div>
            </div>
            <div className="card">
              <strong>{stats.unreadNotifications}</strong>
              <div className="muted">Notificări necitite</div>
            </div>
            <div className="card">
              <strong>{stats.journalEntries}</strong>
              <div className="muted">Intrări jurnal</div>
            </div>
            <div className="card">
              <strong>{stats.prayerRequests}</strong>
              <div className="muted">Cereri comunitate</div>
            </div>
          </div>
        ) : (
          <p className="muted">Statisticile vor apărea după încărcare.</p>
        )}
        {stats ? (
          <div style={{ marginTop: 12 }}>
            <Button type="button" variant="secondary" onClick={handleExportStatsCsv}>
              Exporta statistici CSV
            </Button>
          </div>
        ) : null}
      </Card>
      <Card>
        <h3>Trend jurnal (ultimele 7 zile)</h3>
        {trend ? (
          <div className="trend-grid">
            {trend.items.map((item) => {
              const max = Math.max(1, ...trend.items.map((x) => x.count));
              const width = `${Math.max(8, (item.count / max) * 100)}%`;
              return (
                <div key={item.date} className="trend-row">
                  <span className="trend-date">{item.date}</span>
                  <div className="trend-bar-wrap">
                    <div className="trend-bar" style={{ width }} />
                  </div>
                  <span className="trend-count">{item.count}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="muted">Trendul va apărea după încărcare.</p>
        )}
      </Card>
      <Card>
        <h3>Notificari recente</h3>
        {latestNotifications.length ? (
          <ul>
            {latestNotifications.map((notice) => (
              <li key={notice.id}>
                <strong>{notice.title}</strong> - {notice.read ? 'citita' : 'necitita'}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Nu exista notificari recente.</p>
        )}
      </Card>
      <Card>
        <h3>Acțiuni rapide</h3>
        {quickActions.length ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {quickActions.map((action, index) => (
              <Link
                key={`${action.path}-${index}`}
                className={index === 0 ? 'button' : 'button button-secondary'}
                href={action.path}
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link className="button" href="/chat">
              Deschide ghidul spiritual
            </Link>
            <Link className="button button-secondary" href="/journal">
              Adaugă în jurnal
            </Link>
            <Link className="button button-secondary" href="/community">
              Publică cerere
            </Link>
          </div>
        )}
      </Card>
      <FacebookCommunityCard />
      <TikTokCommunityCard />
      <Card>
        <h3>Recomandarea spirituală a zilei</h3>
        {recommendation ? (
          <>
            <h4 style={{ marginBottom: 6 }}>{recommendation.title}</h4>
            <p>{recommendation.message}</p>
            <p className="muted">Verset: {recommendation.verse}</p>
            <Link className="button" href={recommendation.actionPath}>
              {recommendation.actionLabel}
            </Link>
          </>
        ) : (
          <p className="muted">Recomandarea va apărea după încărcare.</p>
        )}
      </Card>
      {diagnosticsEnabled ? (
        <Card>
          <h3>Diagnostic cache dashboard</h3>
          {cacheStats ? (
            <div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}
            >
              <div className="card">
                <strong>{cacheStats.entries}</strong>
                <div className="muted">Chei active</div>
              </div>
              <div className="card">
                <strong>{cacheStats.hits}</strong>
                <div className="muted">Cache hits</div>
              </div>
              <div className="card">
                <strong>{cacheStats.misses}</strong>
                <div className="muted">Cache misses</div>
              </div>
              <div className="card">
                <strong>{(cacheStats.hitRate * 100).toFixed(1)}%</strong>
                <div className="muted">Hit rate</div>
              </div>
              <div className="card">
                <strong>{cacheStats.invalidations}</strong>
                <div className="muted">Invalidări</div>
              </div>
              <div className="card">
                <strong>{cacheStats.evictionsExpired + cacheStats.evictionsCapacity}</strong>
                <div className="muted">Evicții totale</div>
              </div>
            </div>
          ) : (
            <p className="muted">Nu am putut încărca metricile de cache.</p>
          )}
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button type="button" variant="secondary" onClick={handleRefreshCacheStats} disabled={cacheBusy}>
              {cacheBusy ? 'Se actualizează...' : 'Actualizează metrici'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleResetCacheStats} disabled={cacheBusy}>
              {cacheBusy ? 'Se resetează...' : 'Resetează metrici'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleClearDashboardCache} disabled={cacheBusy}>
              {cacheBusy ? 'Se curăță...' : 'Curăță cache utilizator'}
            </Button>
            {canClearAllCache ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleClearDashboardCacheAll}
                disabled={cacheBusy}
              >
                {cacheBusy ? 'Se curăță global...' : 'Curăță cache global'}
              </Button>
            ) : null}
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            Activ doar în development sau când setezi NEXT_PUBLIC_ENABLE_DASHBOARD_DIAGNOSTICS=true.
          </p>
        </Card>
      ) : null}
      <Card>
        <h3>Versetul zilei</h3>
        <p>{verseOfDay}</p>
      </Card>
      <Card>
        <h3>Rugăciunea zilei</h3>
        <p>{prayerOfDay}</p>
      </Card>
      <Card>
        <h3>Cum te simți azi?</h3>
        <p className="muted">Deschide Ghidul spiritual sau jurnalul pentru un pas mic de liniște.</p>
      </Card>
      <Card>
        <h3>Vorbește cu Dumnezeu</h3>
        <p className="muted">Buton principal pentru Ghidul spiritual.</p>
      </Card>
      <Card>
        <p>Acces rapid: jurnal, rugăciuni, planuri spirituale.</p>
      </Card>
    </div>
  );
}
