import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="state-panel state-panel--empty">
      <div className="state-icon" aria-hidden="true">○</div>
      <div className="state-panel__copy">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      {action ? <div className="state-panel__action">{action}</div> : null}
    </section>
  );
}
