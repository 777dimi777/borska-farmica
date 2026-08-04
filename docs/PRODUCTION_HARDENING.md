# Production hardening

Ovo je provider-neutralna osnova; stvarni deployment i kredencijali nisu deo repozitorijuma. Kopirati `.env.production.example` u tajni deployment store, ne u Git.

## Obavezna konfiguracija

Production start je fail-fast. Zahtevaju se HTTPS `FRONTEND_URL` bez localhost/wildcard vrednosti, Äetiri razliÄita JWT secret-a od najmanje 48 znakova bez placeholdera, Secure auth/customer/cart cookies, eksplicitni SameSite, `SWAGGER_ENABLED=false`, bezbedni HTTP timeout-i i validan `DATABASE_URL`. `HTTP_HEADERS_TIMEOUT_MS` mora biti veÄ‡i od keep-alive timeout-a. Metrics zahtevaju token od najmanje 32 znaka; Sentry zahteva DSN; Cloudinary credentials su obavezni samo kada je upload ukljuÄen.

Reverse proxy mora eksplicitno postaviti `TRUST_PROXY`. CORS prihvata samo konfigurisani frontend origin i credentials. Cookie domain se po potrebi postavlja u deployment konfiguraciji; host-only cookie je uÅ¾i i podrazumevani izbor. Access token se ne Äuva u localStorage; refresh cookies ostaju HttpOnly, Secure u produkciji i sa uskom putanjom.

## Runtime

Production logovi su JSON. Swagger je iskljuÄen. Helmet, uklonjen `X-Powered-By`, body/upload limiti, throttling, origin/CSRF kontrole, audit redakcija, CSV formula zaÅ¡tita i odvojeni admin/customer token tipovi ostaju aktivni. Maintenance nema javni endpoint.

Nest reaguje na SIGTERM/SIGINT, prestaje da prihvata nove konekcije, zatvara scheduler i Prisma konekciju i flushuje opcioni Sentry. Grace period i Node keep-alive/headers/request timeout-i su konfigurisani environment-om.

## Security checklist pre puÅ¡tanja

- generisati jedinstvene tajne i Äuvati ih van Git-a;
- potvrditi CORS domen, proxy i Secure/SameSite cookie ponaÅ¡anje;
- drÅ¾ati Swagger ugaÅ¡en i metrics endpoint na privatnoj mreÅ¾i uz token;
- ukljuÄiti Cloudinary/Sentry/maintenance samo uz kompletnu konfiguraciju;
- pokrenuti audit, migracije, health/readiness, auth/upload rate-limit i smoke provere;
- potvrditi backup, restore drill i monitoring alarme.

## Dependency audit (2026-08-02)

API production workspace: `npm audit --workspace=@borska-farmica/api --omit=dev` = 0 nalaza. Direktni backend Sharp je podignut na 0.35.3, a Swagger je privremeno pinovan na 11.4.5 jer 11.4.6 povlači ranjivi `js-yaml`.

Root production/puni audit i dalje prijavljuju 3 high nalaza isključivo kroz frontend `next@16.2.12` ugrađene `postcss@8.4.31` i `sharp@0.34.5`. NPM nudi samo `audit fix --force` sa breaking downgrade-om na Next 14.2.35, zato nije primenjen. Ovo se rešava u frontend dependency celini pre stvarnog deploya. `npm outdated` takođe prikazuje samo planirane major/tooling ili patch nadogradnje; nema deprecated upozorenja iz instalacije.
