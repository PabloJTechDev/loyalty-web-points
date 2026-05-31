interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
}

export function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <article
      style={{
        background: '#fff',
        borderRadius: 18,
        padding: 22,
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <span style={{ fontSize: 14, color: '#6e6e73' }}>{title}</span>
      <strong style={{ fontSize: 32, lineHeight: 1 }}>{value}</strong>
      {description ? (
        <p style={{ margin: 0, fontSize: 14, color: '#6e6e73', lineHeight: 1.5 }}>{description}</p>
      ) : null}
    </article>
  );
}
