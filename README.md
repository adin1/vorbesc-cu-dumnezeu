# Vorbește cu Dumnezeu

MVP spiritual creștin, fără API extern AI, cu ghid spiritual bazat pe date predefinite din baza de date.

## Aplicație live
- https://vorbeste-cu-Dumnezeu.vercel.app

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

## Comunitate Facebook (integrare manuala)

Aplicatia include integrare catre un grup Facebook oficial, fara automatizari, scraping sau login Facebook.

### Nume grup oficial
- Vorbeste cu Dumnezeu - Comunitate de rugaciune si sprijin

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
NEXT_PUBLIC_FACEBOOK_GROUP_URL="https://facebook.com/groups/..."
```

4. Rulezi frontend-ul din nou (`npm run dev`) sau faci redeploy pentru productie.

### 3) Cum functioneaza integrarea

- Daca `NEXT_PUBLIC_FACEBOOK_GROUP_URL` este setat, aplicatia afiseaza butonul:
   - Intra in grupul de rugaciune
- Daca variabila nu este setata, aplicatia afiseaza:
   - Grupul Facebook va fi disponibil in curand.

Integrarea apare in:
- Home
- Community
- Profile

### 4) Testare locala

1. Setezi `NEXT_PUBLIC_FACEBOOK_GROUP_URL` in `.env`.
2. Rulezi `npm run dev`.
3. Verifici paginile `/home`, `/community`, `/profile`.
4. Confirmi ca butonul deschide grupul in tab nou.
5. Stergi temporar valoarea din `.env` si verifici mesajul fallback.

### 5) Securitate si conformitate

- Nu se salveaza date Facebook in baza de date.
- Nu se foloseste scraping.
- Nu se foloseste Facebook Login in aceasta etapa.
- Integrarea este strict un link extern catre grupul oficial.
