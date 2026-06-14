import type { ReactNode } from 'react';

interface ErrorStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <section className="state-panel state-panel--error" role="alert">
      <div className="state-icon state-icon--error" aria-hidden="true">!</div>
      <div className="state-panel__copy">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      {action ? <div className="state-panel__action">{action}</div> : null}
    </section>
  );
}
