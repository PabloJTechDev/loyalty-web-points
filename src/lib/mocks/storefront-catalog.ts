import type { Locale } from '@/lib/i18n/config';

export interface StorefrontCatalogCategory {
  id: string;
  name: string;
  description: string;
}

export interface StorefrontCatalogItem {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  categoryName: string;
  priceUsd: number;
  pointsFrom: number;
  shortDescription: string;
  eligibilityNote: string;
}

export interface StorefrontCatalogResponse {
  items: StorefrontCatalogItem[];
  categories: StorefrontCatalogCategory[];
  source: string;
  integrations: {
    storefront: {
      available: boolean;
      baseUrl?: string;
      checkedAt?: string;
      path?: string;
      error?: string;
    };
  };
}

const localizedCatalog = {
  es: {
    categories: [
      {
        id: 'electronics',
        name: 'Electrónica',
        description: 'Productos de ticket medio/alto para compra en USD y canje parcial con puntos.',
      },
      {
        id: 'home',
        name: 'Hogar',
        description: 'Artículos cotidianos útiles para validar carrito, cambios y devoluciones.',
      },
      {
        id: 'accessories',
        name: 'Accesorios',
        description: 'SKU livianos para validar promociones, acumulación y órdenes mixtas.',
      },
    ],
    items: [
      {
        id: 'sku_headphones',
        sku: 'sku_headphones',
        name: 'Audífonos inalámbricos',
        categoryId: 'electronics',
        categoryName: 'Electrónica',
        priceUsd: 129,
        pointsFrom: 8900,
        shortDescription: 'Buen candidato para compra mixta USD + puntos.',
        eligibilityNote: 'Canje parcial sujeto a saldo disponible y reglas de la campaña.',
      },
      {
        id: 'sku_coffee',
        sku: 'sku_coffee',
        name: 'Cafetera compacta',
        categoryId: 'home',
        categoryName: 'Hogar',
        priceUsd: 89,
        pointsFrom: 6200,
        shortDescription: 'Útil para probar devoluciones, cambios y reserva de puntos.',
        eligibilityNote: 'Ideal para validar quote y liberación de puntos en postventa.',
      },
      {
        id: 'sku_backpack',
        sku: 'sku_backpack',
        name: 'Mochila urbana',
        categoryId: 'accessories',
        categoryName: 'Accesorios',
        priceUsd: 59,
        pointsFrom: 4100,
        shortDescription: 'SKU simple para empezar con catálogo y carrito sin mucha fricción.',
        eligibilityNote: 'Sirve para promociones y órdenes mixtas con acumulación.',
      },
    ],
  },
  en: {
    categories: [
      {
        id: 'electronics',
        name: 'Electronics',
        description: 'Mid/high ticket products for USD checkout and partial redemption with points.',
      },
      {
        id: 'home',
        name: 'Home',
        description: 'Everyday items that work well for cart, returns, and exchange validation.',
      },
      {
        id: 'accessories',
        name: 'Accessories',
        description: 'Lightweight SKUs to validate promotions, accrual, and mixed orders.',
      },
    ],
    items: [
      {
        id: 'sku_headphones',
        sku: 'sku_headphones',
        name: 'Wireless headphones',
        categoryId: 'electronics',
        categoryName: 'Electronics',
        priceUsd: 129,
        pointsFrom: 8900,
        shortDescription: 'A good candidate for mixed USD + points checkout.',
        eligibilityNote: 'Partial redemption depends on available balance and campaign rules.',
      },
      {
        id: 'sku_coffee',
        sku: 'sku_coffee',
        name: 'Compact coffee maker',
        categoryId: 'home',
        categoryName: 'Home',
        priceUsd: 89,
        pointsFrom: 6200,
        shortDescription: 'Useful to test returns, exchanges, and point reservations.',
        eligibilityNote: 'Good fit to validate quote and point release after returns.',
      },
      {
        id: 'sku_backpack',
        sku: 'sku_backpack',
        name: 'Urban backpack',
        categoryId: 'accessories',
        categoryName: 'Accessories',
        priceUsd: 59,
        pointsFrom: 4100,
        shortDescription: 'A simple SKU to start catalog and cart with low friction.',
        eligibilityNote: 'Useful for promotions and mixed orders with accrual.',
      },
    ],
  },
} as const;

export function getStorefrontCatalogFallback(locale: Locale): StorefrontCatalogResponse {
  const catalog = localizedCatalog[locale];

  return {
    categories: [...catalog.categories],
    items: [...catalog.items],
    source: 'mock-storefront',
    integrations: {
      storefront: {
        available: false,
      },
    },
  };
}
