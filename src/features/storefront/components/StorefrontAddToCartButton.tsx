'use client';

import { useEffect, useState } from 'react';
import { useDemoCart } from '@/features/storefront/hooks/useDemoCart';

interface StorefrontAddToCartButtonProps {
  productId: string;
  quantity?: number;
  labels?: {
    idle: string;
    success: string;
  };
}

export function StorefrontAddToCartButton({
  productId,
  quantity = 1,
  labels = {
    idle: 'Add to cart',
    success: 'Added',
  },
}: StorefrontAddToCartButtonProps) {
  const { addItem } = useDemoCart();
  const [feedback, setFeedback] = useState<'idle' | 'success'>('idle');

  useEffect(() => {
    if (feedback !== 'success') return undefined;

    const timer = window.setTimeout(() => setFeedback('idle'), 1200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  return (
    <button
      type="button"
      className="button button--primary button--full"
      onClick={() => {
        addItem(productId, quantity);
        setFeedback('success');
      }}
    >
      {feedback === 'success' ? labels.success : labels.idle}
    </button>
  );
}
