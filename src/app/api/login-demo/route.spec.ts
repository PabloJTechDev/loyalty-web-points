import { DEMO_SESSION_COOKIE } from '@pablojtech/loyalty-shared-web/auth';
import { POST } from './route';

function buildRequest(fields: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  return new Request('https://example.com/api/login-demo', {
    method: 'POST',
    body: formData,
  });
}

describe('POST /api/login-demo', () => {
  beforeEach(() => {
    vi.stubEnv('AUTH_DEMO_COOKIE_SECRET', 'test-secret');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('redirects to login when requestId is missing', async () => {
    const response = await POST(buildRequest({ locale: 'es' }));

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/login?status=missing-request',
    );
  });

  it('redirects to login when the password change trace is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );

    const response = await POST(
      buildRequest({ locale: 'es', requestId: 'pwd_missing' }),
    );

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/login?status=password-change-not-found&requestId=pwd_missing',
    );
  });

  it('redirects to success and sets the demo session cookie on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          loginId: 'login_123',
          requestId: 'pwd_123',
          transactionId: 'txn_123',
          customerSnapshot: {
            customerId: 'cust_001',
            fullName: 'Pablo Valverde',
            maskedEmail: 'pa***@example.com',
            tierName: 'Gold',
          },
        }),
      }),
    );

    const response = await POST(
      buildRequest({ locale: 'es', requestId: 'pwd_123' }),
    );

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/login/success?loginId=login_123&requestId=pwd_123&transactionId=txn_123',
    );

    const setCookie = response.headers.get('set-cookie');
    expect(setCookie).toContain(`${DEMO_SESSION_COOKIE}=`);
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('Max-Age=28800');
    expect(setCookie).toContain('SameSite=lax');
  });
});
