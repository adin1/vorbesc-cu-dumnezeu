'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PremiumFeatureCard } from '@/components/ui/PremiumFeatureCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  getPlans,
  startPlan,
  type SpiritualPlan,
  type UserPlanProgress,
  updatePlanProgress,
} from '@/lib/api-client';
import { getToken } from '@/lib/auth-token';
import { predefinedPlans } from '@/lib/mock-data';

export default function PlansPage() {
  const [plans, setPlans] = useState<SpiritualPlan[]>([]);
  const [progressByPlanId, setProgressByPlanId] = useState<Record<string, UserPlanProgress>>({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    getPlans(token).then(setPlans).catch(() => setPlans([]));
  }, []);

  const handleStart = async (planId: string) => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      const progress = await startPlan(token, planId);
      setProgressByPlanId((prev) => ({ ...prev, [planId]: progress }));
      setStatus('Planul a fost pornit.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  const handleAdvanceDay = async (planId: string) => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    const currentProgress = progressByPlanId[planId];
    if (!currentProgress) {
      setStatus('Porneste planul inainte de actualizarea progresului.');
      return;
    }

    try {
      const nextDay = currentProgress.dayNumber + 1;
      const updated = await updatePlanProgress(token, currentProgress.id, {
        dayNumber: nextDay,
        completed: false,
      });
      setProgressByPlanId((prev) => ({ ...prev, [planId]: updated }));
      setStatus(`Progres actualizat la ziua ${updated.dayNumber}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  return (
    <div className="page-grid animate-in">
      <SectionHeader title="Planuri spirituale" subtitle="Planuri ghidate pe zile, cu versete și reflecții" />
      <Card>
        <h3>Planuri predefinite</h3>
        <p className="muted">{predefinedPlans.join(' • ')}</p>
      </Card>
      <Card>
        <h3>Structură pe zi</h3>
        <ul>
          <li>Titlu</li>
          <li>Verset</li>
          <li>Explicație scurtă</li>
          <li>Rugăciune</li>
          <li>Întrebare de reflecție</li>
        </ul>
      </Card>
      <Card>
        <h3>Planuri din API</h3>
        {plans.length ? (
          <ul>
            {plans.map((plan) => (
              <li key={plan.id} style={{ marginBottom: 12 }}>
                <strong>{plan.title}</strong> - {plan.durationDays} zile
                {plan.locked ? <span className="muted"> • Premium</span> : null}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleStart(plan.id)}
                    disabled={Boolean(plan.locked)}
                  >
                    Start plan
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleAdvanceDay(plan.id)}
                    disabled={Boolean(plan.locked)}
                  >
                    Marcheaza ziua urmatoare
                  </Button>
                </div>
                {plan.locked ? (
                  <div style={{ marginTop: 10 }}>
                    <PremiumFeatureCard
                      title="Acest plan face parte din experiența Premium."
                      description="Poți continua gratuit cu planurile de bază sau poți descoperi planurile extinse Premium."
                    />
                  </div>
                ) : null}
                {progressByPlanId[plan.id] ? (
                  <div className="muted" style={{ marginTop: 6 }}>
                    Progres curent: ziua {progressByPlanId[plan.id].dayNumber}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Nu există încă planuri disponibile.</p>
        )}
      </Card>
      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}
