import type { ReactNode } from 'react';
import { CustomerBadge } from '@/shared/ui/CustomerBadge';

interface CustomerPageHeaderProps {
  badge: string;
  title: string;
  description?: string;
  aside?: ReactNode;
}

export function CustomerPageHeader({ badge, title, description, aside }: CustomerPageHeaderProps) {
  return (
    <section className="page-header">
      <div className="page-header__content">
        <CustomerBadge label={badge} />
        <div className="stack stack--sm">
          <h2 className="page-title">{title}</h2>
          {description ? <p className="page-description">{description}</p> : null}
        </div>
      </div>

      {aside ? <div className="page-header__aside">{aside}</div> : null}
    </section>
  );
}
