# Administratorska autentifikacija

## Arhitektura

Administratori koriste zasebne `AdminUser` i `AdminSession` modele; customer identitet nije uveden. Uloge su `ADMIN` i `SUPER_ADMIN`, statusi `ACTIVE` i `DISABLED`. Ime i prezime su obavezni. Email se pre pretrage i upisa normalizuje sa trim + lowercase. Lozinke se čuvaju isključivo kao Argon2id hash.

`AdminSession` čuva SHA-256 hash refresh tokena, expiry, revoke/last-used vreme i ograničene user-agent/IP metapodatke. Raw refresh token se ne čuva. FK koristi restrict delete radi očuvanja sigurnosne istorije.

## HTTP tok

- `POST /api/v1/admin/auth/login` proverava generičke kredencijale, ACTIVE status, pravi sesiju, vraća access JWT u JSON-u i postavlja refresh JWT kao HttpOnly cookie.
- `POST /api/v1/admin/auth/refresh` proverava cookie, JWT type, hash, session expiry/revocation i ACTIVE admina. Transakcijski opoziva staru sesiju i pravi novu; stari token se odmah odbija.
- `POST /api/v1/admin/auth/logout` je idempotentan, opoziva prepoznatu sesiju i briše cookie sa istim path/security opcijama.
- `GET /api/v1/admin/auth/me` zahteva Bearer access JWT i ponovo proverava ACTIVE admina u bazi.

Access payload sadrži samo `sub`, `role` i `type=access`; refresh sadrži `sub`, `sessionId` i `type=refresh`. Token type se obavezno proverava. Role guard dozvoljava samo eksplicitno navedene uloge; SUPER_ADMIN nema skrivenu implicitnu hijerarhiju.

## Cookie i frontend

Refresh cookie je HttpOnly, ograničen na `/api/v1/admin/auth`, sa konfigurabilnim Secure/SameSite i max-age usklađenim sa refresh TTL-om. Access token budući admin frontend drži samo u memoriji. Access ili refresh token se ne čuvaju u localStorage-u.

Lokalni same-site tok koristi `SameSite=Lax`, strogi CORS origin i credentials. Cross-site produkcija sa `SameSite=None` zahteva `Secure=true`, potvrđene domene i stvarnu CSRF strategiju pre deploymenta; trenutna implementacija ne glumi CSRF zaštitu koju arhitektura još nije potvrdila.

## Environment

Obavezni su zasebni, najmanje 32 karaktera dugi `JWT_ACCESS_SECRET` i `JWT_REFRESH_SECRET`. `JWT_ACCESS_TTL` je lokalno 900 sekundi, `JWT_REFRESH_TTL` 604800 sekundi. Cookie podešavaju `ADMIN_REFRESH_COOKIE_NAME`, `AUTH_COOKIE_SECURE` i `AUTH_COOKIE_SAME_SITE`. `TRUST_PROXY` se uključuje samo iza potvrđenog proxy-ja. Stvarni secrets moraju biti nasumično generisani zasebno za svako okruženje i ne commituju se.

## Bootstrap prvog admina

Nema javne registracije. Postavite privremeno `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, `BOOTSTRAP_ADMIN_FIRST_NAME`, `BOOTSTRAP_ADMIN_LAST_NAME` i `BOOTSTRAP_ADMIN_ROLE`, pa pokrenite:

```powershell
npm run admin:bootstrap --workspace=@borska-farmica/api
```

Lozinka mora imati 12-128 karaktera. U produkciji je potreban i `BOOTSTRAP_ADMIN_CONFIRM=CREATE_ADMIN`. Postojeći email je bezbedan no-op i lozinka se ne menja. Odmah posle uspeha uklonite bootstrap password iz environment-a. Komanda nikada ne loguje lozinku.

## Lokalno testiranje i Swagger

Pokrenite PostgreSQL, zatim `npm run test:e2e --workspace=@borska-farmica/api -- --runInBand`. Fixture admin i sesije čiste se pre i posle suite-a. Swagger je na `/api/docs`, JSON na `/api/docs-json` i dokumentuje cookie i Bearer scheme.

## Sigurnosna ograničenja i naredne odluke

Helmet, uklonjen X-Powered-By, ograničen JSON body, globalni limiter i stroži login limiter čine osnovu. Lozinke/tokeni se ne loguju. Pre produkcije treba potvrditi reverse proxy/trust proxy, admin/frontend domene, CORS, Secure/SameSite/CSRF strategiju, secret management/rotation, session retention, audit log, incident revocation, 2FA i password reset/email provajdera. Admin frontend, admin CRUD, javna registracija i customer auth nisu deo ove faze.

## Session retention

Expired or revoked admin session rows older than the configured retention period are physically removed without deleting administrators or audit history. See [MAINTENANCE_JOBS.md](MAINTENANCE_JOBS.md).
