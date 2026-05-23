export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header style={{ marginBottom: 12 }}>
      <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 28 }}>{title}</h2>
      {subtitle ? <p className="muted">{subtitle}</p> : null}
    </header>
  );
}
