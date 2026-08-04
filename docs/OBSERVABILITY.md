# Observability

## Logovi i correlation

`nestjs-pino`/Pino daje JSON logove u produkciji i opcioni pretty prikaz lokalno. Access log sadrži request ID, metod, normalizovanu putanju bez query vrednosti, status i trajanje; body, response body, Authorization i cookies se ne loguju. `X-Request-ID` prihvata samo 1–100 slova/cifara/`.`/`_`/`-`; ostalo se zamenjuje UUID-em i finalna vrednost se vraća u response headeru. AsyncLocalStorage čuva correlation context. Background maintenance koristi zaseban `runId` i job name.

Centralna rekurzivna redakcija pokriva authorization/cookie/set-cookie, passwords, tokene i hash vrednosti, API/provider secrets, database URL/connection string, kao i email, telefon, adresu i ime. Prisma SQL vrednosti se ne uključuju u production logove.

Globalni error odgovor sadrži `statusCode`, `error`, bezbedan `message`, opcioni stabilni `code`, `requestId`, `timestamp` i `path`. Neočekivani 500 nikada ne vraća stack, Prisma/SQL/provider detalje ili filesystem/environment podatke.

## Metrics

`GET /api/v1/internal/metrics` vraća 404 kada je isključen, a kada je uključen zahteva poseban timing-safe Bearer token. Ruta nije u Swaggeru. Prometheus registry je izolovan od globalnog registra.

Metrike obuhvataju Node/process podatke, HTTP count/duration/status class/route template, DB readiness, maintenance runs/duration/processed rows, image upload success/failure, kreirane i završene porudžbine i otkazivanja po kontrolisanom reason labelu. ID-evi, SKU, email/telefon, request ID, raw URL i error poruka nikada nisu label-e.

## Sentry

Sentry je podrazumevano ugašen i tada nema init/mrežnih poziva. Kada se uključi, environment/release/sample rate dolaze iz konfiguracije, `sendDefaultPii=false`, a `beforeSend` uklanja body, query, cookies, tokene, secrets i PII. Šalju se samo neočekivane/serverske greške; očekivani 4xx se ne prijavljuju. Request ID ostaje bezbedan tag. Testovi ne koriste stvarni transport.
