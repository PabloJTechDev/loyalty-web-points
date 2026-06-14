import { DEMO_SESSION_COOKIE } from '@/shared/auth/session';
import { proxy } from './proxy';

function createRequest(url: string, cookieValue?: string) {
  const nextUrl = new URL(url) as URL & { clone: () => URL };
  nextUrl.clone = () => new URL(nextUrl.toString());

  return {
    nextUrl,
    cookies: {
      get: (name: string) => {
        if (name === DEMO_SESSION_COOKIE && cookieValue) {
          return { value: cookieValue };
        }

        return undefined;
      },
    },
  } as never;
}

describe('proxy', () => {
  it('redirects paths without locale to default locale', () => {
    const response = proxy(createRequest('https://example.com/profile-summary'));

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/profile-summary',
    );
  });

  it('redirects protected authenticated route when cookie is missing', () => {
    const response = proxy(createRequest('https://example.com/es/authenticated'));

    expect(response.headers.get('location')).toBe(
      'https://example.com/es/login?status=auth-required',
    );
  });

  it('allows protected authenticated route when cookie exists', () => {
    const response = proxy(
      createRequest('https://example.com/es/authenticated', 'session-cookie'),
    );

    expect(response.headers.get('location')).toBeNull();
  });

  it('ignores api routes', () => {
    const response = proxy(createRequest('https://example.com/api/login-demo'));

    expect(response.headers.get('location')).toBeNull();
  });
});
