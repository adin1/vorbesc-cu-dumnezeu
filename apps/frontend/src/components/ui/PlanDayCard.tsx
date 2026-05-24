type PlanDayCardProps = {
  dayNumber: number;
  title: string;
  verse: string;
  explanation: string;
  prayer: string;
  reflectionQuestion: string;
};

export function PlanDayCard({ dayNumber, title, verse, explanation, prayer, reflectionQuestion }: PlanDayCardProps) {
  return (
    <div className="card" style={{ marginTop: 10 }}>
      <h4 style={{ marginTop: 0 }}>
        Ziua {dayNumber}: {title}
      </h4>
      <p>
        <strong>Verset:</strong> {verse}
      </p>
      <p>
        <strong>Explicație:</strong> {explanation}
      </p>
      <p style={{ whiteSpace: 'pre-wrap' }}>
        <strong>Rugăciune:</strong> {prayer}
      </p>
      <p>
        <strong>Întrebare:</strong> {reflectionQuestion}
      </p>
    </div>
  );
}
