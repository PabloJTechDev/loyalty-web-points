import {
  decodeDemoSession,
  encodeDemoSession,
  type DemoSession,
} from './session';

describe('demo session codec', () => {
  const originalSecret = process.env.AUTH_DEMO_COOKIE_SECRET;

  beforeEach(() => {
    process.env.AUTH_DEMO_COOKIE_SECRET = 'test-demo-cookie-secret';
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.AUTH_DEMO_COOKIE_SECRET;
      return;
    }

    process.env.AUTH_DEMO_COOKIE_SECRET = originalSecret;
  });

  const session: DemoSession = {
    loginId: 'login_123',
    fullName: 'Pablo Valverde',
    tier: 'Gold',
    customerId: 'cust_001',
    maskedEmail: 'pa***@example.com',
  };

  it('encodes and decodes a valid signed demo session', () => {
    const encoded = encodeDemoSession(session, 1_700_000_000_000);
    const decoded = decodeDemoSession(encoded, 1_700_000_100_000);

    expect(decoded).toEqual(session);
  });

  it('returns null for malformed payload', () => {
    expect(decodeDemoSession('definitely-not-a-valid-cookie')).toBeNull();
  });

  it('returns null when signature does not match', () => {
    const encoded = encodeDemoSession(session, 1_700_000_000_000);
    const tampered = `${encoded.slice(0, -1)}x`;

    expect(decodeDemoSession(tampered, 1_700_000_100_000)).toBeNull();
  });

  it('returns null when payload is expired', () => {
    const encoded = encodeDemoSession(session, 1_700_000_000_000);

    expect(decodeDemoSession(encoded, 1_700_000_000_000 + 28_900_000)).toBeNull();
  });

  it('returns null when required fields are missing', () => {
    const payload = Buffer.from(
      JSON.stringify({ loginId: 'login_123', expiresAt: Date.now() + 1000 }),
      'utf8',
    ).toString('base64url');
    const invalid = `${payload}.invalid-signature`;

    expect(decodeDemoSession(invalid)).toBeNull();
  });

  it('throws when AUTH_DEMO_COOKIE_SECRET is missing during encode', () => {
    delete process.env.AUTH_DEMO_COOKIE_SECRET;

    expect(() => encodeDemoSession(session)).toThrow(
      'AUTH_DEMO_COOKIE_SECRET is required',
    );
  });
});
