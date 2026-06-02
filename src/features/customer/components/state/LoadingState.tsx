interface LoadingStateProps {
  title: string;
  description: string;
}

export function LoadingState({ title, description }: LoadingStateProps) {
  return (
    <section className="state-panel state-panel--loading" aria-busy="true" aria-live="polite">
      <div className="state-panel__header">
        <div className="state-skeleton state-skeleton--badge" />
        <div className="state-skeleton state-skeleton--title" />
        <div className="state-skeleton state-skeleton--text" />
      </div>

      <div className="state-panel__copy">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      <div className="state-grid">
        <div className="state-skeleton state-skeleton--card" />
        <div className="state-skeleton state-skeleton--card" />
        <div className="state-skeleton state-skeleton--card" />
      </div>
    </section>
  );
}
