# Borska Farmica

Borska Farmica je e-commerce platforma za domaÃƒâ€žÃ¢â‚¬Â¡e proizvode sa farme, sa glavnim fokusom na sir, kozje mleko i surutku. Projekat je trenutno u aktivnom razvoju.

Detaljni ciljevi i redosled razvoja nalaze se u [projektnom briefu](docs/PROJECT_BRIEF.md), [roadmapu](docs/ROADMAP.md) i [modelu domena kataloga](docs/CATALOG_DOMAIN.md).

## TehnoloÃƒâ€¦Ã‚Â¡ki stack

- Node.js 24 LTS i npm 11.12.1 workspaces
- Turborepo 2.10.8
- Next.js 16.2.12, React 19.2.4 i Tailwind CSS 4
- NestJS 11
- Prisma 7.9.1
- PostgreSQL 17 preko Docker Compose-a
- TypeScript 5

## Preduslovi

- Node.js 24
- npm 11.12.1, prema `packageManager` polju u root `package.json`
- Git
- Docker Desktop sa Docker Compose podrÃƒâ€¦Ã‚Â¡kom

## Lokalno pokretanje ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Windows PowerShell

1. Klonirajte repozitorijum i uÃƒâ€žÃ¢â‚¬Ëœite u projekat:

   ```powershell
   git clone https://github.com/777dimi777/borska-farmica.git
   Set-Location borska-farmica
   ```

2. Instalirajte dependency pakete:

   ```powershell
   npm install
   ```

3. Napravite lokalni API environment fajl:

   ```powershell
   Copy-Item apps/api/.env.example apps/api/.env
   ```

   `.env.example` sadrÃƒâ€¦Ã‚Â¾i iskljuÃƒâ€žÃ‚Âivo lokalne razvojne vrednosti. Ne commitujte `.env`.

4. Pokrenite PostgreSQL i proverite da je zdrav:

   ```powershell
   docker compose up -d postgres
   docker compose ps
   ```

5. GeneriÃƒâ€¦Ã‚Â¡ite Prisma Client:

   ```powershell
   npm run prisma:generate --workspace=@borska-farmica/api
   ```

6. Pokrenite frontend i API iz root foldera:

   ```powershell
   npm run dev
   ```

7. Zaustavite razvojne procese sa `Ctrl+C`, a bazu komandom:

   ```powershell
   docker compose stop
   ```

Prva kataloÃƒâ€¦Ã‚Â¡ka migracija je uvedena. Za kreiranje naredne razvojne migracije koristi se:

```powershell
npm run prisma:migrate --workspace=@borska-farmica/api
```

## Lokalne adrese

| Servis     | Adresa                                    |
| ---------- | ----------------------------------------- |
| Frontend   | http://localhost:3000                     |
| API root   | http://localhost:4000/api/v1              |
| Liveness   | http://localhost:4000/api/v1/health       |
| Readiness  | http://localhost:4000/api/v1/health/ready |
| PostgreSQL | localhost:5434                            |

Liveness potvrÃƒâ€žÃ¢â‚¬Ëœuje da API proces radi i ne zavisi od baze. Readiness izvrÃƒâ€¦Ã‚Â¡ava minimalni `SELECT 1`; vraÃƒâ€žÃ¢â‚¬Â¡a HTTP 200 i `database: up` kada je baza dostupna, odnosno HTTP 503 i bezbedan `database: down` odgovor kada nije.

## Korisne komande

### Kvalitet i razvoj

| Komanda                | Namena                                                                  |
| ---------------------- | ----------------------------------------------------------------------- |
| `npm run dev`          | PokreÃƒâ€žÃ¢â‚¬Â¡e web i API u watch reÃƒâ€¦Ã‚Â¾imu                     |
| `npm run build`        | Gradi ceo monorepo                                                      |
| `npm run lint`         | Proverava ESLint pravila bez izmena                                     |
| `npm run lint:fix`     | Automatski popravlja podrÃƒâ€¦Ã‚Â¾ane ESLint probleme                   |
| `npm run format`       | Formatira podrÃƒâ€¦Ã‚Â¾ane fajlove pomoÃƒâ€žÃ¢â‚¬Â¡u Prettier-a         |
| `npm run format:check` | Proverava format bez izmena                                             |
| `npm run typecheck`    | Proverava TypeScript bez build outputa                                  |
| `npm run test`         | PokreÃƒâ€žÃ¢â‚¬Â¡e postojeÃƒâ€žÃ¢â‚¬Â¡e unit testove                    |
| `npm run test:e2e`     | Gradi API i pokreÃƒâ€žÃ¢â‚¬Â¡e e2e testove; zahteva zdravu lokalnu bazu |
| `npm run check`        | Bezbedna pre-commit provera: format, lint, tipovi, unit testovi i build |

