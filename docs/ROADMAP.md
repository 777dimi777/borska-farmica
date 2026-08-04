# Borska Farmica ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â razvojni roadmap

Roadmap je fazan. Svaka faza se zavrÃƒâ€¦Ã‚Â¡ava funkcionalnom proverom, testovima i smislenim commitovima pre poÃƒâ€žÃ‚Âetka naredne faze.

## Faza 1 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â stabilna osnova

**Status: zavrÃƒâ€¦Ã‚Â¡eno.**

### ZavrÃƒâ€¦Ã‚Â¡eno

- [x] monorepo, npm workspaces i Turborepo
- [x] Next.js frontend i NestJS backend
- [x] environment konfiguracija i validacija
- [x] Docker Compose PostgreSQL na lokalnom portu 5434
- [x] Prisma konfiguracija, generisanje klijenta i DatabaseModule
- [x] liveness i database readiness endpointi
- [x] read-only lint, format check, typecheck, unit test, e2e i build osnova
- [x] zajedniÃƒâ€žÃ‚Âka bezbedna `npm run check` komanda
- [x] lokalna razvojna dokumentacija

### Kriterijum zavrÃƒâ€¦Ã‚Â¡etka

Frontend i API se lokalno pokreÃƒâ€žÃ¢â‚¬Â¡u, baza je zdrava, Prisma Client se generiÃƒâ€¦Ã‚Â¡e, health provere rade, a lint, typecheck, test i kompletan build prolaze iz root foldera uz dokumentovana uputstva.

Sve stavke Faze 1 su implementirane i proverene. GeneriÃƒâ€žÃ‚Âki `GET /api/v1` i dalje vraÃƒâ€žÃ¢â‚¬Â¡a `Hello World!`; njegovo uklanjanje je mala naredna cleanup celina i nije blokada za stabilnu osnovu.

## Faza 2 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â katalog i zalihe

**Status: u toku ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â katalog, admin sadrÃƒâ€¦Ã‚Â¾aj, customer auth, korpa i checkout/order backend su zavrÃƒâ€¦Ã‚Â¡eni.**

### Napredak

- [x] poslovni model kataloga dokumentovan u [CATALOG_DOMAIN.md](CATALOG_DOMAIN.md)
- [x] Prisma modeli i prva migracija kataloga
- [x] idempotentni seed Ãƒâ€¦Ã‚Â¡est potvrÃƒâ€žÃ¢â‚¬Ëœenih kategorija
- [x] javni read-only category/product API, validacija, paginacija, filteri, Swagger i testovi
- [x] zaÃƒâ€¦Ã‚Â¡tiÃƒâ€žÃ¢â‚¬Â¡eni admin CRUD kategorija sa audit logom
- [x] admin product queries i product lifecycle
- [x] admin upravljanje varijantama i inventory adjustments sa auditom
- [x] image metadata mutation endpointi i managed Cloudinary upload
- [ ] availability window management
- [x] stvarni Cloudinary upload i upravljanje slikama
- [ ] frontend katalog

### Obuhvat

- Category, Product, ProductVariant i ProductImage modeli
- merne jedinice i precizne cene/koliÃƒâ€žÃ‚Âine
- SeasonalAvailability i Inventory
- Prisma migracije i neutralni razvojni seed podaci
- CRUD API, paginacija, filteri, sortiranje i pretraga
- DTO validacija i standardizovane greÃƒâ€¦Ã‚Â¡ke
- Swagger dokumentacija
- unit, integration i API e2e testovi

### Otvorene odluke

Potvrditi poÃƒâ€žÃ‚Âetne kategorije, proizvode, pakovanja, merne jedinice, stvarne cene, pravila zaliha, sezonalnost i skladiÃƒâ€¦Ã‚Â¡tenje fotografija.

### Kriterijum zavrÃƒâ€¦Ã‚Â¡etka

Administrator moÃƒâ€¦Ã‚Â¾e kroz stabilan i testiran API da upravlja kompletnim katalogom i zalihama bez izmene koda.

## Faza 3 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â javni storefront

### Obuhvat

- prilagoÃƒâ€žÃ¢â‚¬Ëœen dizajn sistem Borska Farmica
- odobreni logo i branding asseti
- header, footer i mobilna navigacija
- premium poÃƒâ€žÃ‚Âetna stranica sa prioritetom za sir, kozje mleko i surutku
- kategorije, listing i detalji proizvoda
- pretraga, filteri i sortiranje
- izbor varijante i prikaz dostupnosti/sezonalnosti
- loading, empty i error stanja
- responzivnost, pristupaÃƒâ€žÃ‚Ânost i SEO osnova

### Kriterijum zavrÃƒâ€¦Ã‚Â¡etka

