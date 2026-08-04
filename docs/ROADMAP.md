# Borska Farmica â€” razvojni roadmap

Roadmap je fazan. Svaka faza se zavrÅ¡ava funkcionalnom proverom, testovima i smislenim commitovima pre poÄetka naredne faze.

## Faza 1 â€” stabilna osnova

**Status: zavrÅ¡eno.**

### ZavrÅ¡eno

- [x] monorepo, npm workspaces i Turborepo
- [x] Next.js frontend i NestJS backend
- [x] environment konfiguracija i validacija
- [x] Docker Compose PostgreSQL na lokalnom portu 5434
- [x] Prisma konfiguracija, generisanje klijenta i DatabaseModule
- [x] liveness i database readiness endpointi
- [x] read-only lint, format check, typecheck, unit test, e2e i build osnova
- [x] zajedniÄka bezbedna `npm run check` komanda
- [x] lokalna razvojna dokumentacija

### Kriterijum zavrÅ¡etka

Frontend i API se lokalno pokreÄ‡u, baza je zdrava, Prisma Client se generiÅ¡e, health provere rade, a lint, typecheck, test i kompletan build prolaze iz root foldera uz dokumentovana uputstva.

Sve stavke Faze 1 su implementirane i proverene. GeneriÄki `GET /api/v1` i dalje vraÄ‡a `Hello World!`; njegovo uklanjanje je mala naredna cleanup celina i nije blokada za stabilnu osnovu.

## Faza 2 â€” katalog i zalihe

**Status: u toku â€” katalog, admin sadrÅ¾aj, customer auth, korpa i checkout/order backend su zavrÅ¡eni.**

### Napredak

- [x] poslovni model kataloga dokumentovan u [CATALOG_DOMAIN.md](CATALOG_DOMAIN.md)
- [x] Prisma modeli i prva migracija kataloga
- [x] idempotentni seed Å¡est potvrÄ‘enih kategorija
- [x] javni read-only category/product API, validacija, paginacija, filteri, Swagger i testovi
- [x] zaÅ¡tiÄ‡eni admin CRUD kategorija sa audit logom
- [x] admin product queries i product lifecycle
- [x] admin upravljanje varijantama i inventory adjustments sa auditom
- [x] image metadata mutation endpointi i managed Cloudinary upload
- [ ] availability window management
- [x] stvarni Cloudinary upload i upravljanje slikama
- [ ] frontend katalog

### Obuhvat

- Category, Product, ProductVariant i ProductImage modeli
- merne jedinice i precizne cene/koliÄine
- SeasonalAvailability i Inventory
- Prisma migracije i neutralni razvojni seed podaci
- CRUD API, paginacija, filteri, sortiranje i pretraga
- DTO validacija i standardizovane greÅ¡ke
- Swagger dokumentacija
- unit, integration i API e2e testovi

### Otvorene odluke

Potvrditi poÄetne kategorije, proizvode, pakovanja, merne jedinice, stvarne cene, pravila zaliha, sezonalnost i skladiÅ¡tenje fotografija.

### Kriterijum zavrÅ¡etka

Administrator moÅ¾e kroz stabilan i testiran API da upravlja kompletnim katalogom i zalihama bez izmene koda.

## Faza 3 â€” javni storefront

### Obuhvat

- prilagoÄ‘en dizajn sistem Borska Farmica
- odobreni logo i branding asseti
- header, footer i mobilna navigacija
- premium poÄetna stranica sa prioritetom za sir, kozje mleko i surutku
- kategorije, listing i detalji proizvoda
- pretraga, filteri i sortiranje
- izbor varijante i prikaz dostupnosti/sezonalnosti
- loading, empty i error stanja
- responzivnost, pristupaÄnost i SEO osnova

### Kriterijum zavrÅ¡etka

Korisnik moÅ¾e brzo i pristupaÄno da istraÅ¾i stvarni katalog na svim vaÅ¾nim veliÄinama ekrana, uz kvalitetne performanse i SEO metapodatke.

## Faza 4 â€” korpa i porudÅ¾bine

### Obuhvat

- korpa za gosta i podrÅ¡ka za buduÄ‡eg prijavljenog korisnika
- serverska provera cena, koliÄina i zaliha
- [x] checkout i validacija podataka kupca
- [x] transakciono kreiranje porudÅ¾bine
- [x] rezervacija i lifecycle fiziÄke zalihe
- [x] snapshot stavki porudÅ¾bine
- [x] potvrda porudÅ¾bine i pregled statusa
- [x] testovi kritiÄnog toka i obraÄuna

