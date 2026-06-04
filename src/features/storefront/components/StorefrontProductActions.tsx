'use client';

import Link from 'next/link';
import { useState } from 'react';
import { StorefrontAddToCartButton } from '@/features/storefront/components/StorefrontAddToCartButton';

interface StorefrontProductActionsProps {
  locale: 'es' | 'en';
  productId: string;
}

export function StorefrontProductActions({ locale, productId }: StorefrontProductActionsProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="stack stack--sm">
      <label className="field field--compact">
        <span>{locale === 'es' ? 'Cantidad' : 'Quantity'}</span>
        <input
          className="field-input"
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
        />
      </label>
      <div className="hero-actions">
        <StorefrontAddToCartButton
          productId={productId}
          quantity={quantity}
          labels={locale === 'es'
            ? { idle: 'Agregar al carrito demo', success: 'Agregado' }
            : { idle: 'Add to demo cart', success: 'Added' }}
        />
        <Link href={`/${locale}/shop/cart`} className="button button--secondary button--full">
          {locale === 'es' ? 'Abrir carrito' : 'Open cart'}
        </Link>
      </div>
    </div>
  );
}
