import { POST } from './route';

function buildRequest(fields: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  return new Request('https://example.com/api/password-change-demo', {
    method: 'POST',
    body: formData,
  });
}

describe('POST /api/password-change-demo', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('redirects when transactionId is missing', async () => {
    const response = await POST(buildRequest({ locale: 'es' }));

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/password-change?status=missing-transaction',
    );
  });

  it('redirects when enrollment trace is not found', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );

    const response = await POST(
      buildRequest({ locale: 'es', transactionId: 'txn_missing' }),
    );

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/password-change?status=enrollment-not-found&transactionId=txn_missing',
    );
  });

  it('redirects to success when backend accepts password change', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          requestId: 'pwd_123',
          transactionId: 'txn_123',
        }),
      }),
    );

    const response = await POST(
      buildRequest({ locale: 'es', transactionId: 'txn_123' }),
    );

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/password-change/success?requestId=pwd_123&transactionId=txn_123',
    );
  });

  it('falls back to default locale when submitted locale is invalid', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          requestId: 'pwd_999',
          transactionId: 'txn_999',
        }),
      }),
    );

    const response = await POST(
      buildRequest({ locale: 'pt-BR', transactionId: 'txn_999' }),
    );

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/password-change/success?requestId=pwd_999&transactionId=txn_999',
    );
  });
});
