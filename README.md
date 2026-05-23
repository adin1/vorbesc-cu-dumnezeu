# Vorbește cu Dumnezeu

Aplicație creștină/spirituală modernă cu companion spiritual AI care oferă răspunsuri inspirate din Biblie, rugăciune și reflecție creștină.

## Disclaimer
Răspunsurile sunt generate automat pentru sprijin spiritual și nu înlocuiesc preotul, duhovnicul, psihologul sau ajutorul de urgență.

## Stack
- Frontend: Next.js (TypeScript)
- Backend: NestJS + Prisma (SQLite local dev fallback, PostgreSQL-ready architecture)
- Auth: JWT
- Monorepo: npm workspaces

## Structură
- `apps/frontend` - aplicația web
- `apps/backend` - API REST NestJS

## Instalare
1. Instalează dependențele:
   - `npm install`
2. Pentru rulare rapidă locală, proiectul folosește SQLite prin `.env`.
3. Pentru PostgreSQL (producție), schimbă `provider` în `postgresql` în `apps/backend/prisma/schema.prisma` și setează `DATABASE_URL` corespunzător.
4. Configurează variabilele:
   - copiază `.env.example` în `.env`
5. Generează clientul Prisma:
   - `npm run prisma:generate -w apps/backend`
6. Rulează migrațiile:
   - `npm run prisma:migrate -w apps/backend`
7. Rulează seed pentru mock data:
   - `npm run prisma:seed -w apps/backend`
8. Pornește backend și frontend în terminale separate:
   - `npm run dev:backend`
   - `npm run dev:frontend`

## API principal
- Auth: `/auth/register`, `/auth/login`, `/auth/me`
- AI: `/ai/chat`, `/ai/generate-prayer`, `/ai/explain-verse`
- Journal: `/journal`, `/journal/export`
- Prayers: `/prayers`, `/prayers/categories`, `/prayers/generate`
- Plans: `/plans`, `/plans/:id`, `/plans/:id/start`, `/plans/progress/:id`
- Community: `/prayer-requests`, `/prayer-requests/:id/support`, `/prayer-requests/:id/report`
- GDPR: `/gdpr/export`, `/gdpr/delete-account`
- Dashboard cache diagnostics:
   - `/profile/dashboard/cache-stats`
   - `/profile/dashboard/cache-stats/reset`
   - `/profile/dashboard/cache/clear`
   - `/profile/dashboard/cache/clear-all` (doar pentru `DASHBOARD_CACHE_ADMIN_EMAIL`)

## Feature flags
- `NEXT_PUBLIC_ENABLE_DASHBOARD_DIAGNOSTICS=true` activează cardul de diagnostic cache în frontend.

## Rate limiting operații cache
- Endpointurile de operații cache (`cache-stats/reset`, `cache/clear`, `cache/clear-all`) sunt limitate per utilizator.
- Variabile configurabile:
   - `DASHBOARD_CACHE_OP_WINDOW_MS` (implicit 60000)
   - `DASHBOARD_CACHE_OP_MAX_REQUESTS` (implicit 8)