Korisnik moÃƒâ€¦Ã‚Â¾e brzo i pristupaÃƒâ€žÃ‚Âno da istraÃƒâ€¦Ã‚Â¾i stvarni katalog na svim vaÃƒâ€¦Ã‚Â¾nim veliÃƒâ€žÃ‚Âinama ekrana, uz kvalitetne performanse i SEO metapodatke.

## Faza 4 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â korpa i porudÃƒâ€¦Ã‚Â¾bine

### Obuhvat

- korpa za gosta i podrÃƒâ€¦Ã‚Â¡ka za buduÃƒâ€žÃ¢â‚¬Â¡eg prijavljenog korisnika
- serverska provera cena, koliÃƒâ€žÃ‚Âina i zaliha
- [x] checkout i validacija podataka kupca
- [x] transakciono kreiranje porudÃƒâ€¦Ã‚Â¾bine
- [x] rezervacija i lifecycle fiziÃƒâ€žÃ‚Âke zalihe
- [x] snapshot stavki porudÃƒâ€¦Ã‚Â¾bine
- [x] potvrda porudÃƒâ€¦Ã‚Â¾bine i pregled statusa
- [x] testovi kritiÃƒâ€žÃ‚Ânog toka i obraÃƒâ€žÃ‚Âuna

### Otvorene odluke

PotvrÃƒâ€žÃ¢â‚¬Ëœeno i implementirano: customer nalog je obavezan, nema dostave ni fee-a, plaÃƒâ€žÃ¢â‚¬Â¡anje je gotovinom pri preuzimanju, a admin ruÃƒâ€žÃ‚Âno potvrÃƒâ€žÃ¢â‚¬Ëœuje termin. Tok za rakiju i dalje zahteva zasebnu pravnu i poslovnu potvrdu.

### Kriterijum zavrÃƒâ€¦Ã‚Â¡etka

KritiÃƒâ€žÃ‚Âni tok od korpe do porudÃƒâ€¦Ã‚Â¾bine je transakcion, precizan, bezbedan i pokriven testovima; frontend nikada nije izvor istine za cenu ili ukupan iznos.

## Faza 5 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â admin autentifikacija

**Status: backend foundation zavrÃƒâ€¦Ã‚Â¡ena; admin frontend nije zapoÃƒâ€žÃ‚Âet.**

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

### Kriterijum zavrÃƒâ€¦Ã‚Â¡etka

Admin rute su nedostupne neautorizovanim korisnicima, tokeni i lozinke su bezbedno obraÃƒâ€žÃ¢â‚¬Ëœeni, a kritiÃƒâ€žÃ‚Âne akcije ostavljaju upotrebljiv audit trag.

## Faza 6 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â admin panel i analitika

**Status: dashboard analytics, customer operations, audit viewer i CSV export backend zavrÃƒâ€¦Ã‚Â¡eni; admin frontend nije zapoÃƒâ€žÃ‚Âet.**

### Obuhvat

- [x] dashboard API sa stvarnim KPI podacima iz baze
- upravljanje kategorijama, proizvodima, varijantama i fotografijama
- [x] backend zalihe, sezonska dostupnost, porudÃƒâ€¦Ã‚Â¾bine i kupci
- [x] periodi i poreÃƒâ€žÃ¢â‚¬Ëœenje sa prethodnim periodom
- [x] API serije i agregacije prodaje, porudÃƒâ€¦Ã‚Â¾bina, kategorija, proizvoda i zaliha
- [x] API brojaÃƒâ€žÃ‚Âi i podaci za stavke koje zahtevaju paÃƒâ€¦Ã‚Â¾nju
- [x] backend filteri i bezbedni CSV izvozi; responzivne tabele Ãƒâ€žÃ‚Âekaju frontend
- loading skeleton, empty i error stanja

### Kriterijum zavrÃƒâ€¦Ã‚Â¡etka

Admin dobija pouzdan operativni pregled i moÃƒâ€¦Ã‚Â¾e bez izmene koda da upravlja svakodnevnim poslovanjem. Nijedna izmiÃƒâ€¦Ã‚Â¡ljena statistika nije predstavljena kao stvarna.

## Faza 7 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â produkciona spremnost

### Obuhvat

- bezbednosna revizija i dodatni testovi
- performanse, Core Web Vitals i caching
- WCAG AA provera
- kompletan SEO: metadata, sitemap, robots, canonical i Product structured data
- monitoring i error tracking
- deployment frontenda, API-ja i managed PostgreSQL baze
- cloud storage za fotografije
- backup i recovery procedura
- zavrÃƒâ€¦Ã‚Â¡na analiza koda i dokumentacije

### Otvorene odluke

Potvrditi domen, hosting API-ja, managed bazu, storage, monitoring i komunikacione provajdere. Organization ili LocalBusiness structured data dodati tek kada postoje potvrÃƒâ€žÃ¢â‚¬Ëœeni poslovni podaci.

