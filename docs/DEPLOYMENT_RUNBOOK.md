# Deployment runbook

Ovaj tok nije vezan za hosting provajdera i ne pokreće migracije pri startu svake API replike.

1. Kreirati managed PostgreSQL bazu i privatnu mrežnu vezu.
2. Uneti production secrets iz `.env.production.example` u secret store.
3. Podesiti Cloudinary i uključiti upload samo kada su sva tri credential-a prisutna.
4. Potvrditi javne domene i tačan CORS origin.
5. Potvrditi HttpOnly/Secure/SameSite cookie politiku i host-only ili eksplicitni domain.
6. Eksplicitno podesiti `TRUST_PROXY` prema topologiji.
7. Izgraditi immutable API image: `docker build -f apps/api/Dockerfile -t <registry>/<image>:<commit> .`.
8. Napraviti i proveriti backup.
9. U zasebnom migration job-u pokrenuti `npm run db:migrate:deploy`, zatim `prisma migrate status`.
10. Seed pickup lokacija/kategorija pokrenuti samo pri inicijalizaciji ili odobrenoj promeni; ne pri svakom deployu.
11. Prvi admin kreirati jednom eksplicitnim `admin:bootstrap`, zatim ukloniti bootstrap password iz environment-a.
12. Pokrenuti API image; `compose.production.example.yml` je lokalni/provider-neutralni primer.
13. Proveriti `/api/v1/health` i `/api/v1/health/ready`.
14. Smoke-testovati katalog, auth, checkout contract, ugašen Swagger i zaštićene metrics.
15. Uključiti maintenance scheduler na tačno jednoj kontrolisanoj instanci/job-u.
16. Povezati log ingestion, Prometheus alerts i opcioni Sentry bez PII.
17. Za rollback vratiti prethodni immutable image. Ne vraćati migraciju unazad automatski; za nekompatibilnu schema promenu koristiti odobren forward-fix ili provereni restore plan.

Pre puštanja pokrenuti `npm run check`, kompletan E2E, audit i secret scan. Posle puštanja pratiti 5xx, latency, readiness, maintenance i order/image metrike.
