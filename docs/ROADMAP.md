# Borska Farmica Ã¢â‚¬â€ razvojni roadmap

Roadmap je fazan. Svaka faza se zavrÃ…Â¡ava funkcionalnom proverom, testovima i smislenim commitovima pre poÃ„Âetka naredne faze.

## Faza 1 Ã¢â‚¬â€ stabilna osnova

**Status: zavrÃ…Â¡eno.**

### ZavrÃ…Â¡eno

- [x] monorepo, npm workspaces i Turborepo
- [x] Next.js frontend i NestJS backend
- [x] environment konfiguracija i validacija
- [x] Docker Compose PostgreSQL na lokalnom portu 5434
- [x] Prisma konfiguracija, generisanje klijenta i DatabaseModule
- [x] liveness i database readiness endpointi
- [x] read-only lint, format check, typecheck, unit test, e2e i build osnova
- [x] zajedniÃ„Âka bezbedna `npm run check` komanda
- [x] lokalna razvojna dokumentacija

### Kriterijum zavrÃ…Â¡etka

Frontend i API se lokalno pokreÃ„â€¡u, baza je zdrava, Prisma Client se generiÃ…Â¡e, health provere rade, a lint, typecheck, test i kompletan build prolaze iz root foldera uz dokumentovana uputstva.

Sve stavke Faze 1 su implementirane i proverene. GeneriÃ„Âki `GET /api/v1` i dalje vraÃ„â€¡a `Hello World!`; njegovo uklanjanje je mala naredna cleanup celina i nije blokada za stabilnu osnovu.

## Faza 2 Ã¢â‚¬â€ katalog i zalihe

**Status: u toku Ã¢â‚¬â€ katalog, admin sadrÃ…Â¾aj, customer auth, korpa i checkout/order backend su zavrÃ…Â¡eni.**

### Napredak

- [x] poslovni model kataloga dokumentovan u [CATALOG_DOMAIN.md](CATALOG_DOMAIN.md)
- [x] Prisma modeli i prva migracija kataloga
- [x] idempotentni seed Ã…Â¡est potvrÃ„â€˜enih kategorija
- [x] javni read-only category/product API, validacija, paginacija, filteri, Swagger i testovi
- [x] zaÃ…Â¡tiÃ„â€¡eni admin CRUD kategorija sa audit logom
- [x] admin product queries i product lifecycle
- [x] admin upravljanje varijantama i inventory adjustments sa auditom
- [x] image metadata mutation endpointi i managed Cloudinary upload
- [ ] availability window management
- [x] stvarni Cloudinary upload i upravljanje slikama
- [ ] frontend katalog

### Obuhvat

- Category, Product, ProductVariant i ProductImage modeli
- merne jedinice i precizne cene/koliÃ„Âine
- SeasonalAvailability i Inventory
- Prisma migracije i neutralni razvojni seed podaci
- CRUD API, paginacija, filteri, sortiranje i pretraga
- DTO validacija i standardizovane greÃ…Â¡ke
- Swagger dokumentacija
- unit, integration i API e2e testovi

### Otvorene odluke

Potvrditi poÃ„Âetne kategorije, proizvode, pakovanja, merne jedinice, stvarne cene, pravila zaliha, sezonalnost i skladiÃ…Â¡tenje fotografija.

### Kriterijum zavrÃ…Â¡etka

Administrator moÃ…Â¾e kroz stabilan i testiran API da upravlja kompletnim katalogom i zalihama bez izmene koda.

## Faza 3 Ã¢â‚¬â€ javni storefront

### Obuhvat

- prilagoÃ„â€˜en dizajn sistem Borska Farmica
- odobreni logo i branding asseti
- header, footer i mobilna navigacija
- premium poÃ„Âetna stranica sa prioritetom za sir, kozje mleko i surutku
- kategorije, listing i detalji proizvoda
- pretraga, filteri i sortiranje
- izbor varijante i prikaz dostupnosti/sezonalnosti
- loading, empty i error stanja
- responzivnost, pristupaÃ„Ânost i SEO osnova

### Kriterijum zavrÃ…Â¡etka

Korisnik moÃ…Â¾e brzo i pristupaÃ„Âno da istraÃ…Â¾i stvarni katalog na svim vaÃ…Â¾nim veliÃ„Âinama ekrana, uz kvalitetne performanse i SEO metapodatke.

## Faza 4 Ã¢â‚¬â€ korpa i porudÃ…Â¾bine

