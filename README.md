# Vorbește cu Dumnezeu

MVP spiritual creștin, fără API extern AI, cu ghid spiritual bazat pe date predefinite din baza de date.

## Stack
- Frontend: Next.js 16 + TypeScript
- Backend: NestJS 10 + Prisma
- Bază locală: SQLite
- Producție recomandată: PostgreSQL

## Instalare și rulare locală
1. Instalează dependențele:
   - `npm install`
2. Configurează variabilele de mediu:
   - copiază `.env.example` în `.env`
3. Rulează migrațiile:
   - `npm run db:migrate`
4. Rulează seed-ul cu date reale demo:
   - `npm run db:seed`
5. Pornește aplicația:
   - `npm run dev`

## Comenzi principale
- `npm install`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run dev`
- `npm run build`
- `npm run test`

## Date demo login
- Email: `demo@vorbesc-cu-dumnezeu.ro`
- Parolă: `Demo1234!`

## Endpointuri principale
- Auth: `/auth/register`, `/auth/login`, `/auth/me`
- Ghid spiritual: `/spiritual-guide/moods`, `/spiritual-guide/daily`, `/spiritual-guide/message`
- Rugăciuni: `/prayers`, `/prayers/categories`, `/prayers/:id/save`
- Jurnal: `/journal`, `/journal/export`
- Planuri: `/plans`, `/plans/:id`, `/plans/:id/start`, `/plans/progress/:id`
- Comunitate: `/prayer-requests`, `/prayer-requests/:id/support`, `/prayer-requests/:id/report`
- Profil: `/profile`, `/profile/preferences`, `/profile/favorite-verses`, `/profile/saved-prayers`
- Notificări: `/notifications`, `/notifications/:id/read`, `/notifications/read-all`
- Admin: `/admin/metrics`
- Health: `/health`

## Health check
`GET /health`

Răspuns:

```json
{
  "status": "ok",
  "database": "connected",
  "version": "1.0.0"
}
```

## Deploy recomandat
- Frontend: Vercel
- Backend: Railway / Render / Fly.io
- DB: PostgreSQL

Setări producție:
- `DATABASE_URL` -> PostgreSQL
- `JWT_SECRET` -> valoare puternică
- `NEXT_PUBLIC_API_URL` -> URL backend public
- `FRONTEND_URL` -> domeniul frontend pentru CORS

Ghid complet pas cu pas (Vercel + Railway):
- vezi `DEPLOY.md`
