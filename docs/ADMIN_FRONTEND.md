# Admin frontend

Admin frontend je izolovan od customer aplikacije na rutama `/admin/prijava` i `/admin/dashboard`. Customer i admin access tokeni imaju odvojene memorijske session module, refresh cookie-je i React Query cache instance. Nijedan access token se ne čuva u `localStorage`, `sessionStorage` ili čitljivom cookie-ju.

## Autentifikacija i rute

Login koristi `POST /api/v1/admin/auth/login`, profil `GET /api/v1/admin/auth/me`, jednokratno deljeni refresh `POST /api/v1/admin/auth/refresh`, a odjava `POST /api/v1/admin/auth/logout`. Admin shell se prikazuje tek posle uspešne provere sesije. Anonimni posetilac `/admin/dashboard` se preusmerava na `/admin/prijava`; prijavljeni admin sa login stranice ide na dashboard. Podržane backend uloge su `ADMIN` i `SUPER_ADMIN`.

## Dashboard

Dashboard koristi svih 12 read-only analytics endpointa: overview, revenue-series, orders-by-status, order-flow, top-products, category-sales, pickup-sales, inventory-alerts, inventory-summary, seasonal, recent-orders i attention. Period `from`/`to` i granularity su URL stanje. Dostupni su brzi periodi, custom datumi i ručno osvežavanje.

Svaki widget ima sopstveni loading, empty i error prikaz i može se zasebno ponoviti, pa greška jednog endpointa ne ruši ostatak dashboarda. Vizuelni bar prikazi imaju tekstualne vrednosti, a prihod kroz vreme i tabelarnu alternativu. Decimalni iznosi i količine ostaju stringovi do formatiranja; frontend ne preračunava poslovne metrike.

## Granice prve faze

Sidebar trenutno sadrži samo funkcionalni link ka dashboardu. CRUD linkovi i rute nisu dodati pre njihove implementacije. Dashboard ne prikazuje customer email, telefon, session podatke niti druge osetljive vrednosti.

## Provera

Pokrenuti `npm run check`, frontend testove i build. Za lokalni interaktivni pregled potrebni su API, baza i bootstrapovan admin nalog; kredencijali se ne čuvaju u repozitorijumu.

## Browser provera

Pokušaj povezivanja sa lokalnim in-app browserom 2026-08-04 blokiran je host Windows ACL greškom pre otvaranja taba. Screenshot i ručna browser interakcija zato nisu predstavljeni kao izvršeni. Production build, route generation, komponentni testovi, lint, typecheck i responsive CSS provere korišćeni su kao deterministična zamena; browser smoke treba ponoviti kada host browser veza bude dostupna.

## Order workspace

Operativni order listing/detail i stroga transition matrica opisani su u [ADMIN_ORDERS_FRONTEND.md](ADMIN_ORDERS_FRONTEND.md). Sidebar nema nefunkcionalne CRUD linkove; sledeća celina je catalog/inventory administracija.
