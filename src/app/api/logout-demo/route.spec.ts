import { DEMO_SESSION_COOKIE } from '@pablojtech/loyalty-shared-web/auth';
import { POST } from './route';

function buildRequest(fields: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  return new Request('https://example.com/api/logout-demo', {
    method: 'POST',
    body: formData,
  });
}

describe('POST /api/logout-demo', () => {
  it('redirects to login and clears the demo session cookie', async () => {
    const response = await POST(buildRequest({ locale: 'es' }));

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/login?status=logged-out',
    );

    const setCookie = response.headers.get('set-cookie');
    expect(setCookie).toContain(`${DEMO_SESSION_COOKIE}=`);
    expect(setCookie).toContain('Max-Age=0');
    expect(setCookie).toContain('HttpOnly');
  });

  it('falls back to default locale when the submitted locale is invalid', async () => {
    const response = await POST(buildRequest({ locale: 'pt-BR' }));

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/login?status=logged-out',
    );
  });
});