### Otvorene odluke

PotvrÄ‘eno i implementirano: customer nalog je obavezan, nema dostave ni fee-a, plaÄ‡anje je gotovinom pri preuzimanju, a admin ruÄno potvrÄ‘uje termin. Tok za rakiju i dalje zahteva zasebnu pravnu i poslovnu potvrdu.

### Kriterijum zavrÅ¡etka

KritiÄni tok od korpe do porudÅ¾bine je transakcion, precizan, bezbedan i pokriven testovima; frontend nikada nije izvor istine za cenu ili ukupan iznos.

## Faza 5 â€” admin autentifikacija

**Status: backend foundation zavrÅ¡ena; admin frontend nije zapoÄet.**

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

### Kriterijum zavrÅ¡etka

Admin rute su nedostupne neautorizovanim korisnicima, tokeni i lozinke su bezbedno obraÄ‘eni, a kritiÄne akcije ostavljaju upotrebljiv audit trag.

## Faza 6 â€” admin panel i analitika

**Status: dashboard analytics, customer operations, audit viewer i CSV export backend zavrÅ¡eni; admin frontend nije zapoÄet.**

### Obuhvat

- [x] dashboard API sa stvarnim KPI podacima iz baze
- upravljanje kategorijama, proizvodima, varijantama i fotografijama
- [x] backend zalihe, sezonska dostupnost, porudÅ¾bine i kupci
- [x] periodi i poreÄ‘enje sa prethodnim periodom
- [x] API serije i agregacije prodaje, porudÅ¾bina, kategorija, proizvoda i zaliha
- [x] API brojaÄi i podaci za stavke koje zahtevaju paÅ¾nju
- [x] backend filteri i bezbedni CSV izvozi; responzivne tabele Äekaju frontend
- loading skeleton, empty i error stanja

### Kriterijum zavrÅ¡etka

Admin dobija pouzdan operativni pregled i moÅ¾e bez izmene koda da upravlja svakodnevnim poslovanjem. Nijedna izmiÅ¡ljena statistika nije predstavljena kao stvarna.

## Faza 7 â€” produkciona spremnost

### Obuhvat

- bezbednosna revizija i dodatni testovi
- performanse, Core Web Vitals i caching
- WCAG AA provera
- kompletan SEO: metadata, sitemap, robots, canonical i Product structured data
- monitoring i error tracking
- deployment frontenda, API-ja i managed PostgreSQL baze
- cloud storage za fotografije
- backup i recovery procedura
- zavrÅ¡na analiza koda i dokumentacije

### Otvorene odluke

Potvrditi domen, hosting API-ja, managed bazu, storage, monitoring i komunikacione provajdere. Organization ili LocalBusiness structured data dodati tek kada postoje potvrÄ‘eni poslovni podaci.

### Kriterijum zavrÅ¡etka

Sistem je bezbedno deployovan, nadgledan, dokumentovan, pristupaÄan, brz i ima proverenu proceduru oporavka.

## SledeÄ‡a neposredna celina

SledeÄ‡a celina je admin UI za veÄ‡ zavrÅ¡ene product-content endpoint-e. Dashboard frontend, stvarni admin nalog, production hardening, observability, deployment konfiguracija i backup/recovery provera ostaju nezavrÅ¡eni.

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
- [x] checkout koji zahteva customer access token i postojeÄ‡u korpu

Checkout/order backend je implementiran sa tim pravilima; frontend checkout joÅ¡ nije uraÄ‘en.

## Status: checkout i orders backend

- [x] account-only checkout preview i kreiranje porudÅ¾bine
- [x] Borska Farmica i subotnja Gradska pijaca pickup pravila
- [x] idempotentno atomsko kreiranje i fiziÄke stock rezervacije
- [x] customer order listing/details/pending cancellation
- [x] admin listing/details i stroga transition matrica
- [x] cash completion, PAID status i SALE movements
- [x] cancellation release bez promene fiziÄkog stocka
- [ ] frontend checkout i order UX
- [ ] email/SMS obaveÅ¡tenja
- [ ] returns/refunds i automatsko isticanje rezervacija
- [x] cloud upload backend; [ ] analytics frontend i production deployment

### Preostale veÄ‡e oblasti

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
