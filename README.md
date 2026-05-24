# Vorbește cu Dumnezeu

MVP spiritual creștin, fără API extern AI, cu ghid spiritual bazat pe date predefinite din baza de date.

## Aplicație live
- https://vorbeste-cu-dumnezeu.vercel.app

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
- Moderare comunitate (admin): `/prayer-requests/moderation/pending`, `/prayer-requests/moderation/:id`
- Analytics: `/analytics/acquisition`
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
- `STRIPE_SECRET_KEY` -> cheie Stripe secret (backend)
- `STRIPE_WEBHOOK_SECRET` -> secret webhook Stripe (backend)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` -> cheie Stripe publică (frontend)
- `NEXT_PUBLIC_APP_URL` -> URL aplicație publică
- `NEXT_PUBLIC_PRIVACY_URL` -> URL pagină privacy policy
- `NEXT_PUBLIC_TERMS_URL` -> URL pagină terms
- `NEXT_PUBLIC_DISCLAIMER_URL` -> URL pagină disclaimer

Ghid complet pas cu pas (Vercel + Railway):
- vezi `DEPLOY.md`

## Monetizare Freemium + Donații

Modelul de monetizare este discret, fără reclame agresive, iar funcțiile spirituale esențiale rămân disponibile gratuit.

### Planuri

- Gratuit
   - versetul zilei
   - rugăciuni de bază
   - jurnal simplu
   - comunitate
   - 3 planuri spirituale gratuite

- Premium Basic
   - toate planurile spirituale
   - favorite nelimitate
   - teme premium
   - rugăciuni audio
   - export PDF elegant
   - notificări personalizate

- Premium Family
   - toate funcțiile premium
   - profiluri familie
   - jurnal comun
   - planuri pentru părinți/copii
   - acces anticipat la funcții noi

### Pagini și endpoint-uri monetizare

- Frontend:
   - `/premium`
   - `/premium/success`
   - `/premium/cancel`

- Backend:
   - `GET /monetization/plans`
   - `GET /monetization/me`
   - `POST /monetization/create-checkout-session`
   - `POST /monetization/create-donation-checkout`
   - `POST /monetization/checkout/subscription`
   - `POST /monetization/checkout/donation`
   - `POST /monetization/checkout/verify`
   - `POST /monetization/subscriptions/:id/cancel`
   - `POST /monetization/webhook`

### Configurare Stripe Sandbox (local)

1. Setează în `.env`:

```env
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
```

2. Pornește aplicația:

```bash
npm run dev
```

3. Rulează Stripe CLI pentru webhook:

```bash
stripe listen --forward-to http://localhost:3001/monetization/webhook
```

4. Copiază secretul generat de Stripe CLI în `STRIPE_WEBHOOK_SECRET`.

### Testare Stripe Sandbox

- Card valid: `4242 4242 4242 4242`
- Expirare: orice dată viitoare
- CVC: orice 3 cifre
- ZIP/Postal: orice cod valid
- Webhook URL: `https://backend-api-production-7f6a.up.railway.app/monetization/webhook`
- Evenimente webhook:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`

### Verificări înainte de deploy producție

- `npm run build` fără erori
- `npm run test` backend fără erori
- `npm run db:migrate` pe baza de date PostgreSQL
- webhook Stripe configurat în Dashboard pe URL-ul backend-ului public:
   - `https://<backend>/monetization/webhook`

### Deploy producție (Vercel + Railway/Fly.io)

