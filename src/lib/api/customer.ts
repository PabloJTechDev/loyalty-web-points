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

export async function getCustomerHome() {
  return safeFetch('/api/v1/customer/home', customerHomeFallback);
}

export async function getCustomerProfileSummary() {
  return safeFetch('/api/v1/customer/profile-summary', customerProfileSummaryFallback);
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
