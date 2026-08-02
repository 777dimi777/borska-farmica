# Borska Farmica — projektni brief

## Vizija

Borska Farmica je moderan, premium e-commerce za prodaju domaćih proizvoda sa farme. Sir, kozje mleko i surutka su glavni proizvodi i moraju imati najveći vizuelni i poslovni značaj. Sistem treba da podrži i rakiju, jaja, stajsko đubrivo, sezonsko voće i povrće, kao i buduće kategorije i proizvode koje administrator dodaje bez izmene koda.

Primarni jezik korisničkog interfejsa i SEO sadržaja je srpski, latinica. Planirana valuta je RSD, uz lokalizovan prikaz cena, datuma, vremena, količina i statusa.

## Brend i dizajn

- Naziv brenda je tačno **Borska Farmica**.
- Vizuelni identitet je dominantno beo, sa kontrolisanom dubokom šumsko-zelenom bojom.
- Dizajn treba da bude čist, topao, autentičan, premium i potpuno responzivan.
- Prioriteti su kvalitetna tipografija i fotografije, jasna hijerarhija, mnogo belog prostora, elegantne kartice i suptilne interakcije.
- Finalni logo je odobren znak koze u negativnom prostoru sa natpisom „BORSKA FARMICA“. Ne sme se redizajnirati niti deformisati.
- Kada logo fajl bude dostavljen, čuva se u `apps/web/public/branding` i priprema za header, footer, favicon, mobilni prikaz, društvene mreže i tamnu pozadinu.

## Tehnološka osnova

- Node.js 24 LTS, npm workspaces i Turborepo
- TypeScript sa strict podešavanjima
- Next.js 16 App Router i React 19 u `apps/web`
- NestJS 11 REST API u `apps/api`, sa prefiksom `/api/v1`
- PostgreSQL, Prisma ORM i Docker Compose
- lokalni frontend: `http://localhost:3000`
- lokalni API: `http://localhost:4000/api/v1`
- glavna Git grana: `main`

Osnovni stack se ne menja bez odobrenja. Nova zavisnost mora rešavati konkretan problem, imati jasnu svrhu i biti kompatibilna sa postojećim verzijama.

## Arhitektonska pravila

### Frontend

- Koristiti Server Components kada poboljšavaju SEO i performanse.
- Client Components koristiti samo za interaktivnost, stanje, forme i browser API-je.
- Javni deo obuhvata storefront, katalog, pretragu, korpu, checkout, porudžbine i informativne stranice.
- Admin deo obuhvata upravljanje katalogom, zalihama, porudžbinama, kupcima, sezonalnošću, analitikom, podešavanjima i audit logom.
- Svaka funkcionalnost mora imati kvalitetna loading, empty i error stanja, pristupačnost i responzivnost.

### Backend

- Organizovati NestJS po poslovnim domenima, sa tankim controllerima i poslovnom logikom u servisima.
- Koristiti DTO validaciju, whitelist, zabranu nepoznatih polja i transformaciju ulaza.
- API treba da podrži pravilne HTTP statuse, standardizovane greške, paginaciju, filtriranje, sortiranje i pretragu.
- Osetljivi podaci se ne vraćaju kroz API i ne zapisuju u logove.
- Swagger se uvodi kada počne razvoj poslovnih API modula.

## Osnovni poslovni model

Planirani domeni su kategorije, proizvodi, varijante i pakovanja, fotografije, sezonska dostupnost, zalihe, korpe, kupci, porudžbine, korisnici i audit logovi.

Ključna pravila:

- Varijante podržavaju različita pakovanja, merne jedinice, cene, minimalne količine i korake kupovine.
- Sezonska dostupnost podržava celogodišnju prodaju, mesece, ručne periode i ručno uključivanje ili isključivanje.
- Zalihe prate trenutno, rezervisano i dostupno stanje, prag upozorenja i istoriju promena.
- Porudžbina čuva snapshot naziva, varijante, SKU-a, količine i cene iz trenutka kupovine.
- Server proverava cenu i zalihe i računa sve ukupne iznose.
- Za novac i količine koriste se precizni decimalni tipovi, nikada JavaScript floating-point za kritične obračune.

## Bezbednost i kvalitet

- Tajne vrednosti dolaze isključivo iz environment promenljivih; `.env` se nikada ne commituje.
- Validirati environment pri pokretanju i strogo podesiti CORS, security headere i osetljive rute.
- Admin autentifikacija zahteva sigurno hashovanje lozinki, zaštićene rute i audit važnih akcija.
- Upload mora ograničiti tip i veličinu fajla i bezbedno obrađivati sadržaj.
- Kreiranje porudžbine i promene zaliha koriste baze transakcije.
- Kod ostaje strict, bez nepotrebnog `any`, mrtvog koda, preuranjenih apstrakcija i ogromnih modula.
- Važni poslovni tokovi dobijaju stvarne unit, integration i e2e testove.
- Cilj javnog sajta je WCAG AA, dobra navigacija tastaturom, dovoljan kontrast i poštovanje `prefers-reduced-motion`.

## Potvrđene checkout odluke

Kupovina zahteva customer nalog. Nema dostave, delivery adrese, online plaćanja, fee-a ni minimalnog iznosa. Plaćanje je isključivo gotovinom pri preuzimanju. Lokacije su Borska Farmica, Nade Dimić 30, Bor (odmah ispod Stovarišta Našković) i Gradska pijaca Bor subotom. Admin telefonom potvrđuje tačan termin. Order creation rezerviše fizički dostupnu zalihu; cancellation je oslobađa, a cash completion smanjuje fizički stock i pravi SALE movement.

## Preostale nepotvrđene odluke

Pre narednih faza moraju se potvrditi stvarne cene i pakovanja, pravila za alkohol, pravni podaci, skladištenje fotografija i produkcioni provajderi.

## Git i način rada

- Razvoj je fazan; ne prelaziti na novu fazu dok trenutna osnova nije stabilna.
- Jedan Conventional Commit obuhvata jednu završenu funkcionalnu celinu.
- Pre commita pregledati status i diff i pokrenuti relevantne lint, test i build provere.
- Ne commitovati `.env`, tajne, generated output ili build artefakte.
- Ne koristiti force push, destruktivne Git komande niti brisati korisničke izmene.
- Veće arhitektonske odluke prvo obrazložiti kroz problem, predlog, prednosti, mane i prikladnost projektu.
