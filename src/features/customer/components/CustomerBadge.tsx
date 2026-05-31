export function CustomerBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 'fit-content',
        background: '#e8f1ff',
        color: '#0b57d0',
        borderRadius: 999,
        padding: '6px 12px',
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}