### Obuhvat

- korpa za gosta i podrÃ…Â¡ka za buduÃ„â€¡eg prijavljenog korisnika
- serverska provera cena, koliÃ„Âina i zaliha
- [x] checkout i validacija podataka kupca
- [x] transakciono kreiranje porudÃ…Â¾bine
- [x] rezervacija i lifecycle fiziÃ„Âke zalihe
- [x] snapshot stavki porudÃ…Â¾bine
- [x] potvrda porudÃ…Â¾bine i pregled statusa
- [x] testovi kritiÃ„Ânog toka i obraÃ„Âuna

### Otvorene odluke

PotvrÃ„â€˜eno i implementirano: customer nalog je obavezan, nema dostave ni fee-a, plaÃ„â€¡anje je gotovinom pri preuzimanju, a admin ruÃ„Âno potvrÃ„â€˜uje termin. Tok za rakiju i dalje zahteva zasebnu pravnu i poslovnu potvrdu.

### Kriterijum zavrÃ…Â¡etka

KritiÃ„Âni tok od korpe do porudÃ…Â¾bine je transakcion, precizan, bezbedan i pokriven testovima; frontend nikada nije izvor istine za cenu ili ukupan iznos.

## Faza 5 Ã¢â‚¬â€ admin autentifikacija

**Status: backend foundation zavrÃ…Â¡ena; admin frontend nije zapoÃ„Âet.**

### Obuhvat

- [x] administratorski korisnik bez podrazumevanih produkcionih kredencijala
- [x] sigurno Argon2id hashovanje lozinki
- [x] login, access JWT i transakciona refresh rotacija
- [x] HttpOnly refresh cookie
- [x] access i role guard osnova
- [x] HTTP hardening i rate limiting osetljivih ruta
- [ ] admin frontend login
- [x] admin CRUD kategorija
- [x] audit log za mutacije kategorija, proizvoda, varijanti i zaliha
- [x] admin product/variant/inventory backend
- [ ] stvarni admin nalog
- [ ] 2FA i password reset
- [x] customer auth backend sa odvojenim identitetom, sesijama i profilom

### Kriterijum zavrÃ…Â¡etka

Admin rute su nedostupne neautorizovanim korisnicima, tokeni i lozinke su bezbedno obraÃ„â€˜eni, a kritiÃ„Âne akcije ostavljaju upotrebljiv audit trag.

## Faza 6 Ã¢â‚¬â€ admin panel i analitika

**Status: dashboard analytics, customer operations, audit viewer i CSV export backend zavrÃ…Â¡eni; admin frontend nije zapoÃ„Âet.**

### Obuhvat

- [x] dashboard API sa stvarnim KPI podacima iz baze
- upravljanje kategorijama, proizvodima, varijantama i fotografijama
- [x] backend zalihe, sezonska dostupnost, porudÃ…Â¾bine i kupci
- [x] periodi i poreÃ„â€˜enje sa prethodnim periodom
- [x] API serije i agregacije prodaje, porudÃ…Â¾bina, kategorija, proizvoda i zaliha
- [x] API brojaÃ„Âi i podaci za stavke koje zahtevaju paÃ…Â¾nju
- [x] backend filteri i bezbedni CSV izvozi; responzivne tabele Ã„Âekaju frontend
- loading skeleton, empty i error stanja

### Kriterijum zavrÃ…Â¡etka

Admin dobija pouzdan operativni pregled i moÃ…Â¾e bez izmene koda da upravlja svakodnevnim poslovanjem. Nijedna izmiÃ…Â¡ljena statistika nije predstavljena kao stvarna.

## Faza 7 Ã¢â‚¬â€ produkciona spremnost

### Obuhvat

- bezbednosna revizija i dodatni testovi
- performanse, Core Web Vitals i caching
- WCAG AA provera
- kompletan SEO: metadata, sitemap, robots, canonical i Product structured data
- monitoring i error tracking
- deployment frontenda, API-ja i managed PostgreSQL baze
- cloud storage za fotografije
- backup i recovery procedura
- zavrÃ…Â¡na analiza koda i dokumentacije

### Otvorene odluke

Potvrditi domen, hosting API-ja, managed bazu, storage, monitoring i komunikacione provajdere. Organization ili LocalBusiness structured data dodati tek kada postoje potvrÃ„â€˜eni poslovni podaci.

### Kriterijum zavrÃ…Â¡etka

