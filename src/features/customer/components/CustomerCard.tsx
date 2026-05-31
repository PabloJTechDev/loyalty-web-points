import type { ReactNode } from 'react';

export function CustomerCard({ children }: { children: ReactNode }) {
  return (
    <article
      style={{
        background: '#fff',
        borderRadius: 18,
        padding: 24,
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
      }}
    >
      {children}
    </article>
  );
}
