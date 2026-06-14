export const customerHomeFallback = {
  customer: {
    id: 'cust_001',
    firstName: 'Pablo',
    fullName: 'Pablo Valverde',
  },
  membership: {
    status: 'active',
    tier: {
      code: 'gold',
      name: 'Gold',
    },
  },
  wallet: {
    availablePoints: 15200,
    expiringPoints: 1200,
    expiringAt: '2026-06-30',
  },
  tierProgress: {
    current: 'Gold',
    next: 'Platinum',
    progressPercentage: 68,
    missingPoints: 3200,
  },
  recentActivity: [
    {
      id: 'trx_001',
      type: 'earn',
      description: 'Compra en comercio asociado',
      points: 450,
      occurredAt: '2026-05-28T12:30:00Z',
    },
    {
      id: 'trx_002',
      type: 'expire',
      description: 'Vencimiento mensual',
      points: -120,
      occurredAt: '2026-05-01T00:00:00Z',
    },
    {
      id: 'trx_003',
      type: 'bonus',
      description: 'Bono campaña bienvenida',
      points: 300,
      occurredAt: '2026-04-22T09:00:00Z',
    },
  ],
  primaryAction: {
    label: 'Ver wallet',
    target: '/wallet',
  },
  source: 'mock',
};
