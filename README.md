# Borska Farmica

Borska Farmica je e-commerce platforma za domaće proizvode sa farme, sa glavnim fokusom na sir, kozje mleko i surutku. Projekat je trenutno u aktivnom razvoju.

Detaljni ciljevi i redosled razvoja nalaze se u [projektnom briefu](docs/PROJECT_BRIEF.md), [roadmapu](docs/ROADMAP.md) i [modelu domena kataloga](docs/CATALOG_DOMAIN.md).

## Tehnološki stack

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
- Docker Desktop sa Docker Compose podrškom

## Lokalno pokretanje — Windows PowerShell

1. Klonirajte repozitorijum i uđite u projekat:

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

   `.env.example` sadrži isključivo lokalne razvojne vrednosti. Ne commitujte `.env`.

4. Pokrenite PostgreSQL i proverite da je zdrav:

   ```powershell
   docker compose up -d postgres
   docker compose ps
   ```

5. Generišite Prisma Client:

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

Prva kataloška migracija je uvedena. Za kreiranje naredne razvojne migracije koristi se:

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

Liveness potvrđuje da API proces radi i ne zavisi od baze. Readiness izvršava minimalni `SELECT 1`; vraća HTTP 200 i `database: up` kada je baza dostupna, odnosno HTTP 503 i bezbedan `database: down` odgovor kada nije.

## Korisne komande

### Kvalitet i razvoj

| Komanda                | Namena                                                                  |
| ---------------------- | ----------------------------------------------------------------------- |
| `npm run dev`          | Pokreće web i API u watch režimu                                        |
| `npm run build`        | Gradi ceo monorepo                                                      |
| `npm run lint`         | Proverava ESLint pravila bez izmena                                     |
| `npm run lint:fix`     | Automatski popravlja podržane ESLint probleme                           |
| `npm run format`       | Formatira podržane fajlove pomoću Prettier-a                            |
| `npm run format:check` | Proverava format bez izmena                                             |
| `npm run typecheck`    | Proverava TypeScript bez build outputa                                  |
| `npm run test`         | Pokreće postojeće unit testove                                          |
| `npm run test:e2e`     | Gradi API i pokreće e2e testove; zahteva zdravu lokalnu bazu            |
| `npm run check`        | Bezbedna pre-commit provera: format, lint, tipovi, unit testovi i build |

`npm run check` namerno ne pokreće e2e testove jer oni zavise od Docker PostgreSQL baze.

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
docker compose logs -f postgres # praćenje logova
```

## Git proces

Koristimo Conventional Commits i male, smislene commitove. Pre commita pokrenite `npm run check`, a za promene koje zavise od baze i `npm run test:e2e`. Nikada ne commitujte `.env`, kredencijale, generisani Prisma Client ili build output.

## Troubleshooting

- **Docker Desktop nije pokrenut:** pokrenite Docker Desktop, sačekajte da engine bude spreman, zatim ponovite `docker compose up -d postgres`.
- **Port je zauzet:** proverite procese koji koriste `3000`, `4000` ili `5434`. Za PostgreSQL uskladite mapiranje u `compose.yaml` i port u `apps/api/.env`.
- **Prisma Client nije generisan:** pokrenite `npm run prisma:generate --workspace=@borska-farmica/api`.
- **Baza nije spremna:** proverite `docker compose ps` i `docker compose logs postgres`; readiness će vraćati 503 dok konekcija ne proradi.
- **Dependency paketi nisu instalirani:** iz root foldera pokrenite `npm install`.
- **VS Code prikazuje stare TypeScript greške:** pokrenite `npm run typecheck`, zatim u Command Palette izaberite `TypeScript: Restart TS Server`.

## Javni Catalog API

Swagger UI: http://localhost:4000/api/docs

OpenAPI JSON: http://localhost:4000/api/docs-json

Javne read-only rute su `GET /api/v1/categories`, `GET /api/v1/categories/:slug`, `GET /api/v1/products` i `GET /api/v1/products/:slug`. Listing filteri su `page`, `limit`, `search`, `category`, `featured`, `mainProduct`, `availabilityMode`, `inStock` i `sort` (`newest`, `name_asc`, `name_desc`, `featured`). Primer:

```text
http://localhost:4000/api/v1/products?category=mlecni-proizvodi&featured=true&sort=newest&page=1&limit=12
```

Mutation endpoint-i nisu javno dostupni; admin CRUD se uvodi tek posle admin autentifikacije. Poslovna pravila i contract opisani su u [dokumentaciji javnog Catalog API-ja](docs/CATALOG_API.md).

Zaštićeno upravljanje kategorijama dostupno je kroz /api/v1/admin/categories; role, rute, validacija, bezbedno brisanje i audit opisani su u [ADMIN_CATEGORIES_API.md](docs/ADMIN_CATEGORIES_API.md).

Zaštićeno upravljanje proizvodima, varijantama i zalihama dostupno je kroz /api/v1/admin/products. Lifecycle, decimalni/SKU contract, inventory transakcije i role opisani su u [ADMIN_PRODUCTS_API.md](docs/ADMIN_PRODUCTS_API.md).

## Admin auth backend

Admin auth rute su `POST /api/v1/admin/auth/login`, `POST /api/v1/admin/auth/refresh`, `POST /api/v1/admin/auth/logout` i zaštićeni `GET /api/v1/admin/auth/me`. Nema javne registracije. Prvi admin se kontrolisano kreira komandom:

```powershell
npm run admin:bootstrap --workspace=@borska-farmica/api
```

Potpuna konfiguracija, token/cookie tok i sigurnosna ograničenja opisani su u [ADMIN_AUTH.md](docs/ADMIN_AUTH.md). Ne unosite bootstrap kredencijale u repozitorijum i uklonite bootstrap password iz environment-a posle kreiranja.

Product availability windows, availability preview and HTTPS image metadata management are available under /api/v1/admin/products/:productId. Contracts, ordering, primary-image rules and audit actions are documented in [ADMIN_PRODUCT_CONTENT_API.md](docs/ADMIN_PRODUCT_CONTENT_API.md). File upload is not implemented.

Trajna gostujuća korpa dostupna je na `/api/v1/cart`; cookie identitet, Decimal pricing, quantity pravila i no-reservation granica opisani su u [CART_API.md](docs/CART_API.md).

Customer registracija, login, rotirajuće sesije i profil dostupni su kroz `/api/v1/auth` i `/api/v1/account`; kompletan contract, bezbednosna izolacija od admina i potvrđene granice budućeg checkout-a opisani su u [CUSTOMER_AUTH.md](docs/CUSTOMER_AUTH.md).
