# Admin Customers, Audit and CSV API

Sve rute koriste admin bearer JWT. Customer token se odbija.

## Role matrica

| Operacija                      | ADMIN | SUPER_ADMIN |
| ------------------------------ | ----: | ----------: |
| Customer list/detail/orders    |    da |          da |
| Disable/enable/revoke sessions |    ne |          da |
| Audit list/detail              |    ne |          da |
| Inventory CSV                  |    da |          da |
| Customers/orders/audit CSV     |    ne |          da |

## Customer endpointi

- `GET /api/v1/admin/customers`: page/limit, search, status, createdFrom/To, lastOrderFrom/To i sort.
- `GET /api/v1/admin/customers/:id`
- `GET /api/v1/admin/customers/:id/orders`: page/limit, status, paymentStatus, createdFrom/To i newest/oldest.
- `POST /api/v1/admin/customers/:id/disable`
- `POST /api/v1/admin/customers/:id/enable`
- `POST /api/v1/admin/customers/:id/revoke-sessions`

Lista vraća profil, orderCount, completedOrderCount, cancelledOrderCount, totalSpent, lastOrderAt i activeSessionCount. `totalSpent` je Decimal zbir samo `COMPLETED + PAID` porudžbina. Nema password/session hash/token polja.

Disable transakcijski postavlja `DISABLED`, opoziva aktivne sesije i auditira `customer.disabled`. Ne dira korpu, porudžbine, rezervacije ni zalihe. Access guard pri svakom zahtevu ponovo proverava ACTIVE status, a refresh takođe odbija disabled nalog. Enable auditira `customer.enabled`, ne oživljava sesije i zahteva novi login. Revoke je idempotentan, vraća broj opozvanih sesija i auditira `customer.sessions_revoked`.

Primer: `GET /api/v1/admin/customers?search=Ana&status=ACTIVE&sort=total_spent_desc&page=1&limit=12`.

## Audit viewer

SUPER_ADMIN koristi:

- `GET /api/v1/admin/audit-logs`
- `GET /api/v1/admin/audit-logs/:id`

Filteri su adminId, action, resourceType, resourceId, createdFrom/To, search i newest/oldest. Poslovni datumi su uključivi u Europe/Belgrade i interno koriste end-exclusive DST granicu. Čitanje ne pravi audit zapis; nema mutation ruta.

Response redakcija rekurzivno menja vrednost u `[REDACTED]` za ključeve koji, nakon lowercase i uklanjanja separatora, tačno odgovaraju: password, passwordHash, token, refreshToken, accessToken, cookie, authorization, sessionTokenHash, secret i connectionString. Baza se ne menja; npr. `tokenCount` se ne rediguje.

## CSV izvozi

- `GET /api/v1/admin/exports/customers.csv`
- `GET /api/v1/admin/exports/orders.csv`
- `GET /api/v1/admin/exports/inventory.csv`
- `GET /api/v1/admin/exports/audit-logs.csv`

Format je RFC 4180 comma-separated UTF-8 sa BOM-om, CRLF redovima, stabilnim kolonama, ISO-8601 datumima i Decimal stringovima. Content-Type je `text/csv; charset=utf-8`, a filename je fiksan i bezbedan.

Tekst koji počinje opcionim whitespace-om pa `=`, `+`, `-`, `@`, TAB ili CR dobija apostrof pre CSV escaping-a. Zarezi, navodnici i multiline vrednosti se pravilno citiraju.

Maksimum je 10.000 redova. Rezultat od 10.001 vraća 422 `CSV_EXPORT_LIMIT_EXCEEDED`; nepotpun fajl se ne šalje. Generisanje je bounded, ne neograničeno.

Customer kolone: id, ime/prezime, email, telefon, status, registracija, order/completed counts, total spent i last order. Order kolone koriste order/customer snapshot, pickup, total, lifecycle datume i item count. Inventory sadrži product/category/variant/SKU, Decimal stock/reserved/available/threshold, stock/backorder i cenu. Audit sadrži identitete, akciju/resurs/vreme i redigovan metadata JSON.

Uspešni izvozi auditiraju `customer.exported`, `orders.exported`, `inventory.exported` ili `audit_logs.exported`, samo sa filterima, brojem redova i formatom. Audit export bira redove pre sopstvenog audit upisa.

## Bezbednost i odloženo

Ne postoje delete customer, anonimizacija, frontend, cloud upload, email/SMS, password reset, dostava ili online plaćanje. DTO whitelist/forbid pravila sprečavaju mass assignment. UUID greške su 400, missing 404, pogrešna uloga 403, a prekoračenje izvoza 422.
