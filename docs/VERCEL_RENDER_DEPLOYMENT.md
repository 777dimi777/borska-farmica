# Vercel + Render deployment

Ovo uputstvo postavlja Next.js frontend na Vercel, NestJS API i PostgreSQL na Render, a slike koje administrator dodaje na Cloudinary.

## Pre poÄetka

Potrebni su GitHub repozitorijum, Vercel nalog, Render nalog i Cloudinary nalog. Nemoj unositi tajne u Git, issue ili chat. Render Blueprint namerno traÅ¾i da se `FRONTEND_URL` i Cloudinary kredencijali unesu u Render Dashboard-u. JWT tajne Render generiÅ¡e automatski.

## 1. Push deployment konfiguracije

Deployment koristi:

- `render.yaml` za API i PostgreSQL;
- `apps/api/Dockerfile` za API image;
- `apps/web/vercel.json` za Next.js;
- `apps/web/.env.production.example` kao spisak Vercel promenljivih.

## 2. Kreiraj Render Blueprint

1. U Render Dashboard-u izaberi **New > Blueprint**.
2. PoveÅ¾i GitHub repozitorijum i izaberi `render.yaml` iz root-a.
3. Render Ä‡e kreirati `borska-farmica-api` i `borska-farmica-db` u Frankfurt regionu.
4. Za `FRONTEND_URL` unesi taÄan Vercel production origin, na primer `https://borska-farmica.vercel.app`. Bez putanje i bez zavrÅ¡ne kose crte.
5. Unesi Cloudinary `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` i `CLOUDINARY_API_SECRET`.
6. Potvrdi Blueprint deploy.

Pre svakog API deploya Render izvrÅ¡ava `prisma migrate deploy`. Samo pri prvom deployu izvrÅ¡ava idempotentni seed kategorija, lokacija i poÄetnog kataloga. API readiness provera je `/api/v1/health/ready`.

Ako Render dodeli drugaÄiji API hostname, zapiÅ¡i ceo origin, na primer `https://borska-farmica-api-xxxx.onrender.com`.

## 3. Kreiraj Vercel projekat

1. U Vercel Dashboard-u izaberi **Add New > Project** i poveÅ¾i isti repozitorijum.
2. Root Directory postavi na `apps/web`.
3. Framework Preset ostavi **Next.js**. Install, build i output komande ostavi na Vercel automatskim vrednostima za Turborepo/npm workspace.
4. U Environment Variables dodaj za **Production**:

   - `API_INTERNAL_URL=https://TVOJ-RENDER-API.onrender.com/api/v1`
   - `NEXT_PUBLIC_API_URL=https://TVOJ-RENDER-API.onrender.com/api/v1`
   - `NEXT_PUBLIC_SITE_URL=https://TVOJ-VERCEL-DOMEN.vercel.app`

5. Iste tri promenljive dodaj za Preview samo ako preview treba da koristi production API. Za bezbedniji rad preview moÅ¾e ostati iskljuÄen dok ne postoji odvojena staging baza.
6. Pokreni deploy.

Posle prvog Vercel deploya proveri stvarni hostname. Ako se razlikuje od `FRONTEND_URL` na Render-u, ispravi Render promenljivu i redeployuj API. Origin mora biti potpuno isti jer API koristi strogi CORS i origin check.

## 4. Kreiraj prvog production administratora

U Render Shell-u API servisa privremeno dodaj sledeÄ‡e environment promenljive:

- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_PASSWORD` (jedinstvena lozinka od najmanje 12 znakova)
- `BOOTSTRAP_ADMIN_FIRST_NAME`
- `BOOTSTRAP_ADMIN_LAST_NAME`
- `BOOTSTRAP_ADMIN_ROLE=SUPER_ADMIN`
- `BOOTSTRAP_ADMIN_CONFIRM=CREATE_ADMIN`

Zatim u Shell-u pokreni:

```bash
cd apps/api
node dist/prisma/admin-bootstrap.js
```

Odmah nakon uspeha obriÅ¡i svih Å¡est bootstrap promenljivih iz Render-a. Bootstrap je idempotentan i neÄ‡e pregaziti postojeÄ‡i nalog.

## 5. Provera posle deploya

Proveri sledeÄ‡im redom:

1. `https://TVOJ-API/api/v1/health` vraÄ‡a uspeÅ¡an odgovor.
2. `https://TVOJ-API/api/v1/health/ready` prijavljuje spremnu bazu.
3. Otvori Vercel URL i proveri poÄetnu, Ponudu i detalj proizvoda.
4. Registruj nov customer nalog i prijavi se.
5. Dodaj proizvod u korpu, promeni koliÄinu i zavrÅ¡i porudÅ¾binu za obe pickup lokacije.
6. Prijavi se kao admin kroz obiÄnu `/prijava` stranicu.
7. Potvrdi porudÅ¾binu, promeni statuse i proveri customer prikaz.
8. U admin katalogu uploaduj jednu malu WebP/JPEG sliku i potvrdi da je Cloudinary URL saÄuvan.
9. Proveri mobilni prikaz i odjavljivanje customer/admin naloga.

## Domen

Kada dodaÅ¡ svoj domen, preporuÄena postavka je:

- `www.tvoj-domen.rs` ili `tvoj-domen.rs` na Vercel;
- `api.tvoj-domen.rs` na Render.

Tada aÅ¾uriraj Render `FRONTEND_URL` i sve tri Vercel promenljive. Ako su frontend i API pod istim glavnim domenom, cookie SameSite vrednosti mogu kasnije biti vraÄ‡ene sa `none` na `lax`.

## Operativne napomene

- Ne ukljuÄuj viÅ¡e od jedne API instance sa `MAINTENANCE_JOBS_ENABLED=true` bez izdvajanja scheduler-a.
- Render baza nije zamena za provereni backup. UkljuÄi Render backup/retention prema izabranom planu.
- Rakiju ne objavljuj za online naruÄivanje pre poslovne i pravne provere.
- Posle svake promene production URL-a redeployuj i Vercel i Render.
