import { POST } from './route';

function buildRequest(fields: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  return new Request('https://example.com/api/enrollment-demo', {
    method: 'POST',
    body: formData,
  });
}

describe('POST /api/enrollment-demo', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('redirects to enroll error when backend returns non-ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    const response = await POST(
      buildRequest({ locale: 'es', email: 'pablo@example.com' }),
    );

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/enroll?status=error',
    );
  });

  it('redirects to success and includes emailHash when backend returns it', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          transactionId: 'txn_123',
          verification: { emailHash: 'hash_123' },
        }),
      }),
    );

    const response = await POST(
      buildRequest({ locale: 'es', email: 'pablo@example.com' }),
    );

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/enroll/success?transactionId=txn_123&emailHash=hash_123',
    );
  });

  it('falls back to default locale when submitted locale is invalid', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          transactionId: 'txn_999',
        }),
      }),
    );

    const response = await POST(
      buildRequest({ locale: 'pt-BR', email: 'pablo@example.com' }),
    );

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/enroll/success?transactionId=txn_999',
    );
  });
});
