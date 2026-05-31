export const customerWalletFallback = {
  summary: {
    availablePoints: 15200,
    pendingPoints: 300,
    expiringPoints: 1200,
    expiringAt: '2026-06-30',
  },
  movements: [
    {
      id: 'mov_001',
      type: 'earn',
      category: 'purchase',
      description: 'Compra en tienda partner',
      points: 450,
      balanceAfter: 15200,
      occurredAt: '2026-05-28T12:30:00Z',
    },
    {
      id: 'mov_002',
      type: 'expire',
      category: 'expiration',
      description: 'Vencimiento mensual',
      points: -120,
      balanceAfter: 14750,
      occurredAt: '2026-05-01T00:00:00Z',
    },
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 138,
  },
  source: 'mock',
};