`npm run check` namerno ne pokreÃƒâ€žÃ¢â‚¬Â¡e e2e testove jer oni zavise od Docker PostgreSQL baze.

### Prisma

```powershell
npm run prisma:generate --workspace=@borska-farmica/api
npm run prisma:seed
npm run prisma:studio --workspace=@borska-farmica/api
```

### Docker Compose

```powershell
docker compose up -d postgres  # pokretanje
docker compose stop           # zaustavljanje bez brisanja podataka
docker compose ps             # status
docker compose logs -f postgres # praÃƒâ€žÃ¢â‚¬Â¡enje logova
```

## Git proces

Koristimo Conventional Commits i male, smislene commitove. Pre commita pokrenite `npm run check`, a za promene koje zavise od baze i `npm run test:e2e`. Nikada ne commitujte `.env`, kredencijale, generisani Prisma Client ili build output.

## Troubleshooting

- **Docker Desktop nije pokrenut:** pokrenite Docker Desktop, saÃƒâ€žÃ‚Âekajte da engine bude spreman, zatim ponovite `docker compose up -d postgres`.
- **Port je zauzet:** proverite procese koji koriste `3000`, `4000` ili `5434`. Za PostgreSQL uskladite mapiranje u `compose.yaml` i port u `apps/api/.env`.
- **Prisma Client nije generisan:** pokrenite `npm run prisma:generate --workspace=@borska-farmica/api`.
- **Baza nije spremna:** proverite `docker compose ps` i `docker compose logs postgres`; readiness Ãƒâ€žÃ¢â‚¬Â¡e vraÃƒâ€žÃ¢â‚¬Â¡ati 503 dok konekcija ne proradi.
- **Dependency paketi nisu instalirani:** iz root foldera pokrenite `npm install`.
- **VS Code prikazuje stare TypeScript greÃƒâ€¦Ã‚Â¡ke:** pokrenite `npm run typecheck`, zatim u Command Palette izaberite `TypeScript: Restart TS Server`.

## Javni Catalog API

Swagger UI: http://localhost:4000/api/docs

OpenAPI JSON: http://localhost:4000/api/docs-json

Javne read-only rute su `GET /api/v1/categories`, `GET /api/v1/categories/:slug`, `GET /api/v1/products` i `GET /api/v1/products/:slug`. Listing filteri su `page`, `limit`, `search`, `category`, `featured`, `mainProduct`, `availabilityMode`, `inStock` i `sort` (`newest`, `name_asc`, `name_desc`, `featured`). Primer:

```text
http://localhost:4000/api/v1/products?category=mlecni-proizvodi&featured=true&sort=newest&page=1&limit=12
```

Mutation endpoint-i nisu javno dostupni; admin CRUD se uvodi tek posle admin autentifikacije. Poslovna pravila i contract opisani su u [dokumentaciji javnog Catalog API-ja](docs/CATALOG_API.md).

ZaÃƒâ€¦Ã‚Â¡tiÃƒâ€žÃ¢â‚¬Â¡eno upravljanje kategorijama dostupno je kroz /api/v1/admin/categories; role, rute, validacija, bezbedno brisanje i audit opisani su u [ADMIN_CATEGORIES_API.md](docs/ADMIN_CATEGORIES_API.md).

ZaÃƒâ€¦Ã‚Â¡tiÃƒâ€žÃ¢â‚¬Â¡eno upravljanje proizvodima, varijantama i zalihama dostupno je kroz /api/v1/admin/products. Lifecycle, decimalni/SKU contract, inventory transakcije i role opisani su u [ADMIN_PRODUCTS_API.md](docs/ADMIN_PRODUCTS_API.md).

## Admin auth backend

Admin auth rute su `POST /api/v1/admin/auth/login`, `POST /api/v1/admin/auth/refresh`, `POST /api/v1/admin/auth/logout` i zaÃƒâ€¦Ã‚Â¡tiÃƒâ€žÃ¢â‚¬Â¡eni `GET /api/v1/admin/auth/me`. Nema javne registracije. Prvi admin se kontrolisano kreira komandom:

```powershell
npm run admin:bootstrap --workspace=@borska-farmica/api
```

Potpuna konfiguracija, token/cookie tok i sigurnosna ograniÃƒâ€žÃ‚Âenja opisani su u [ADMIN_AUTH.md](docs/ADMIN_AUTH.md). Ne unosite bootstrap kredencijale u repozitorijum i uklonite bootstrap password iz environment-a posle kreiranja.

Product availability windows, availability preview and HTTPS image metadata management are available under /api/v1/admin/products/:productId. Contracts, ordering, primary-image rules and audit actions are documented in [ADMIN_PRODUCT_CONTENT_API.md](docs/ADMIN_PRODUCT_CONTENT_API.md). File upload is not implemented.

