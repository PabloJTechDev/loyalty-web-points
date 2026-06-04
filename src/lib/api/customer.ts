import { customerHomeFallback } from '@/lib/mocks/customer-home';
import { customerProfileSummaryFallback } from '@/lib/mocks/customer-profile-summary';
import { customerWalletFallback } from '@/lib/mocks/customer-wallet';

const baseUrl = process.env.BFF_CUSTOMER_BASE_URL ?? 'http://localhost:3002';

export interface CustomerEnrollmentTrace {
  transactionId: string;
  email: string;
  createdAt: string;
  handoff: {
    status: 'pending_core' | 'sent_to_core' | 'core_rejected' | 'ready_to_send';
    targetBaseUrl: string;
    deliveredAt?: string;
    responseStatusCode?: number;
  };
  payloadPreparedForCore: {
    transactionId: string;
    customerEmailHash: string;
  };
}

export interface CustomerEnrollmentTraceListResponse {
  defaultEmail: string;
  total: number;
  items: CustomerEnrollmentTrace[];
}

export interface CustomerEnrollmentCoreRecord {
  transactionId: string;
  customerEmailHash: string;
  receivedAt: string;
  source: string;
  stage: string;
}

export interface CustomerEnrollmentTraceDetailsResponse {
  trace: CustomerEnrollmentTrace;
  coreRecord: CustomerEnrollmentCoreRecord | null;
}

export interface CustomerPasswordChangeTrace {
  requestId: string;
  transactionId: string;
  createdAt: string;
  handoff: {
    status: 'enrollment_not_found' | 'pending_core' | 'sent_to_core' | 'core_rejected' | 'ready_to_send';
    targetBaseUrl: string;
    deliveredAt?: string;
    responseStatusCode?: number;
  };
  payloadPreparedForCore: {
    requestId: string;
    transactionId: string;
    customerEmailHash: string;
  };
}

export interface CustomerPasswordChangeCoreRecord {
  requestId: string;
  transactionId: string;
  customerEmailHash: string;
  requestedAt: string;
  source: string;
  stage: string;
}

export interface CustomerPasswordChangeTraceDetailsResponse {
  trace: CustomerPasswordChangeTrace;
  coreRecord: CustomerPasswordChangeCoreRecord | null;
}

export interface CustomerLoginTrace {
  loginId: string;
  requestId: string;
  transactionId: string;
  createdAt: string;
  session: {
    status: 'password_change_not_found' | 'pending_core' | 'authenticated' | 'core_rejected' | 'ready_to_authenticate';
    targetBaseUrl: string;
    authenticatedAt?: string;
    responseStatusCode?: number;
  };
  customerSnapshot: {
    customerId: string;
    fullName: string;
    maskedEmail: string;
    tierName: string;
  };
  payloadPreparedForCore: {
    loginId: string;
    requestId: string;
    transactionId: string;
    customerEmailHash: string;
  };
}

export interface CustomerLoginCoreRecord {
  loginId: string;
  requestId: string;
  transactionId: string;
  customerEmailHash: string;
  authenticatedAt: string;
  source: string;
  stage: string;
}

export interface CustomerLoginTraceDetailsResponse {
  trace: CustomerLoginTrace;
  coreRecord: CustomerLoginCoreRecord | null;
}

export interface CustomerProfileSummaryResponse {
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
  source:
    | 'core-customer'
    | 'mock_missing_context'
    | 'mock_core_unavailable'
    | 'mock_core_unavailable_data';
  integrations?: {
    coreCustomer?: {
      available: boolean;
      baseUrl?: string;
      checkedAt?: string;
      error?: string;
    };
  };
}

