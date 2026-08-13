# Besplatan production deployment

Koristimo Cloudflare Workers za Next.js frontend, Render Free za NestJS API, Neon Free za PostgreSQL i Cloudinary Free za slike. Hosting može koštati 0 USD; domen je opcion.

## Ograničenja

- Render Free uspava API posle 15 minuta bez saobraćaja; prvi zahtev zatim može čekati približno minut.
- Render workspace dobija 750 zajedničkih besplatnih instance sati mesečno.
- Pratite Neon Usage limite za prostor, compute i prenos.
- `MAINTENANCE_JOBS_ENABLED=false`: uspavani servis nije pouzdan scheduler. Maintenance CLI pokreće se ručno po potrebi.
- Vercel Hobby nije namenjen komercijalnoj prodavnici.

## 0. Nalozi i bezbednost

Potrebni su GitHub, Cloudflare, Render, Neon i Cloudinary nalozi. Tajne se nikada ne upisuju u Git. Ako je Neon connection string ranije prikazan u terminalu ili poruci, promenite database password pre produkcije.

## 1. Neon baza

1. Napravite Neon projekat u evropskom regionu.
2. U **Connect** kopirajte pooled PostgreSQL connection string sa `sslmode=require`.
3. Sačuvajte ga za Render secret `DATABASE_URL`; ne stavljajte ga u dokumentaciju ili Git.

Migracije i idempotentni početni katalog automatski se izvršavaju pri startu API kontejnera.

## 2. Cloudinary

Zapišite Cloud name, API key i API secret. API secret unosite samo u Render Environment, nikada u frontend ili `NEXT_PUBLIC_*` promenljivu.

## 3. Render Free API

1. Pushujte repozitorijum na GitHub.
2. Izaberite **New > Blueprint**, povežite repo i root `render.yaml`.
3. Mora se kreirati samo `borska-farmica-api` sa planom **Free**. Ako vidite plaćeni plan ili Render bazu, prekinite.
4. Unesite `DATABASE_URL`, `FRONTEND_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` i `CLOUDINARY_API_SECRET`.
5. Za prvi deploy privremeno dodajte `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD` (12–128 znakova), `BOOTSTRAP_ADMIN_FIRST_NAME`, `BOOTSTRAP_ADMIN_LAST_NAME`, `BOOTSTRAP_ADMIN_ROLE=SUPER_ADMIN` i `BOOTSTRAP_ADMIN_CONFIRM=CREATE_ADMIN`.
6. Deploy pokreće migracije, seed, admin bootstrap i API.
7. Kada log pokaže `Admin account created`, uklonite svih šest `BOOTSTRAP_ADMIN_*` promenljivih. Nalog ostaje u bazi.
8. Zapišite API origin i proverite `/api/v1/health` i `/api/v1/health/ready`.

Ako Render nalog ima karticu, uključite najstroža dostupna billing upozorenja i limite.

## 4. Cloudflare Workers frontend

Cloudflare podržava Next.js 16 preko OpenNext adaptera. Konfiguracija je u `apps/web/wrangler.jsonc`.

U root terminalu:

```powershell
npm install
npx wrangler login
```

Kopirajte `apps/web/.dev.vars.example` u `apps/web/.dev.vars` i unesite stvarne vrednosti:

```text
API_INTERNAL_URL=https://TVOJ-API.onrender.com/api/v1
NEXT_PUBLIC_API_URL=https://TVOJ-API.onrender.com/api/v1
NEXT_PUBLIC_SITE_URL=https://borska-farmica.TVOJ-SUBDOMAIN.workers.dev
```

Deploy iz root-a:

```powershell
npm run cf:deploy --workspace=@borska-farmica/web
```

Wrangler prikazuje stvarni `workers.dev` URL.

Za GitHub deploye povežite repo sa Cloudflare Workers Builds i postavite:

- Root directory: `/`
- Build command: `npm run cf:build --workspace=@borska-farmica/web`
- Deploy command: `npx wrangler deploy --config apps/web/wrangler.jsonc`
- Production branch: `main`

U **Build Variables and secrets** dodajte `API_INTERNAL_URL`, `NEXT_PUBLIC_API_URL` i `NEXT_PUBLIC_SITE_URL`. `NEXT_PUBLIC_*` mora postojati tokom builda.

## 5. Uskladite URL-ove

1. Render `FRONTEND_URL` postavite na tačan Cloudflare origin bez završne kose crte.
2. Cloudflare `NEXT_PUBLIC_SITE_URL` postavite na isti origin.
3. Oba API URL-a moraju sadržati `/api/v1` bez završne kose crte.
4. Redeployujte Render API, zatim Cloudflare frontend.

Ovo je obavezno zbog CORS-a i secure cross-site cookie prijave.

## 6. Završni test

U privatnom prozoru proverite:

1. Sve javne stranice i detalje proizvoda.
2. Registraciju, odjavu i ponovnu prijavu customer naloga.
3. Korpu, količine i checkout za obe pickup lokacije.
4. Admin prijavu kroz `/prijava` i link ka dashboardu.
5. Potvrdu porudžbine, promene statusa i customer prikaz.
6. Admin upload JPEG/WebP slike na Cloudinary.
7. Mobilni prikaz i navigaciju.
8. Ponovno otvaranje posle 20 minuta, uključujući Render cold start.

## 7. Domen (opciono)

Za 0 USD koristite `workers.dev` i `onrender.com`. Ako kupite domen, povežite ga sa Workerom, promenite Render `FRONTEND_URL` i Cloudflare `NEXT_PUBLIC_SITE_URL`, pa redeployujte oba servisa. Proverite cenu obnove domena, ne samo promociju prve godine.

## Lokalni razvoj

Cloudflare konfiguracija ne menja lokalnu komandu `npm run dev`. Lokalni `.env` ostaje odvojen od produkcijskih secrets.
