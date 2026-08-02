# Borska Farmica — razvojni roadmap

Roadmap je fazan. Svaka faza se završava funkcionalnom proverom, testovima i smislenim commitovima pre početka naredne faze.

## Faza 1 — stabilna osnova

**Status: završeno.**

### Završeno

- [x] monorepo, npm workspaces i Turborepo
- [x] Next.js frontend i NestJS backend
- [x] environment konfiguracija i validacija
- [x] Docker Compose PostgreSQL na lokalnom portu 5434
- [x] Prisma konfiguracija, generisanje klijenta i DatabaseModule
- [x] liveness i database readiness endpointi
- [x] read-only lint, format check, typecheck, unit test, e2e i build osnova
- [x] zajednička bezbedna `npm run check` komanda
- [x] lokalna razvojna dokumentacija

### Kriterijum završetka

Frontend i API se lokalno pokreću, baza je zdrava, Prisma Client se generiše, health provere rade, a lint, typecheck, test i kompletan build prolaze iz root foldera uz dokumentovana uputstva.

Sve stavke Faze 1 su implementirane i proverene. Generički `GET /api/v1` i dalje vraća `Hello World!`; njegovo uklanjanje je mala naredna cleanup celina i nije blokada za stabilnu osnovu.

## Faza 2 — katalog i zalihe

**Status: u toku — katalog, admin sadržaj, customer auth, korpa i checkout/order backend su završeni.**

### Napredak

- [x] poslovni model kataloga dokumentovan u [CATALOG_DOMAIN.md](CATALOG_DOMAIN.md)
- [x] Prisma modeli i prva migracija kataloga
- [x] idempotentni seed šest potvrđenih kategorija
- [x] javni read-only category/product API, validacija, paginacija, filteri, Swagger i testovi
- [x] zaštićeni admin CRUD kategorija sa audit logom
- [x] admin product queries i product lifecycle
- [x] admin upravljanje varijantama i inventory adjustments sa auditom
- [x] image metadata mutation endpointi (upload nije implementiran)
- [ ] availability window management
- [x] stvarni Cloudinary upload i upravljanje slikama
- [ ] frontend katalog

### Obuhvat

- Category, Product, ProductVariant i ProductImage modeli
- merne jedinice i precizne cene/količine
- SeasonalAvailability i Inventory
- Prisma migracije i neutralni razvojni seed podaci
- CRUD API, paginacija, filteri, sortiranje i pretraga
- DTO validacija i standardizovane greške
- Swagger dokumentacija
- unit, integration i API e2e testovi

### Otvorene odluke

Potvrditi početne kategorije, proizvode, pakovanja, merne jedinice, stvarne cene, pravila zaliha, sezonalnost i skladištenje fotografija.

### Kriterijum završetka

Administrator može kroz stabilan i testiran API da upravlja kompletnim katalogom i zalihama bez izmene koda.

## Faza 3 — javni storefront

### Obuhvat

- prilagođen dizajn sistem Borska Farmica
- odobreni logo i branding asseti
- header, footer i mobilna navigacija
- premium početna stranica sa prioritetom za sir, kozje mleko i surutku
- kategorije, listing i detalji proizvoda
- pretraga, filteri i sortiranje
- izbor varijante i prikaz dostupnosti/sezonalnosti
- loading, empty i error stanja
- responzivnost, pristupačnost i SEO osnova

### Kriterijum završetka

Korisnik može brzo i pristupačno da istraži stvarni katalog na svim važnim veličinama ekrana, uz kvalitetne performanse i SEO metapodatke.

## Faza 4 — korpa i porudžbine

### Obuhvat

- korpa za gosta i podrška za budućeg prijavljenog korisnika
- serverska provera cena, količina i zaliha
- [x] checkout i validacija podataka kupca
- [x] transakciono kreiranje porudžbine
- [x] rezervacija i lifecycle fizičke zalihe
- [x] snapshot stavki porudžbine
- [x] potvrda porudžbine i pregled statusa
- [x] testovi kritičnog toka i obračuna

