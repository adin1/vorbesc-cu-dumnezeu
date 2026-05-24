'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Disclaimer } from '@/components/ui/Disclaimer';
import { PlanCategoryFilter } from '@/components/ui/PlanCategoryFilter';
import { PlanDayCard } from '@/components/ui/PlanDayCard';
import { PlanProgressBar } from '@/components/ui/PlanProgressBar';
import { PlanStartSheet } from '@/components/ui/PlanStartSheet';
import { PremiumFeatureCard } from '@/components/ui/PremiumFeatureCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  getPlanById,
  getPlans,
  startPlan,
  type SpiritualPlan,
  type UserPlanProgress,
  updatePlanProgress,
} from '@/lib/api-client';
import { getToken } from '@/lib/auth-token';

type PlanDay = {
  id: string;
  dayNumber: number;
  title: string;
  verse: string;
  explanation: string;
  prayer: string;
  reflectionQuestion: string;
};

export default function PlansPage() {
  const [plans, setPlans] = useState<SpiritualPlan[]>([]);
  const [progressByPlanId, setProgressByPlanId] = useState<Record<string, UserPlanProgress>>({});
  const [daysByPlanId, setDaysByPlanId] = useState<Record<string, PlanDay[]>>({});
  const [activeCategory, setActiveCategory] = useState('TOATE');
  const [pendingStartPlanId, setPendingStartPlanId] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    getPlans(token).then(setPlans).catch(() => setPlans([]));
  }, []);

  const categories = useMemo(() => ['STANDARD', 'PREMIUM'], []);

  const filteredPlans = useMemo(() => {
    if (activeCategory === 'TOATE') {
      return plans;
    }

    if (activeCategory === 'PREMIUM') {
      return plans.filter((plan) => Boolean(plan.locked) || Boolean(plan.isPremium));
    }

    return plans.filter((plan) => !plan.isPremium);
  }, [activeCategory, plans]);

  const handleStart = async (plan: SpiritualPlan) => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      const progress = await startPlan(token, plan.id);
      setProgressByPlanId((prev) => ({ ...prev, [plan.id]: progress }));
      setPendingStartPlanId(null);
      setStatus('Planul a fost pornit.');

      const planDetail = await getPlanById(token, plan.id);
      if (planDetail && Array.isArray(planDetail.days)) {
        setDaysByPlanId((prev) => ({ ...prev, [plan.id]: planDetail.days }));
      }
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

  const handleExportPlanPdf = async (plan: SpiritualPlan) => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      const detail = await getPlanById(token, plan.id);
      if (!detail || !Array.isArray(detail.days) || detail.days.length === 0) {
        setStatus('Planul nu are zile disponibile pentru export.');
        return;
      }

      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      let y = 14;

      doc.setFontSize(16);
      doc.text(`Fisa de start: ${plan.title}`, 10, y);
      y += 8;
      doc.setFontSize(11);
      doc.text(`Durata: ${plan.durationDays} zile`, 10, y);
      y += 8;

      detail.days.forEach((day) => {
        if (y > 255) {
          doc.addPage();
          y = 14;
        }

        const lines = doc.splitTextToSize(
          `Ziua ${day.dayNumber} - ${day.title}\nVerset: ${day.verse}\nExplicatie: ${day.explanation}\nRugaciune: ${day.prayer}\nReflectie: ${day.reflectionQuestion}`,
          185,
        );
        doc.text(lines, 10, y);
        y += lines.length * 6 + 4;
      });

      doc.save(`plan-${plan.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      setStatus('PDF generat cu succes.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare la export PDF: ${message}`);
    }
  };

  return (
    <div className="page-grid animate-in">
      <SectionHeader title="Planuri spirituale" subtitle="Planuri ghidate pe zile, cu fișă de start și export PDF" />

      <Card>
        <h3>Filtre planuri</h3>
        <PlanCategoryFilter categories={categories} activeCategory={activeCategory} onChange={setActiveCategory} />
      </Card>

      <Card>
        <h3>Planuri din API</h3>
        {filteredPlans.length ? (
          <ul>
            {filteredPlans.map((plan) => (
              <li key={plan.id} style={{ marginBottom: 12 }}>
                <strong>{plan.title}</strong> - {plan.durationDays} zile
                {plan.locked ? <span className="muted"> • Premium</span> : null}

                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setPendingStartPlanId(plan.id)}
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
                  <Button type="button" variant="secondary" onClick={() => handleExportPlanPdf(plan)}>
                    Exporta fisa PDF
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

                {pendingStartPlanId === plan.id ? (
                  <PlanStartSheet
                    title={plan.title}
                    durationDays={plan.durationDays}
                    onConfirm={() => handleStart(plan)}
                  />
                ) : null}

                {progressByPlanId[plan.id] ? (
                  <PlanProgressBar dayNumber={progressByPlanId[plan.id].dayNumber} totalDays={plan.durationDays} />
                ) : null}

                {Array.isArray(daysByPlanId[plan.id]) && daysByPlanId[plan.id].length > 0 ? (
                  <div style={{ marginTop: 8 }}>
                    {daysByPlanId[plan.id].slice(0, 2).map((day) => (
                      <PlanDayCard
                        key={day.id}
                        dayNumber={day.dayNumber}
                        title={day.title}
                        verse={day.verse}
                        explanation={day.explanation}
                        prayer={day.prayer}
                        reflectionQuestion={day.reflectionQuestion}
                      />
                    ))}
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
      <Disclaimer />
    </div>
  );
}