Sistem je bezbedno deployovan, nadgledan, dokumentovan, pristupaÃ„Âan, brz i ima proverenu proceduru oporavka.

## SledeÃ„â€¡a neposredna celina

SledeÃ„â€¡a celina je admin UI za veÃ„â€¡ zavrÃ…Â¡ene product-content endpoint-e. Dashboard frontend, stvarni admin nalog, production hardening, observability, deployment konfiguracija i backup/recovery provera ostaju nezavrÃ…Â¡eni.

## Status: guest cart backend

- [x] secure guest cookie identity and expiry lifecycle
- [x] server-side Decimal pricing and quantity validation
- [x] cart item mutations without stock reservation
- [x] isolated cart e2e coverage
- [x] customer accounts (cart merge ostaje zaseban posao)
- [x] stock reservation, checkout and orders
- [ ] coupons, delivery, online payment and frontend

## Status: customer auth backend

- [x] obavezan customer nalog: registracija i email/password login
- [x] obavezni ime, prezime i telefon sa E.164 normalizacijom
- [x] customer-only access/refresh tokeni, rotacija i HttpOnly cookie
- [x] profil i promena lozinke sa opozivom starih sesija
- [x] izolovani unit i e2e testovi
- [ ] email verification provider i password reset
- [ ] frontend forme i customer UX
- [x] checkout koji zahteva customer access token i postojeÃ„â€¡u korpu

Checkout/order backend je implementiran sa tim pravilima; frontend checkout joÃ…Â¡ nije uraÃ„â€˜en.

## Status: checkout i orders backend

- [x] account-only checkout preview i kreiranje porudÃ…Â¾bine
- [x] Borska Farmica i subotnja Gradska pijaca pickup pravila
- [x] idempotentno atomsko kreiranje i fiziÃ„Âke stock rezervacije
- [x] customer order listing/details/pending cancellation
- [x] admin listing/details i stroga transition matrica
- [x] cash completion, PAID status i SALE movements
- [x] cancellation release bez promene fiziÃ„Âkog stocka
- [ ] frontend checkout i order UX
- [ ] email/SMS obaveÃ…Â¡tenja
- [ ] returns/refunds i automatsko isticanje rezervacija
- [x] cloud upload backend; [ ] analytics frontend i production deployment

### Preostale veÃ„â€¡e oblasti

- [x] stvarni cloud image upload/storage
- [x] produkcioni hardening, observability i deployment konfiguracija
- opcione email/SMS notifikacije
- frontend storefront i admin dashboard

## Status: automated maintenance

- [x] automatic reservation expiration
- [x] cart expiration and retention cleanup
- [x] customer/admin session retention cleanup
- [x] production hardening, observability, backup/restore and deployment configuration

## Status: production backend foundation

- [x] structured JSON logs, request correlation and safe global errors
- [x] protected Prometheus metrics and optional PII-safe Sentry adapter
- [x] strict production config, health metadata and graceful shutdown
- [x] non-root multi-stage API image and provider-neutral Compose example
- [x] migration runbook and locally verified backup/checksum/restore/cleanup
- [x] production dependency/security review and runtime smoke test
- [ ] real production provider credentials and deployment
- [ ] frontend storefront and admin dashboard

Backend now has a production-ready operational foundation. The next major implementation area is frontend; real deployment remains a later explicitly authorized operation.

## Status: storefront frontend foundation

- [x] frontend App Router arhitektura i environment osnova
- [x] Borska Farmica design sistem i responsive layout
- [x] homepage sa stvarnim public API preview podacima
- [x] O nama, Preuzimanje i Kontakt stranice
- [x] typed public categories/products API foundation
- [x] SEO, accessibility i Vitest osnova
- [ ] kompletan katalog sa search/filter/sort/pagination kontrolama
- [ ] product detail i Product JSON-LD

Sledeća neposredna frontend celina je kompletan katalog, search/filter/sort/pagination i product detail sa Product SEO podacima.

## Status: catalog i product detail frontend

- [x] catalog listing i URL filter state
- [x] search, category, availability i featured filteri
- [x] podržano sortiranje i backend pagination
- [x] product detail, galerija i variant selection
- [x] availability/backorder i compare-at prikaz
- [x] dinamički metadata, Product i Breadcrumb JSON-LD
- [ ] cart frontend i customer auth foundation

Sledeća celina je cart frontend, customer auth foundation, in-memory access token/refresh-cookie flow i add/update/remove cart item sa cart drawer/page prikazom.
