import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const DEMO_SESSION_COOKIE = 'loyalty_demo_session';
export const DEMO_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function getDemoSessionSecret(): string {
  const secret = process.env.AUTH_DEMO_COOKIE_SECRET;

  if (!secret) {
    throw new Error('AUTH_DEMO_COOKIE_SECRET is required');
  }

  return secret;
}

export interface DemoSession {
  loginId: string;
  fullName: string;
  tier: string;
  customerId?: string;
  maskedEmail?: string;
}

interface DemoSessionPayload extends DemoSession {
  expiresAt: number;
}

function signPayload(payload: string): string {
  return createHmac('sha256', getDemoSessionSecret())
    .update(payload)
    .digest('base64url');
}

export function encodeDemoSession(
  session: DemoSession,
  nowMs = Date.now(),
): string {
  const payload = Buffer.from(
    JSON.stringify({
      ...session,
      expiresAt: nowMs + DEMO_SESSION_MAX_AGE_SECONDS * 1000,
    } satisfies DemoSessionPayload),
    'utf8',
  ).toString('base64url');

  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function decodeDemoSession(
  value: string | undefined,
  nowMs = Date.now(),
): DemoSession | null {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split('.');

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);
  const provided = Buffer.from(signature, 'utf8');
  const expected = Buffer.from(expectedSignature, 'utf8');

  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as DemoSessionPayload;

    if (
      !parsed.loginId ||
      !parsed.fullName ||
      !parsed.tier ||
      !parsed.expiresAt ||
      parsed.expiresAt <= nowMs
    ) {
      return null;
    }

    return {
      loginId: parsed.loginId,
      fullName: parsed.fullName,
      tier: parsed.tier,
      customerId: parsed.customerId,
      maskedEmail: parsed.maskedEmail,
    };
  } catch {
    return null;
  }
}

export async function getDemoSession(): Promise<DemoSession | null> {
  const cookieStore = await cookies();
  return decodeDemoSession(cookieStore.get(DEMO_SESSION_COOKIE)?.value);
}
