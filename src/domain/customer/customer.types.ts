export interface CustomerHomeData {
  customer: {
    id: string;
    firstName: string;
    fullName: string;
  };
  membership: {
    status: string;
    tier: {
      code: string;
      name: string;
    };
  };
  wallet: {
    availablePoints: number;
    expiringPoints: number;
    expiringAt: string;
  };
  tierProgress: {
    current: string;
    next: string;
    progressPercentage: number;
    missingPoints: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    points: number;
    occurredAt: string;
  }>;
  primaryAction: {
    label: string;
    target: string;
  };
  source?: string;
}

export interface CustomerProfileSummaryData {
  customer: {
    id: string;
    documentType: string;
    documentNumberMasked: string;
    fullName: string;
    email: string;
    phoneMasked: string;
  };
  membership: {
    status: string;
    joinedAt: string;
    tier: {
      code: string;
      name: string;
    };
  };
  source?: string;
}

export interface CustomerWalletData {
  summary: {
    availablePoints: number;
    pendingPoints: number;
    expiringPoints: number;
    expiringAt: string;
  };
  movements: Array<{
    id: string;
    type: string;
    category: string;
    description: string;
    points: number;
    balanceAfter: number;
    occurredAt: string;
  }>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  source?: string;
}
