import type { ReactNode } from 'react';

interface CustomerCardProps {
  children: ReactNode;
  tone?: 'default' | 'soft' | 'dark';
}

export function CustomerCard({ children, tone = 'default' }: CustomerCardProps) {
  const className = `customer-card customer-card--${tone}`;

  return <article className={className}>{children}</article>;
}
