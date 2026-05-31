export const customerProfileSummaryFallback = {
  customer: {
    id: 'cust_001',
    documentType: 'RUT',
    documentNumberMasked: '12.***.***-K',
    fullName: 'Pablo Valverde',
    email: 'pablo@example.com',
    phoneMasked: '+56 9 **** 1234',
  },
  membership: {
    status: 'active',
    joinedAt: '2025-07-14',
    tier: {
      code: 'gold',
      name: 'Gold',
    },
  },
  source: 'mock',
};
