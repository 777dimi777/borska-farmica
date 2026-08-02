# Admin Dashboard Analytics API

Base path je `/api/v1/admin/dashboard`. Sve rute zahtevaju admin access bearer token i role `ADMIN` ili `SUPER_ADMIN`; customer token nije prihvaćen. Swagger tag je **Admin Dashboard**.

## Endpointi

- `GET /overview?from=&to=` — KPI i poređenje sa prethodnim periodom, plus trenutni broj porudžbina koje čekaju potvrdu.
- `GET /revenue-series?from=&to=&granularity=day|week|month` — prihod i broj završenih porudžbina, sa praznim bucket-ima.
- `GET /orders-by-status?from=&to=` — trenutni status porudžbina kreiranih u periodu; svi enum statusi postoje i kada je count nula.
- `GET /order-flow?from=&to=` — nezavisni event/timestamp brojači; nije cohort funnel.
- `GET /top-products?from=&to=&limit=10&sort=revenue|quantity|orders`.
- `GET /category-sales?from=&to=` — grupisanje po istorijskom category snapshot-u stavke.
- `GET /pickup-sales?from=&to=` — prodaja po pickup ID-u; naziv/adresa su trenutni podaci relacije, ne istorijski snapshot.
- `GET /inventory-alerts?status=low|out|backorder|reserved_pressure|all`.
- `GET /inventory-summary` — status brojači i Decimal količine odvojene po mernoj jedinici.
- `GET /seasonal?horizon=60` — trenutna i prva naredna dostupnost aktivnih sezonskih proizvoda.
- `GET /recent-orders?limit=10` — operativni prikaz bez emaila i telefona.
- `GET /attention` — pending/stale pending, confirmed today, ready, overdue pickup, stock i catalog-content upozorenja.

`limit` je 1–50. Seasonal horizon je 1–366 dana.

## Period i vremenska zona

`from` i `to` su strogi `YYYY-MM-DD`, uključivi poslovni datumi u `Europe/Belgrade`. Interno se pretvaraju u DST-ispravne granice `start <= timestamp < endExclusive`. Bez parametara koristi se poslednjih 30 poslovnih datuma uključujući danas. Maksimum je 366 dana, a budući `to` nije dozvoljen.

Prethodni period ima isti broj kalendarskih datuma i završava se dan pre `from`. Weekly bucket počinje ponedeljkom. Day granularity je ograničen na 93 dana; week/month na 366.

Svaki uporediv KPI vraća `current`, `previous`, `absoluteChange`, `percentageChange` i `trend`. Decimal vrednosti su stringovi. Kada je prethodna vrednost nula, procenat je `null`; trend je `up` ako je current pozitivan, inače `flat`. Odgovori ne sadrže `NaN` ili beskonačnost.

## Definicije metrika

Prihod, completed orders, AOV, items sold, unique customers, top products, kategorije i pickup prodaja uključuju isključivo porudžbine koje su istovremeno `COMPLETED` i `PAID`, filtrirane po `completedAt`.

- Revenue je zbir `Order.total`.
- Completed orders je broj porudžbina.
- AOV je revenue / completed orders, ili `0.00`.
- Items sold je zbir `OrderItem.quantity`, na tri decimale.
- Unique customers je distinct `customerId`.
- Created orders koristi `createdAt`.
- Cancelled orders koristi `cancelledAt`.
- Pending confirmation je trenutni operativni snapshot i nema periodno poređenje.
- Order flow broji događaje po odgovarajućim timestamp kolonama; ista porudžbina može doprineti različitim koracima.

## Snapshot, SQL i zalihe

Migracija `20260802143000_add_order_analytics_snapshots` dodaje `categoryId/categoryName/categorySlug` na `OrderItem`, backfill-uje postojeće stavke preko trenutne Product→Category relacije, prekida migraciju ako backfill nije potpun, a zatim postavlja kolone na NOT NULL. Checkout ih popunjava za svaku novu stavku. Dodati su samo indeksi korišćeni za completed/paid i category analytics.

Agregacije koriste Prisma Decimal i parametrizovane `Prisma.sql` upite. Granularity i sort nisu direktno interpolirani korisnički stringovi, već allow-list enum grane. Nema N+1 upita ni in-memory paginacije. Revenue serija koristi PostgreSQL `generate_series` za prazne bucket-e.

Inventory koristi isti centralni `variantStockStatus` classifier kao admin products. `reserved_pressure` znači aktivna rezervacija od najmanje 75% fizičke zalihe (ili rezervacija uz nultu fizičku zalihu). Količine različitih `MeasurementUnit` vrednosti se nikada ne sabiraju zajedno.

Seasonal endpoint ponovo koristi postojeći availability engine za recurring, cross-year i fixed prozore. Feb 29 je dostupan samo u validnoj prestupnoj godini. Aktivni seasonal proizvod bez aktivnog prozora ulazi u attention.

## Operativni prag i bezbednost

`DASHBOARD_PENDING_ATTENTION_HOURS` je Joi-validiran integer 1–720, default `24`. Stale pending znači `PENDING_CONFIRMATION` stariji od praga. Overdue pickup obuhvata samo neterminalne statuse sa prošlim requested pickup datumom.

Nijedan endpoint ne mutira kupca ili porudžbinu i ne vraća customer email/telefon, password/session/token podatke, idempotency hash ili rezervacione interne podatke. Nisu implementirani frontend, chart biblioteka, CSV, refunds, online payment, email/SMS ni cloud servis.

## Timeout compatibility

Automatically expired orders use normal `CANCELLED` status and are excluded from revenue. Revenue remains based only on COMPLETED/PAID orders and `completedAt`.
