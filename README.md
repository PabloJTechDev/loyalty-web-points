# web

Frontend web inicial de la loyalty platform.

## Objetivo
Materializar la experiencia customer sobre el BFF, validando el journey antes de bajar a dominio completo y modelo de base de datos.

## Stack
- Next.js (App Router)
- React
- TypeScript

## Estado actual
MVP funcional con las siguientes vistas:
- `/`
- `/profile-summary`
- `/wallet`

## Integración actual
La web consume `bff-customer` mediante llamadas server-side y cuenta con fallbacks seguros mientras el core real aún no está disponible.

## Variables de entorno
Crear archivo local a partir de `.env.example`:

```bash
cp .env.example .env.local
```

Variable principal:
- `BFF_CUSTOMER_BASE_URL=http://localhost:3002`

## Ejecutar localmente
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Arquitectura frontend
- feature-based modular architecture
- `src/features/customer` para dominio customer
- `src/lib/api` para acceso a BFF
- componentes reutilizables del feature separados de las páginas

## Próximos pasos
- layout compartido
- estados de loading/error más ricos
- integración real con `core-customer` a través del BFF
- segunda vertical: redemption
