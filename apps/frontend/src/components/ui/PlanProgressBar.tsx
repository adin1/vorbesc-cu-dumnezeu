type PlanProgressBarProps = {
  dayNumber: number;
  totalDays: number;
};

export function PlanProgressBar({ dayNumber, totalDays }: PlanProgressBarProps) {
  const safeTotal = Math.max(1, totalDays);
  const clampedDay = Math.min(Math.max(dayNumber, 1), safeTotal);
  const percent = Math.round((clampedDay / safeTotal) * 100);

  return (
    <div style={{ marginTop: 8 }}>
      <div className="muted">
        Progres: ziua {clampedDay} din {safeTotal} ({percent}%)
      </div>
      <div className="trend-bar-wrap" style={{ marginTop: 6 }}>
        <div className="trend-bar" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
