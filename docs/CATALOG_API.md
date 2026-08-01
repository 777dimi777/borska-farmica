# Javni Catalog API

Javni katalog je read-only. Sve rute koriste base path `/api/v1`; POST, PATCH i DELETE rute ne postoje dok admin autentifikacija ne bude implementirana.

## Rute

- `GET /categories` vraća sve aktivne kategorije, uključujući prazne, sortirane po `sortOrder` pa nazivu.
- `GET /categories/:slug` vraća aktivnu kategoriju po kanonskom, case-sensitive slugu. Skrivena ili nepostojeća kategorija vraća 404.
- `GET /products` vraća paginirane ACTIVE proizvode u aktivnim kategorijama koji imaju aktivnu varijantu.
- `GET /products/:slug` vraća javne detalje, aktivne varijante i slike. Neobjavljen sadržaj vraća 404.

Listing podržava `page`, `limit`, `search`, `category`, `featured`, `mainProduct`, `availabilityMode`, `inStock` i `sort`. Sortiranja su `newest`, `name_asc`, `name_desc` i `featured`. Filter nepostojećeg category sluga vraća praznu listu. `inStock=true` zahteva fizički raspoloživu aktivnu varijantu ili dozvoljen backorder; `false` ne sužava rezultate. Price sorting je odložen jer trenutni stabilni Prisma relation API ne sortira proizvod po minimalnoj ceni aktivne varijante pre paginacije bez raw SQL-a.

Primer: `GET /api/v1/products?category=mlecni-proizvodi&featured=true&sort=newest&page=1&limit=12`.

Pagination contract sadrži `data` i `pagination` sa poljima `page`, `limit`, `total`, `totalPages`, `hasPreviousPage` i `hasNextPage`. Podrazumevani limit je 12, maksimalni 48, a prazan rezultat ima `totalPages: 0`.

## Dostupnost i preciznost

`ALWAYS` ignoriše manual flag; `MANUAL` ga koristi; `SEASONAL` zahteva aktivan fiksni ili godišnji period koji obuhvata poslovni datum. Godišnji period može preći Novu godinu. Datum se računa u zoni `Europe/Belgrade`, bez zavisnosti od UTC dana servera. Prvi odgovarajući period po `sortOrder` daje label.

`currentlyAvailable` je poslovna/sezonska dostupnost, `inStock` znači da fizičko stanje aktivne varijante umanjeno za rezervacije ostaje pozitivno, a `purchasable` dodatno prihvata backorder. API nikada ne vraća tačne stock/reserved količine, pragove ili inventory movements. Novac ima dve, a količina pakovanja tri decimale i serijalizuju se kao stringovi.

Swagger UI je na `/api/docs`, a generisani JSON na `/api/docs-json`. `SWAGGER_ENABLED=false` isključuje obe rute bez uticaja na API.