Trajna gostujuÃƒâ€žÃ¢â‚¬Â¡a korpa dostupna je na `/api/v1/cart`; cookie identitet, Decimal pricing, quantity pravila i no-reservation granica opisani su u [CART_API.md](docs/CART_API.md).

Customer registracija, login, rotirajuÃƒâ€žÃ¢â‚¬Â¡e sesije i profil dostupni su kroz `/api/v1/auth` i `/api/v1/account`; kompletan contract, bezbednosna izolacija od admina i customer/checkout integracija opisani su u [CUSTOMER_AUTH.md](docs/CUSTOMER_AUTH.md).

Account-only checkout, pickup lokacije, atomske rezervacije, customer istorija i admin order lifecycle opisani su u [CHECKOUT_ORDERS_API.md](docs/CHECKOUT_ORDERS_API.md). Nema dostave ni online plaÃƒâ€žÃ¢â‚¬Â¡anja; zavrÃƒâ€¦Ã‚Â¡etak porudÃƒâ€¦Ã‚Â¾bine evidentira gotovinu i SALE movement.

## Admin dashboard analytics

ZaÃƒâ€¦Ã‚Â¡tiÃƒâ€žÃ¢â‚¬Â¡eni backend dashboard je dostupan pod `/api/v1/admin/dashboard` za `ADMIN` i `SUPER_ADMIN`. Obuhvata stvarne KPI-je, periodna poreÃƒâ€žÃ¢â‚¬Ëœenja, revenue serije, status/order-flow, prodaju po proizvodu/kategoriji/pickup lokaciji, zalihe, sezonalnost, recent orders i attention brojaÃƒâ€žÃ‚Âe. Definicije i svi endpointi su u [ADMIN_DASHBOARD_API.md](docs/ADMIN_DASHBOARD_API.md).

## Admin customer, audit i CSV backend

Admin customer pregled/kontrole, SUPER_ADMIN audit viewer i bounded bezbedni CSV izvozi dostupni su pod `/api/v1/admin`. Role, filteri, Decimal metrike, session revocation, audit redakcija i CSV zaÃƒâ€¦Ã‚Â¡tite opisani su u [ADMIN_CUSTOMERS_AUDIT_API.md](docs/ADMIN_CUSTOMERS_AUDIT_API.md).

## Cloud image upload

Managed Cloudinary upload, Sharp obrada i external/managed lifecycle opisani su u [IMAGE_STORAGE_UPLOAD_API.md](docs/IMAGE_STORAGE_UPLOAD_API.md). Upload je lokalno bezbedno iskljuÃƒâ€žÃ‚Âen dok se deployment credentials ruÃƒâ€žÃ‚Âno ne podese.

Automatsko isticanje rezervacija, korpi i starih sesija opisano je u [docs/MAINTENANCE_JOBS.md](docs/MAINTENANCE_JOBS.md).

## Production operations

Production hardening, JSON logging, request correlation, protected Prometheus metrics, optional Sentry, Docker image, deployment sequence and verified backup/restore tooling are documented in [PRODUCTION_HARDENING](docs/PRODUCTION_HARDENING.md), [OBSERVABILITY](docs/OBSERVABILITY.md), [BACKUP_RESTORE](docs/BACKUP_RESTORE.md) and [DEPLOYMENT_RUNBOOK](docs/DEPLOYMENT_RUNBOOK.md). Real deployment and provider credentials are intentionally not included.

## Storefront frontend

Prva frontend celina je postavila Next App Router storefront osnovu, design sistem, responsive layout, typed public API preview, homepage i informativne stranice. Arhitektura je u [FRONTEND_ARCHITECTURE](docs/FRONTEND_ARCHITECTURE.md), a vizuelna pravila u [DESIGN_SYSTEM](docs/DESIGN_SYSTEM.md). Lokalni frontend env primer je `apps/web/.env.example`.
Kompletan javni katalog je na `/proizvodi`, a product detail na `/proizvodi/[slug]`. URL filter contract, galerija, varijante i SEO opisani su u [CATALOG_FRONTEND](docs/CATALOG_FRONTEND.md).

Customer auth, nalog i anonimna korpa dokumentovani su u docs/CUSTOMER_AUTH_FRONTEND.md i docs/CART_FRONTEND.md.

Checkout i customer order frontend dokumentovani su u docs/CHECKOUT_FRONTEND.md i docs/CUSTOMER_ORDERS_FRONTEND.md.

## Admin order management

Admin workspace sada uključuje /admin/porudzbine i UUID detail rutu sa URL filterima, paginacijom, snapshot/timeline prikazom i kompletnom potvrda → priprema → spremno → cash completion/cancellation matricom. Detalji su u [docs/ADMIN_ORDERS_FRONTEND.md](docs/ADMIN_ORDERS_FRONTEND.md).
