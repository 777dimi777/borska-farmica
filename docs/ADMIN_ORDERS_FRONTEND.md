# Admin orders frontend

## Rute i identifikator

- `/admin/porudzbine` — paginirani operativni listing.
- `/admin/porudzbine/[orderIdentifier]` — detail workspace; `orderIdentifier` je backend UUID jer `GET /api/v1/admin/orders/:id` koristi UUID v4. Javni broj je primarni UI identitet.

Obe rute su u izolovanom ADMIN/SUPER_ADMIN workspace-u, ostaju `noindex` i nisu deo sitemap-a.

## URL filter contract

Listing URL koristi stvarna backend imena: `page`, `limit` (12, 24 ili 48), `search`, `status`, `paymentStatus`, `pickupLocationId`, `requestedPickupDateFrom`, `requestedPickupDateTo`, `createdAtFrom`, `createdAtTo` i `sort` (`newest`, `oldest`, `pickup_date`, `status`). Centralni parser trimuje search na 120 karaktera, proverava enum/UUID/date-only vrednosti, odbacuje obrnut period i normalizuje page. Promena filtera vraća page na 1; pagination čuva filtere. Filteri se ne čuvaju u storage-u.

Pickup ID opcije dolaze iz `GET /api/v1/checkout/pickup-locations`; database ID-jevi nisu hardkodovani. Search prema backend ugovoru pokriva public order number, ime, email i telefon.

## Query organizacija

Keys su `['admin-orders','list',serializedFilters]` i `['admin-orders','detail',uuid]`. Listing stale time je 25 sekundi, detail 10 sekundi. Svaki request koristi isključivo admin `authorized` tok, memorijski access token i HttpOnly refresh cookie. Mutation nema retry ni optimistic status.

Uspešna tranzicija osvežava detail/list i dashboard overview, recent, attention, orders-by-status i order-flow. Completion dodatno osvežava revenue, top products, category/pickup sales i inventory. Cancellation osvežava inventory/attention.

## Listing i detail

Listing ima status shortcut-e, GET search, desktop/mobile filtere, active chips, tabelu, mobile cards, backend paginaciju i odvojena loading/empty/unavailable stanja. Pending order prikazuje `confirmationExpiresAt`; prošao rok ne menja status lokalno, već traži osvežavanje.

Detail prikazuje customer snapshot i kontakt linkove, pickup relaciju (backend trenutno nema poseban pickup snapshot), immutable item/category/variant/SKU/price snapshots, server total, reservations/current stock summary, cash payment, ključne datume, cancellation razlog/napomenu i bezbedni OrderEvent timeline. Raw metadata se ne renderuje.

## Transition matrica i action panel

- `PENDING_CONFIRMATION → CONFIRMED | CANCELLED`
- `CONFIRMED → PREPARING | CANCELLED`
- `PREPARING → READY_FOR_PICKUP | CANCELLED`
- `READY_FOR_PICKUP → COMPLETED | CANCELLED`
- `COMPLETED` i `CANCELLED` su terminalni.

UI prikazuje samo sledeći dozvoljeni korak i cancellation; nema generičkog status dropdown-a, skip/back transition-a ili bulk akcija. Confirmation zahteva dogovoreni timestamp na requested pickup datumu. Ready dialog izričito kaže da automatska customer notifikacija ne postoji.

Completion zahteva checkbox da je porudžbina preuzeta i plaćena gotovinom. Backend zatim atomski postavlja COMPLETED/PAID, smanjuje fizičku i rezervisanu zalihu, CONSUMED rezervacije i pravi po jedan SALE movement; UI ništa od toga ne računa lokalno.

Cancellation zahteva tekst do 500 karaktera. Backend postavlja strukturirani razlog `ADMIN_ACTION`, oslobađa rezervacije i smanjuje samo reservedQuantity; fizička zaliha i InventoryMovement ostaju nepromenjeni.

## Konflikti, privatnost i pristupačnost

Kod 409 nema retry-a: detail se refetch-uje i UI javlja da je porudžbina u međuvremenu promenjena, uz bezbedan request ID kada postoji. Network/timeout mutation takođe prvo osvežava detail pre novog pokušaja. Customer PII postoji samo u admin workspace-u i ne loguje se. Tokeni/cookies/raw audit metadata se ne prikazuju.

Native dialog obezbeđuje fokus/Escape/restore ponašanje. Polja imaju label, tabele caption, statusi tekst, timeline semantiku, completion checkbox i destructive cancellation. Reduced motion je podržan.

## Odloženo

Nisu uvedeni bulk workflow, edit pickup-a, automatske email/SMS poruke, refunds/returns niti admin CRUD kategorija, proizvoda, varijanti, slika, availability-ja, zaliha ili kupaca.

## Vizuelna provera

Pokušaj povezivanja sa lokalnim browserom 2026-08-04 blokiran je host Windows ACL greškom pre otvaranja taba. Screenshot provera zato nije predstavljena kao izvršena. Responsive CSS breakpointi, component render, axe, typecheck i production build koriste se kao deterministična zamena; browser smoke treba ponoviti kada host browser veza bude dostupna.
