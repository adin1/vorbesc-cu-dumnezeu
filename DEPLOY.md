# Deploy Cloud (Vercel + Railway)

Acest ghid configureaza frontend-ul pe Vercel si backend-ul + DB pe Railway.

## 1. Cerinte
- Repository GitHub deja actualizat
- Cont Vercel
- Cont Railway

## 2. Deploy backend pe Railway

### 2.1 Creeaza proiectul
1. In Railway: New Project -> Deploy from GitHub Repo
2. Selecteaza repository-ul `adin1/vorbesc-cu-dumnezeu`
3. Root directory service: `apps/backend`

### 2.2 Comenzi build/start
- Build command: `npm install && npm run build`
- Start command: `npm run start:prod`

### 2.3 Adauga PostgreSQL
1. In proiectul Railway: Add -> Database -> PostgreSQL
2. Railway va genera `DATABASE_URL` pentru serviciu

### 2.4 Variabile de mediu backend
Seteaza in serviciul backend:
- `NODE_ENV=production`
- `PORT=4000`
- `DATABASE_URL=<Railway PostgreSQL URL>`
- `JWT_SECRET=<valoare lunga si unica>`
- `FRONTEND_URL=<URL-ul frontendului Vercel>`
- `DASHBOARD_CACHE_ADMIN_EMAIL=admin@example.com`
- `DASHBOARD_CACHE_OP_WINDOW_MS=60000`
- `DASHBOARD_CACHE_OP_MAX_REQUESTS=8`

### 2.5 Migrare + seed productie
Dupa primul deploy, ruleaza in Railway shell pentru backend:
- `npx prisma migrate deploy`
- `npm run prisma:seed`

### 2.6 Verifica health
Deschide:
- `https://<backend-domain>/health`

Raspuns asteptat:
```json
{
  "status": "ok",
  "database": "connected",
  "version": "1.0.0"
}
```

## 3. Deploy frontend pe Vercel

### 3.1 Import proiect
1. In Vercel: Add New -> Project
2. Selecteaza repository-ul `adin1/vorbesc-cu-dumnezeu`
3. Root directory: `apps/frontend`

### 3.2 Build settings frontend
- Framework Preset: Next.js
- Build command: `npm run build`
- Output: default Next.js

### 3.3 Variabile de mediu frontend
Seteaza in Vercel Project Settings -> Environment Variables:
- `NEXT_PUBLIC_API_URL=https://<backend-domain>`
- `NEXT_PUBLIC_ENABLE_DASHBOARD_DIAGNOSTICS=false`

## 4. Aliniere CORS
Dupa ce ai URL-ul final Vercel, actualizeaza pe Railway:
- `FRONTEND_URL=https://<frontend-domain>`

Redeploy backend dupa modificare.

## 5. Checklist final
- Frontend se deschide fara erori
- Login cu demo functioneaza
- Endpoint `GET /health` returneaza database connected
- Endpoint protejat `GET /auth/me` functioneaza cu token

## 6. Comenzi utile
Din root local:
- `npm install`
- `npm run build`
- `npm run test -w apps/backend`

Backend local:
- `npm run prisma:migrate -w apps/backend`
- `npm run prisma:seed -w apps/backend`
- `npm run start:dev -w apps/backend`

Frontend local:
- `npm run dev -w apps/frontend`