### Kriterijum zavrÃƒâ€¦Ã‚Â¡etka

Sistem je bezbedno deployovan, nadgledan, dokumentovan, pristupaÃƒâ€žÃ‚Âan, brz i ima proverenu proceduru oporavka.

## SledeÃƒâ€žÃ¢â‚¬Â¡a neposredna celina

SledeÃƒâ€žÃ¢â‚¬Â¡a celina je admin UI za veÃƒâ€žÃ¢â‚¬Â¡ zavrÃƒâ€¦Ã‚Â¡ene product-content endpoint-e. Dashboard frontend, stvarni admin nalog, production hardening, observability, deployment konfiguracija i backup/recovery provera ostaju nezavrÃƒâ€¦Ã‚Â¡eni.

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
- [x] checkout koji zahteva customer access token i postojeÃƒâ€žÃ¢â‚¬Â¡u korpu

Checkout/order backend je implementiran sa tim pravilima; frontend checkout joÃƒâ€¦Ã‚Â¡ nije uraÃƒâ€žÃ¢â‚¬Ëœen.

## Status: checkout i orders backend

- [x] account-only checkout preview i kreiranje porudÃƒâ€¦Ã‚Â¾bine
- [x] Borska Farmica i subotnja Gradska pijaca pickup pravila
- [x] idempotentno atomsko kreiranje i fiziÃƒâ€žÃ‚Âke stock rezervacije
- [x] customer order listing/details/pending cancellation
- [x] admin listing/details i stroga transition matrica
- [x] cash completion, PAID status i SALE movements
- [x] cancellation release bez promene fiziÃƒâ€žÃ‚Âkog stocka
- [ ] frontend checkout i order UX
- [ ] email/SMS obaveÃƒâ€¦Ã‚Â¡tenja
- [ ] returns/refunds i automatsko isticanje rezervacija
- [x] cloud upload backend; [ ] analytics frontend i production deployment

### Preostale veÃƒâ€žÃ¢â‚¬Â¡e oblasti

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

SledeÄ‡a neposredna frontend celina je kompletan katalog, search/filter/sort/pagination i product detail sa Product SEO podacima.

## Status: catalog i product detail frontend

- [x] catalog listing i URL filter state
- [x] search, category, availability i featured filteri
- [x] podrÅ¾ano sortiranje i backend pagination
- [x] product detail, galerija i variant selection
- [x] availability/backorder i compare-at prikaz
- [x] dinamiÄki metadata, Product i Breadcrumb JSON-LD
- [ ] cart frontend i customer auth foundation

SledeÄ‡a celina je cart frontend, customer auth foundation, in-memory access token/refresh-cookie flow i add/update/remove cart item sa cart drawer/page prikazom.

## Status: customer auth i cart frontend

- [x] customer registracija, login, refresh i logout
- [x] account profil i promena lozinke
- [x] anonymous cart Query state
- [x] add/update/remove/clear
- [x] cart drawer i /korpa
- [ ] checkout preview, pickup izbor, order creation i customer orders

## Status: checkout i customer orders frontend

- [x] checkout preview i pickup selection
- [x] idempotent order creation i success ruta
- [x] customer order listing/detail/timeline
- [x] customer cancellation
- [ ] admin login, layout, dashboard KPI, charts i operational widgets

## Status: admin login i dashboard frontend

- [x] izolovana admin prijava, refresh, logout i protected layout
- [x] responsive admin shell bez mrtvih CRUD linkova
- [x] svih 12 dashboard analytics endpointa
- [x] KPI, grafikoni sa tabelarnom alternativom i operativni widgeti
- [x] URL period, manual refresh i parcijalne widget greške
- [ ] admin CRUD frontend za katalog, zalihe, porudžbine i kupce

## Status: admin order management frontend

- [x] admin order listing
- [x] URL filteri, search i backend paginacija
- [x] order detail sa snapshotima, rezervacijama i timeline-om
- [x] potvrda, priprema i ready workflow
- [x] eksplicitni cash completion sa PAID/SALE posledicama
- [x] admin cancellation sa reservation release posledicama
- [ ] admin kategorije, proizvodi, varijante, slike, availability i inventory adjustments

## Status: admin catalog management frontend

- [x] kategorije CRUD, status i redosled
- [x] product listing, create/edit i lifecycle
- [x] varijante, slike i managed upload
- [x] availability periodi i server preview
- [x] inventory adjustments i movement istorija
- [ ] admin kupci, audit i CSV frontend

## Status: final admin operations frontend

- [x] customer listing, detail i orders
- [x] SUPER_ADMIN account disable/enable i session revoke
- [x] SUPER_ADMIN read-only audit viewer
- [x] role-aware authenticated CSV exports
- [ ] završni frontend audit, full-flow E2E, visual polish i performance
- [ ] pravne stranice, logo asset i launch/deployment priprema
