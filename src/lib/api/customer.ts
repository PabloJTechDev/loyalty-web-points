import { customerHomeFallback } from '@/lib/mocks/customer-home';
import { customerProfileSummaryFallback } from '@/lib/mocks/customer-profile-summary';
import { customerWalletFallback } from '@/lib/mocks/customer-wallet';

const baseUrl = process.env.BFF_CUSTOMER_BASE_URL ?? 'http://localhost:3002';

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
