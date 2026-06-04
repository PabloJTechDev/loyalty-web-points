'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

export interface DemoCartItem {
  productId: string;
  quantity: number;
}

interface DemoCartState {
  items: DemoCartItem[];
}

const STORAGE_KEY = 'loyalty-storefront-demo-cart';
const CART_EVENT = 'loyalty-storefront-demo-cart:updated';

function sanitizeItems(items: DemoCartItem[]): DemoCartItem[] {
  return items
    .map((item) => ({
      productId: item.productId,
      quantity: Number.isFinite(item.quantity) ? Math.max(0, Math.floor(item.quantity)) : 0,
    }))
    .filter((item) => item.productId && item.quantity > 0);
}

function readCartState(): DemoCartState {
  if (typeof window === 'undefined') {
    return { items: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };

    const parsed = JSON.parse(raw) as DemoCartState;
    return { items: sanitizeItems(Array.isArray(parsed?.items) ? parsed.items : []) };
  } catch {
    return { items: [] };
  }
}

function persistCartState(state: DemoCartState) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(CART_EVENT));
}

function subscribeToCart(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  window.addEventListener(CART_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);

  return () => {
    window.removeEventListener(CART_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

export function useDemoCart() {
  const state = useSyncExternalStore(
    subscribeToCart,
    readCartState,
    () => ({ items: [] }),
  );

  const isHydrated = useSyncExternalStore(
    subscribeToCart,
    () => true,
    () => false,
  );

  const replaceItems = useCallback((items: DemoCartItem[]) => {
    const nextState = { items: sanitizeItems(items) };
    persistCartState(nextState);
  }, []);

  const addItem = useCallback((productId: string, quantity = 1) => {
    const safeQuantity = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
    replaceItems(
      state.items.some((item) => item.productId === productId)
        ? state.items.map((item) => (
          item.productId === productId
            ? { ...item, quantity: item.quantity + safeQuantity }
            : item
        ))
        : [...state.items, { productId, quantity: safeQuantity }],
    );
  }, [replaceItems, state.items]);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    replaceItems(
      state.items.map((item) => (
        item.productId === productId
          ? { ...item, quantity }
          : item
      )),
    );
  }, [replaceItems, state.items]);

  const removeItem = useCallback((productId: string) => {
    replaceItems(state.items.filter((item) => item.productId !== productId));
  }, [replaceItems, state.items]);

  const clear = useCallback(() => {
    replaceItems([]);
  }, [replaceItems]);

  const itemCount = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items],
  );

  return {
    items: state.items,
    itemCount,
    addItem,
    setQuantity,
    removeItem,
    clear,
    isHydrated,
  };
}