export interface CustomerProfileSummaryViewModel extends CustomerProfileSummaryResponse {
  sourceDetails: {
    profileSummary: CustomerProfileSummaryResponse['source'];
    authenticatedSession: 'none' | 'login-trace';
    visible: string;
    usesFallback: boolean;
    loginId?: string;
  };
  sessionTrace: CustomerLoginTraceDetailsResponse | null;
}

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`BFF request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

function buildProfileSummarySourceDetails(
  profileSource: CustomerProfileSummaryResponse['source'],
  loginId: string | undefined,
  hasSessionTrace: boolean,
): CustomerProfileSummaryViewModel['sourceDetails'] {
  return {
    profileSummary: profileSource,
    authenticatedSession: hasSessionTrace ? 'login-trace' : 'none',
    visible: hasSessionTrace ? `${profileSource} + login-trace` : profileSource,
    usesFallback: profileSource !== 'core-customer',
    loginId,
  };
}

function mergeProfileSummaryWithLoginTrace(
  profileSummary: CustomerProfileSummaryResponse,
  loginTrace: CustomerLoginTraceDetailsResponse,
): CustomerProfileSummaryResponse {
  return {
    ...profileSummary,
    customer: {
      ...profileSummary.customer,
      id: loginTrace.trace.customerSnapshot.customerId || profileSummary.customer.id,
      fullName: loginTrace.trace.customerSnapshot.fullName || profileSummary.customer.fullName,
      email: loginTrace.trace.customerSnapshot.maskedEmail || profileSummary.customer.email,
    },
    membership: {
      ...profileSummary.membership,
      tier: {
        ...profileSummary.membership.tier,
        name: loginTrace.trace.customerSnapshot.tierName || profileSummary.membership.tier.name,
      },
    },
  };
}

export async function getCustomerHome() {
  return safeFetch('/api/v1/customer/home', customerHomeFallback);
}

export async function getCustomerProfileSummary(loginId?: string): Promise<CustomerProfileSummaryViewModel> {
  const profileSummaryPath = loginId
    ? `/api/v1/customer/profile-summary?loginId=${encodeURIComponent(loginId)}`
    : '/api/v1/customer/profile-summary';

  const [profileSummary, sessionTrace] = await Promise.all([
    safeFetch(profileSummaryPath, customerProfileSummaryFallback as CustomerProfileSummaryResponse),
    loginId ? getCustomerLoginTraceByLoginId(loginId) : Promise.resolve(null),
  ]);

  const hasSessionTrace = Boolean(loginId && sessionTrace?.trace);
  const resolvedProfileSummary = hasSessionTrace && sessionTrace
    ? mergeProfileSummaryWithLoginTrace(profileSummary, sessionTrace)
    : profileSummary;

  return {
    ...resolvedProfileSummary,
    sourceDetails: buildProfileSummarySourceDetails(profileSummary.source, loginId, hasSessionTrace),
    sessionTrace: hasSessionTrace ? sessionTrace : null,
  };
}

export async function getCustomerWallet() {
  return safeFetch('/api/v1/customer/wallet', customerWalletFallback);
}

export async function getCustomerEnrollmentTraces(): Promise<CustomerEnrollmentTraceListResponse> {
  return safeFetch('/api/v1/customer/enrollment-traces', {
    defaultEmail: 'inscripcion@pablov.dev',
    total: 0,
    items: [] as CustomerEnrollmentTrace[],
  });
}

export async function getCustomerEnrollmentTraceByTransactionId(transactionId: string) {
  return safeFetch(`/api/v1/customer/enrollment-traces/${encodeURIComponent(transactionId)}`, null as CustomerEnrollmentTraceDetailsResponse | null);
}

export async function getCustomerPasswordChangeTraceByRequestId(requestId: string) {
  return safeFetch(
    `/api/v1/customer/password-change-traces/${encodeURIComponent(requestId)}`,
    null as CustomerPasswordChangeTraceDetailsResponse | null,
  );
}

export async function getCustomerLoginTraceByLoginId(loginId: string) {
  return safeFetch(
    `/api/v1/customer/login-traces/${encodeURIComponent(loginId)}`,
    null as CustomerLoginTraceDetailsResponse | null,
  );
}
