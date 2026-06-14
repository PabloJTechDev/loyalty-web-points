# loyalty-web-points

Customer-facing frontend for the **customer-first** loyalty journey.

This app is the presentation layer of the case study. It consumes the BFF server-side, exposes the end-user flow, and keeps the UI coherent across enrollment, password change, login, and authenticated navigation.

Part of the ecosystem:

- `loyalty-web-points` → customer-facing frontend in **Next.js**
- `loyalty-bff-points` → experience-oriented BFF in **NestJS**
- `loyalty-core-points` → technical core service in **Go + Postgres**

```text
Next.js web → NestJS BFF → Go core service + Postgres traces
```

---

## What this app is responsible for

`loyalty-web-points` turns backend orchestration into a usable experience.

It is responsible for:

- rendering the customer-facing journey
- consuming the BFF through server-side fetches
- showing receipts and traceability screens for each stage
- protecting the authenticated area with a demo session cookie
- keeping the UI resilient through safe fallbacks when the backend is unavailable

---

## Journey covered

Implemented flow:

```text
enrollment → password change → login → authenticated session
```

Routes already available:

- `/{locale}` → home
- `/{locale}/profile-summary` → profile summary
- `/{locale}/wallet` → wallet
- `/{locale}/enroll` → enrollment form
- `/{locale}/enroll/success` → enrollment receipt
- `/{locale}/traces/[transactionId]` → enrollment trace
- `/{locale}/password-change` → password change form
- `/{locale}/password-change/success` → password change receipt
- `/{locale}/password-change/traces/[requestId]` → password change trace
- `/{locale}/login` → login form
- `/{locale}/login/success` → login receipt
- `/{locale}/login/traces/[loginId]` → login trace
- `/{locale}/authenticated` → protected authenticated area

---

## Technical highlights

- **Next.js App Router** with server components where it helps
- **server-side integration** with `loyalty-bff-points`
- **signed demo session cookie** with server-side expiration validation
- **route protection** for authenticated area without depending on query params
- **feature-oriented frontend structure**
- **i18n support** through localized messages
- **safe fallbacks** for customer home/profile/wallet data

---

## Auth demo hardening

The authenticated area is still demo auth, but it is no longer a naive base64 cookie.

Current protections:

- `httpOnly` cookie
- HMAC signature
- server-side expiry validation
- required `AUTH_DEMO_COOKIE_SECRET` in runtime environment
- protected route flow through auth guard/proxy logic
- customer snapshot available in authenticated UI

Key files:

- `src/lib/auth/session.ts`
- `src/lib/auth/guards.ts`
- `src/app/api/login-demo/route.ts`
- `src/app/api/logout-demo/route.ts`
- `src/proxy.ts`

---

## Shared Package

i18n, auth helpers, Prometheus metrics, and common UI components are consumed from the shared package:

```json
"@pablojtech/loyalty-shared-web": "github:PabloJTechDev/loyalty-shared-web#main"
```

| Module | Provides |
|---|---|
| `/i18n` | `Locale`, `getDictionary`, `formatDate`, `formatPoints` |
| `/auth` | `DemoSession`, `getDemoSession` |
| `/metrics` | `businessTransactionsTotal`, `observeRequest` |
| `/ui` | `MetricCard`, `SectionTitle`, `LocaleSwitcher` |
| `/ui/state` | `EmptyState`, `ErrorState`, `LoadingState` |

---

## Architecture notes

Frontend structure follows a **feature-based modular approach**.

Important folders:

- `src/features/customer` → customer-facing feature components
- `src/lib/api` → BFF access layer
- `src/lib/auth` → session and auth helpers
- `src/messages` → localized strings

This keeps the UI organized around domain experience instead of generic folders only.

---

## Related repositories

- `loyalty-bff-points` → backend-for-frontend that powers this UI
- `loyalty-core-points` → technical traceability service used by the BFF

This repo should be readable on its own, but it is stronger when reviewed together with the BFF and core repos as one portfolio slice.

---

## Environment

Create a local env file from the example:

```bash
cp .env.example .env.local
```

Main variables:

- `BFF_POINTS_BASE_URL=http://localhost:3002`
- `AUTH_DEMO_COOKIE_SECRET=change-me-for-publication-demo`

---

## Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Test:

```bash
npm test
```

---

## Validation status

This app has already been validated with:

- `npm test` ✅
- `npm run build` ✅

Current test coverage includes:

- session codec
- login handler
- logout handler
- enrollment handler
- password-change handler
- route protection proxy

---

## Related assets

- hero image: `public/hero-fintech-loyalty.svg`
- future image prompt: `docs/hero-image-prompt.md`

Note: cross-repo architecture docs and case-study narrative currently live outside this repo and are intentionally not duplicated here yet.

---

## What I would improve next

1. add richer loading and error states
2. add server-side tests for protected layouts and guards
3. remove remaining controlled mock dependencies from authenticated snapshot flow
4. add richer auth/session observability for demo debugging
5. add a short visual walkthrough/GIF for public presentation
