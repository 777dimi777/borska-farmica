# Backup i restore

Backup je osetljiv jer sadrži customer podatke. Čuvati ga enkriptovano, sa ograničenim pristupom, van aplikacionog servera. Početna politika: dnevni automatski backup, 14–30 dana retentiona, backup pre svake migracije/deploya i mesečna restore proba. Početni RPO je 24 h, a RTO 4 h; vlasnik sistema ih mora potvrditi prema poslovnom riziku.

## Lokalni backup i verifikacija

```powershell
npm run db:backup -- --output=.local/backups/borska-farmica.dump
npm run db:backup:verify -- --file=.local/backups/borska-farmica.dump
```

Backup koristi `pg_dump -Fc`, odbija postojeći target bez `--overwrite`, ne ispisuje password i pravi JSON manifest sa SHA-256, vremenom, veličinom, bazom bez credentials, app verzijom, commitom i PostgreSQL verzijom. Folder je git-ignored.

Verify proverava fajl/checksum, kreira isključivo generisanu bazu sa prefiksom `borska_farmica_restore_test_`, restore-uje dump, proverava kritične tabele i Prisma migracije bez PII ispisa i u `finally` bloku briše samo tu bazu. Naziv van bezbednog prefiksa se nikada ne briše.

## Produkcioni restore runbook

1. Odobriti maintenance prozor, vlasnika akcije i tačan backup/checksum.
2. Zaustaviti write saobraćaj i napraviti dodatni snapshot.
3. Restore prvo proveriti u izolovanoj bazi iste PostgreSQL major verzije.
4. Potvrditi migracije, kritične tabele i bezbedne agregatne row-count provere.
5. Napraviti novu production bazu ili koristiti provider-ov kontrolisani point-in-time restore; nikada ne prepisivati aktivnu bazu generičkom skriptom.
6. Promeniti connection secret, pokrenuti readiness/smoke test i tek tada vratiti saobraćaj.
7. Dokumentovati vreme, operatora, RPO/RTO rezultat i cleanup.
