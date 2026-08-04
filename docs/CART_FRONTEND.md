# Cart frontend

Anonimna korpa koristi isključivo backend `bf_cart` HttpOnly cookie. Svaki browser zahtev šalje credentials, a raw identitet nikada nije dostupan React kodu. Stabilni TanStack Query ključ je `['cart']`; nema persistent cache-a, mutation retry-a ni rizičnih optimistic cena. Server response je izvor stavki, trenutnih cena, subtotala i ukupnog iznosa.

Hookovi su `useCart`, `useAddCartItem`, `useUpdateCartItem`, `useRemoveCartItem` i `useClearCart`. Product purchase panel bira varijantu i koristi javni minimum/increment. Decimal.js-light obrađuje do tri decimale, zarez u unosu, minimum i korak bez floating-point računanja. API dobija decimalni string sa tačkom.

Header prikazuje broj različitih stavki i otvara native modal drawer. `/korpa` ima responsive stavke, update/remove, clear confirmation, server subtotal, anonymous login poruku i pickup/cash informacije. Price snapshot i trenutna cena se prikazuju kada je `priceChanged`; invalid/unavailable stavke ostaju vidljive i uklonjive. Stock/reserved količine se ne izlažu i cart mutacije ih ne menjaju.

Drawer/dialog podržavaju Escape, fokus i native modal ponašanje; kontrole imaju labele i 44px targete, a toast koristi status/alert live region. Sledeća celina dodaje checkout preview, pickup izbor, idempotentno kreiranje porudžbine i customer order tokove.