- Frontend (Vercel):
   - setează `NEXT_PUBLIC_API_URL`
   - setează `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

- Backend (Railway/Fly.io):
   - setează `DATABASE_URL` PostgreSQL
   - setează `STRIPE_SECRET_KEY`
   - setează `STRIPE_WEBHOOK_SECRET`
   - setează `FRONTEND_URL`

## Comunitate Facebook (integrare manuala)

Aplicatia include integrare catre un grup Facebook oficial, fara automatizari, scraping sau login Facebook.

### Nume grup oficial
- Vorbeste cu Dumnezeu - Comunitate de rugaciune si sprijin

### URL grup oficial
- https://www.facebook.com/groups/vorbestecudumnezeu

### URL aplicatie publica
- https://vorbeste-cu-dumnezeu.vercel.app

### 1) Texte pregatite pentru Facebook

Descriere scurta (max. 150 caractere):
- Comunitate crestina de rugaciune si sprijin: cereri de rugaciune, versete zilnice, incurajare si pace pentru suflet.

Descriere lunga:
- Bine ai venit in comunitatea oficiala Vorbeste cu Dumnezeu. Acest grup este un spatiu de liniste, sprijin spiritual si rugaciune pentru cei care cauta apropiere de Dumnezeu in viata de zi cu zi.
- Aici poti publica cereri de rugaciune, poti citi versete zilnice, poti impartasi ganduri de reflexie si poti primi incurajare din partea unei comunitati respectuoase si empatice.
- Ne dorim un loc cald, potrivit pentru familie, unde fiecare persoana este tratata cu bunatate, fara judecata, cu atentie fata de nevoile reale ale celor din jur.

Reguli comunitate:
- Fara jigniri sau limbaj agresiv.
- Fara politica.
- Fara atacuri religioase sau confesiunale.
- Fara spam.
- Fara promovare agresiva.
- Respect si empatie in toate discutiile.
- Continut potrivit pentru familie.

Mesaj de bun venit pentru membri noi:
- Bine ai venit in comunitatea Vorbeste cu Dumnezeu. Ne bucuram ca esti aici.
- Te incurajam sa postezi cu respect, sinceritate si blandete. Daca ai o cerere de rugaciune, scrie-ne si ne vom ruga alaturi de tine.

Prima postare oficiala in grup:
- Bine ati venit in grupul oficial Vorbeste cu Dumnezeu - Comunitate de rugaciune si sprijin.
- Acest spatiu este dedicat cererilor de rugaciune, versetelor zilnice, incurajarii si reflexiei crestine.
- Va invitam sa pastram un ton cald, cu respect si empatie, astfel incat fiecare persoana sa se simta in siguranta si sustinuta.
- Daca aveti o cerere de rugaciune, o puteti publica aici. Suntem impreuna in credinta, pace si speranta.

### 2) Configurare link grup in aplicatie

1. Creezi manual grupul Facebook oficial.
2. Copiezi linkul grupului (URL public).
3. In fisierul `.env` din root setezi:

```env
NEXT_PUBLIC_FACEBOOK_GROUP_URL="https://www.facebook.com/groups/vorbestecudumnezeu"
NEXT_PUBLIC_APP_PUBLIC_URL="https://vorbeste-cu-dumnezeu.vercel.app"
```

4. Rulezi frontend-ul din nou (`npm run dev`) sau faci redeploy pentru productie.

### 3) Cum functioneaza integrarea

- Daca `NEXT_PUBLIC_FACEBOOK_GROUP_URL` este setat, aplicatia afiseaza butonul:
   - Intra in comunitate
- Aplicatia afiseaza si butonul:
   - Deschide aplicatia
- Daca variabila nu este setata, aplicatia afiseaza:
   - Grupul Facebook va fi disponibil in curand.

Integrarea apare in:
- Home
- Community
- Profile

Componenta folosita:
- `apps/frontend/src/components/ui/FacebookCommunityCard.tsx`

Pagina publica pentru comunitate:
- `/comunitate`

### 4) Testare locala

1. Setezi `NEXT_PUBLIC_FACEBOOK_GROUP_URL` in `.env`.
2. Setezi `NEXT_PUBLIC_APP_PUBLIC_URL` in `.env`.
3. Rulezi `npm run dev`.
4. Verifici paginile `/home`, `/community`, `/profile`.
5. Confirmi ca butonul `Intra in comunitate` deschide grupul `https://www.facebook.com/groups/vorbestecudumnezeu` in tab nou.
6. Confirmi ca butonul `Deschide aplicatia` deschide `https://vorbeste-cu-dumnezeu.vercel.app`.
7. Verifici pagina publica `/comunitate` si aceleasi 2 butoane.
8. Stergi temporar valoarea din `NEXT_PUBLIC_FACEBOOK_GROUP_URL` si verifici mesajul fallback.

### 5) Calendar editorial si texte gata de postat

Pentru activitate reala, legala si autentica in Facebook (fara boți, fara like-uri artificiale, fara comentarii false), foloseste fisierul:

- `FACEBOOK_COMMUNITY_PLAN.md`

Acesta include:
- descriere grup
- postare de bun venit
- postare fixata (pinned)
- reguli grup
- mesaj pentru membri noi
- 14 postari zilnice gata de publicare manuala
- calendar editorial complet pe 14 zile

### 6) Securitate si conformitate

- Nu se salveaza date Facebook in baza de date.
- Nu se foloseste scraping.
- Nu se foloseste Facebook Login in aceasta etapa.
- Integrarea este strict un link extern catre grupul oficial.

## Disclaimer oficial

Aplicația afișează pe ecranele principale următorul disclaimer:

"Această aplicație oferă rugăciuni, reflecții și sprijin spiritual. Nu înlocuiește ajutorul medical, psihologic, juridic sau pastoral."

Aplicația nu vorbește în numele lui Dumnezeu, nu promite vindecări și nu oferă garanții spirituale.

## GDPR și legal compliance

- Rute publice legale:
   - `/privacy-policy`
   - `/terms`
   - `/disclaimer`
- Alias menținute pentru compatibilitate:
   - `/privacy`
- Gestionare consimțământ cookie/analytics/marketing:
   - banner global de consimțământ
   - setări în profil
- Funcții GDPR în profil:
   - export date
   - descărcare date personale
   - ștergere cont

Documente legale în root:
- `privacy-policy.md`
- `terms-of-service.md`
- `spiritual-disclaimer.md`

## Security hardening (backend)

- `helmet` activ pentru secure headers
- rate limiting global (`120 req/min/IP`)
- filtru global pentru excepții în producție (fără stack trace în răspuns)
- verificare strictă `JWT_SECRET` în producție (refuză pornirea cu secret invalid)

## Pregătire Google Play (PWA/TWA)

- Manifest + Service Worker de bază în frontend
- Manifest static suplimentar: `apps/frontend/public/manifest.json`
- Pagini publice: `/privacy-policy`, `/terms`, `/disclaimer`
- Asset-uri de publicare în `play-store-assets/`
- Fișiere obligatorii:
   - `play-store-assets/content-rating.md`
   - `play-store-assets/data-safety.md`
- Pentru TWA (Bubblewrap):
   1. `npm i -g @bubblewrap/cli`
   2. `bubblewrap init --manifest https://<domeniu-frontend>/manifest.webmanifest`
   3. `bubblewrap build`
