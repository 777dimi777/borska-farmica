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
- checkout i validacija podataka kupca
- transakciono kreiranje porudžbine
- rezervacija ili umanjenje zaliha
- snapshot stavki porudžbine
- potvrda porudžbine i pregled statusa
- testovi kritičnog toka i obračuna

### Otvorene odluke

Pre rada potvrditi načine plaćanja i preuzimanja, zone i cenu dostave, minimalan iznos, obavezne kontakt podatke, potrebu za nalogom, telefonsku potvrdu i konačne statuse porudžbine. Tok za rakiju zahteva zasebnu pravnu i poslovnu potvrdu.

### Kriterijum završetka

Kritični tok od korpe do porudžbine je transakcion, precizan, bezbedan i pokriven testovima; frontend nikada nije izvor istine za cenu ili ukupan iznos.

## Faza 5 — admin autentifikacija

### Obuhvat

- administratorski korisnik bez podrazumevanih produkcionih kredencijala
- sigurno hashovanje lozinki
- login, access i refresh mehanizam
- httpOnly cookie za web autentifikaciju
- zaštita ruta i početna role/permission osnova
- rate limiting osetljivih ruta
- audit log bez osetljivih podataka

### Kriterijum završetka

Admin rute su nedostupne neautorizovanim korisnicima, tokeni i lozinke su bezbedno obrađeni, a kritične akcije ostavljaju upotrebljiv audit trag.

## Faza 6 — admin panel i analitika

### Obuhvat

- dashboard sa stvarnim KPI podacima iz baze
- upravljanje kategorijama, proizvodima, varijantama i fotografijama
- zalihe, sezonska dostupnost, porudžbine i kupci
- periodi i poređenje sa prethodnim periodom
- grafikoni prodaje, porudžbina, kategorija, proizvoda i zaliha
- paneli za stavke koje zahtevaju pažnju
- responzivne tabele, filteri i kasniji CSV export
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

Pre modelovanja kataloga potvrditi otvorene poslovne odluke za Fazu 2, zatim u zasebnoj celini uvesti početne Prisma modele i migracije. Ne uvoditi katalog, proizvode ili zalihe bez potvrđenih kategorija, pakovanja, mernih jedinica, cena i pravila dostupnosti.