### Otvorene odluke

Potvrđeno i implementirano: customer nalog je obavezan, nema dostave ni fee-a, plaćanje je gotovinom pri preuzimanju, a admin ručno potvrđuje termin. Tok za rakiju i dalje zahteva zasebnu pravnu i poslovnu potvrdu.

### Kriterijum završetka

Kritični tok od korpe do porudžbine je transakcion, precizan, bezbedan i pokriven testovima; frontend nikada nije izvor istine za cenu ili ukupan iznos.

## Faza 5 — admin autentifikacija

**Status: backend foundation završena; admin frontend nije započet.**

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

### Kriterijum završetka

Admin rute su nedostupne neautorizovanim korisnicima, tokeni i lozinke su bezbedno obrađeni, a kritične akcije ostavljaju upotrebljiv audit trag.

## Faza 6 — admin panel i analitika

**Status: dashboard analytics, customer operations, audit viewer i CSV export backend završeni; admin frontend nije započet.**

### Obuhvat

- [x] dashboard API sa stvarnim KPI podacima iz baze
- upravljanje kategorijama, proizvodima, varijantama i fotografijama
- [x] backend zalihe, sezonska dostupnost, porudžbine i kupci
- [x] periodi i poređenje sa prethodnim periodom
- [x] API serije i agregacije prodaje, porudžbina, kategorija, proizvoda i zaliha
- [x] API brojači i podaci za stavke koje zahtevaju pažnju
- [x] backend filteri i bezbedni CSV izvozi; responzivne tabele čekaju frontend
- loading skeleton, empty i error stanja

### Kriterijum završetka

Admin dobija pouzdan operativni pregled i može bez izmene koda da upravlja svakodnevnim poslovanjem. Nijedna izmišljena statistika nije predstavljena kao stvarna.

## Faza 7 — produkciona spremnost

### Obuhvat

- bezbednosna revizija i dodatni testovi
- performanse, Core Web Vitals i caching
- WCAG AA provera
- kompletan SEO: metadata, sitemap, robots, canonical i Product structured data
- monitoring i error tracking
- deployment frontenda, API-ja i managed PostgreSQL baze
- cloud storage za fotografije
- backup i recovery procedura
- završna analiza koda i dokumentacije

### Otvorene odluke

Potvrditi domen, hosting API-ja, managed bazu, storage, monitoring i komunikacione provajdere. Organization ili LocalBusiness structured data dodati tek kada postoje potvrđeni poslovni podaci.

### Kriterijum završetka

Sistem je bezbedno deployovan, nadgledan, dokumentovan, pristupačan, brz i ima proverenu proceduru oporavka.

## Sledeća neposredna celina

Sledeća celina je izbor cloud storage provajdera i admin UI za već završene product-content endpoint-e. Upload i transformacije slika, dashboard frontend, stvarni admin nalog i production deployment ostaju nezavršeni.

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
- [x] checkout koji zahteva customer access token i postojeću korpu

Checkout/order backend je implementiran sa tim pravilima; frontend checkout još nije urađen.

## Status: checkout i orders backend

- [x] account-only checkout preview i kreiranje porudžbine
- [x] Borska Farmica i subotnja Gradska pijaca pickup pravila
- [x] idempotentno atomsko kreiranje i fizičke stock rezervacije
- [x] customer order listing/details/pending cancellation
- [x] admin listing/details i stroga transition matrica
- [x] cash completion, PAID status i SALE movements
- [x] cancellation release bez promene fizičkog stocka
- [ ] frontend checkout i order UX
- [ ] email/SMS obaveštenja
- [ ] returns/refunds i automatsko isticanje rezervacija
- [x] cloud upload backend; [ ] analytics frontend i production deployment

### Preostale veće oblasti

- [x] stvarni cloud image upload/storage
- produkcioni hardening, observability i deployment konfiguracija
- opcione email/SMS notifikacije
- frontend storefront i admin dashboard
