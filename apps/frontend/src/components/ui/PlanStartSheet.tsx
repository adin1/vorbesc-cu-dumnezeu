'use client';

import { Button } from './Button';

type PlanStartSheetProps = {
  title: string;
  durationDays: number;
  onConfirm: () => Promise<void>;
};

export function PlanStartSheet({ title, durationDays, onConfirm }: PlanStartSheetProps) {
  return (
    <div className="card" style={{ marginTop: 8 }}>
      <h4 style={{ marginTop: 0 }}>Fișă de start</h4>
      <p>
        Plan: <strong>{title}</strong>
      </p>
      <p>
        Durată: <strong>{durationDays} zile</strong>
      </p>
      <p className="muted">Alege un interval zilnic liniștit de 10-15 minute și notează un pas concret pe zi.</p>
      <Button type="button" onClick={onConfirm}>
        Confirmă și pornește
      </Button>
    </div>
  );
}
