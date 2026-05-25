'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TikTokCommunityCard } from '@/components/social/TikTokCommunityCard';
import {
  createDonationCheckout,
  createSubscriptionCheckout,
  getMonetizationPlans,
  getMonetizationSummary,
  type MonetizationSummary,
  type SubscriptionPlan,
} from '@/lib/api-client';
import { getStripeClient } from '@/lib/stripe';
import { getToken } from '@/lib/auth-token';

export default function PremiumPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [summary, setSummary] = useState<MonetizationSummary | null>(null);
  const [donationAmount, setDonationAmount] = useState(1000);
  const [donationMessage, setDonationMessage] = useState('');
  const [loadingSlug, setLoadingSlug] = useState('');
  const [donationLoading, setDonationLoading] = useState(false);
  const [status, setStatus] = useState('');

  const quickValues = useMemo(() => summary?.quickDonationValues ?? [500, 1000, 2500, 5000], [summary]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    Promise.all([getMonetizationPlans(token), getMonetizationSummary(token)])
      .then(([plansData, summaryData]) => {
        setPlans(plansData);
        setSummary(summaryData);
      })
      .catch(() => setStatus('Nu am putut încărca detaliile Premium.'));
  }, []);

  const handleChoosePlan = async (planSlug: string) => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesară.');
      return;
    }

    try {
      setLoadingSlug(planSlug);
      const session = await createSubscriptionCheckout(token, planSlug);
      if (session.url) {
        window.location.href = session.url;
        return;
      }
      const stripe = await getStripeClient();
      if (!stripe) {
        throw new Error('Providerul de plăți nu este disponibil momentan.');
      }
      const result = await stripe.redirectToCheckout({ sessionId: session.sessionId });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscută';
      setStatus(`Eroare: ${message}`);
    } finally {
      setLoadingSlug('');
    }
  };

  const handleDonation = async () => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesară.');
      return;
    }

    try {
      setDonationLoading(true);
      const session = await createDonationCheckout(token, {
        amount: donationAmount,
        currency: 'RON',
        message: donationMessage,
      });
      if (session.url) {
        window.location.href = session.url;
        return;
      }
      const stripe = await getStripeClient();
      if (!stripe) {
        throw new Error('Providerul de plăți nu este disponibil momentan.');
      }
      const result = await stripe.redirectToCheckout({ sessionId: session.sessionId });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscută';
      setStatus(`Eroare: ${message}`);
    } finally {
      setDonationLoading(false);
    }
  };

  return (
    <div className="page-grid animate-in">
      <SectionHeader
        title="Premium"
        subtitle="Sprijină comunitatea. Descoperă experiența completă"
      />

      <Card className="premium-hero-card">
        <h3>Sprijină comunitatea și descoperă experiența completă</h3>
        <p className="muted">
          Modelul nostru este discret și orientat spre susținere. Funcțiile esențiale spirituale rămân disponibile
          în planul gratuit.
        </p>
      </Card>

      <Card>
        <h3>Comparație planuri</h3>
        <div className="premium-plan-grid">
          {plans.map((plan) => (
            <article key={plan.id} className={`premium-plan-card ${summary?.currentPlan?.slug === plan.slug ? 'is-current' : ''}`}>
              <div>
                <h4>{plan.name}</h4>
                <p className="muted">{plan.description}</p>
                <p className="premium-price">{plan.priceMonthly === 0 ? 'Gratuit' : `${(plan.priceMonthly / 100).toFixed(2)} lei / lună`}</p>
              </div>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {plan.slug === 'gratuit' ? (
                <Button type="button" variant="secondary" disabled>
                  Plan activ implicit
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => handleChoosePlan(plan.slug)}
                  disabled={loadingSlug === plan.slug}
                >
                  {loadingSlug === plan.slug
                    ? 'Se pregătește...'
                    : plan.slug === 'premium-basic'
                      ? 'Alege Premium Basic'
                      : 'Alege Premium Family'}
                </Button>
              )}
            </article>
          ))}
        </div>
      </Card>

      <Card>
        <h3>Susține comunitatea</h3>
        <p className="muted">
          Dacă această aplicație îți aduce liniște și sprijin, poți contribui la dezvoltarea comunității.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {quickValues.map((value) => (
            <Button key={value} type="button" variant={donationAmount === value ? 'primary' : 'secondary'} onClick={() => setDonationAmount(value)}>
              {`Donează ${(value / 100).toFixed(0)} lei`}
            </Button>
          ))}
        </div>
        <div className="form-grid">
          <label>
            Sumă (lei)
            <input
              type="number"
              min={5}
              value={Math.round(donationAmount / 100)}
              onChange={(event) => setDonationAmount(Math.max(500, Number(event.target.value || 5) * 100))}
            />
          </label>
          <label>
            Mesaj opțional
            <textarea
              rows={3}
              value={donationMessage}
              onChange={(event) => setDonationMessage(event.target.value)}
              placeholder="Un gând de încurajare pentru comunitate"
            />
          </label>
          <Button type="button" onClick={handleDonation} disabled={donationLoading}>
            {donationLoading ? 'Se pregătește...' : 'Susține comunitatea'}
          </Button>
        </div>
      </Card>

      <TikTokCommunityCard />

      {summary?.activeSubscription ? (
        <Card>
          <h3>Abonamentul tău</h3>
          <p>
            <strong>Plan:</strong> {summary.activeSubscription.plan.name}
          </p>
          <p>
            <strong>Status:</strong> {summary.activeSubscription.status}
          </p>
          <p className="muted">
            Început la: {new Date(summary.activeSubscription.startedAt).toLocaleDateString('ro-RO')}
          </p>
        </Card>
      ) : null}

      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}
