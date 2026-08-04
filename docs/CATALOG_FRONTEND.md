# Catalog frontend

## Rute i URL contract

`/proizvodi` je SSR katalog, a `/proizvodi/[slug]` javni product detail. URL je jedini izvor filter state-a. Dozvoljeni parametri su `page`, `limit` (najviše 48), `search` (trimovan, najviše 100), `category`, `featured`, `mainProduct` (interno), `availabilityMode` (`ALWAYS`, `SEASONAL`, `MANUAL`), `inStock` i `sort` (`featured`, `newest`, `name_asc`, `name_desc`). Nevalidne vrednosti se normalizuju; filter/sort promena vraća page 1, a pagination čuva ostale filtere.

Catalog učitava kategorije i listing u po jednom requestu. Categories kvar ne ruši listing. Search koristi pristupačan GET form, kategorije/filteri i pagination su pravi linkovi, mobile filteri koriste native modal dialog. Filtered/search URL-ovi imaju canonical `/proizvodi` i `noindex, follow`; samo osnovni katalog i product URL-ovi ulaze u sitemap.

## API, caching i stanja

Typed client koristi URLSearchParams, 5 s timeout i revalidation od 60 s. Razlikuje 404, validation, timeout, unavailable i unexpected grešku bez raw backend poruka. Listing/detail build ne zahtevaju API. Empty katalog, filter bez rezultata i unavailable API imaju različite prikaze. Backend pagination total je izvor broja rezultata.

Availability mapiranje: van poslovne ponude → „Trenutno nije u ponudi“; dostupno ali bez stock/purchase → „Trenutno nema na stanju“; stock+purchasable → „Dostupno“; purchasable bez stocka → „Dostupno za poručivanje“. Stock količine i storage key nikada nisu u tipu/renderu.

## Product detail

Detail request je React request-cache memoizovan između metadata i rendera. 404 koristi `notFound`, dok unavailable API prikazuje retry stanje. Client gallery bira stabilno primary sliku i keyboard thumbnails; bez slika koristi Brand fallback. Variant selector je lokalna radio grupa, bira backend default, menja cenu, validni compare-at, package/unit i per-variant status. Nema add-to-cart kontrole.

Opis se renderuje kao plain-text pasusi bez HTML interpretacije. Related proizvodi dolaze jednim listing requestom iste kategorije, bez trenutnog sluga, najviše četiri.

## SEO i accessibility

Detail generiše title/description/canonical/Open Graph iz stvarnih podataka. Product JSON-LD sadrži samo potvrđene Product/Offer podatke, RSD cenu i InStock/BackOrder/OutOfStock mapiranje; nema rating/review/GTIN/shipping/return polja. BreadcrumbList povezuje početnu, katalog, category query i proizvod. JSON-LD escapuje `<`.

Breadcrumb, search/sort labele, fieldset/legend, active-chip remove name, `aria-current` pagination, native dialog, gallery buttons i variant radios rade tastaturom. CSS poštuje reduced motion. Axe component provere pokrivaju toolbar/pagination i variant panel.

Namerno odloženo: cart mutations, add-to-cart, customer auth/token flow, checkout i cart drawer/page.
