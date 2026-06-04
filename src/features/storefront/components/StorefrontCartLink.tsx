'use client';

import Link from 'next/link';
import { useDemoCart } from '@/features/storefront/hooks/useDemoCart';

interface StorefrontCartLinkProps {
  href: string;
  locale: 'es' | 'en';
}

export function StorefrontCartLink({ href, locale }: StorefrontCartLinkProps) {
  const { itemCount, isHydrated } = useDemoCart();
  const label = locale === 'es' ? 'Carrito demo' : 'Demo cart';
  const suffix = locale === 'es' ? 'ítems' : 'items';

  return (
    <Link href={href} className="info-chip info-chip--interactive">
      <span>{label}</span>
      <strong>{isHydrated ? itemCount : 0} {suffix}</strong>
    </Link>
  );
}
