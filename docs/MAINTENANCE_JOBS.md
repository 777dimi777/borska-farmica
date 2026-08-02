# Automated maintenance jobs

## Order reservation timeout

Svaka nova `PENDING_CONFIRMATION` porudžbina dobija trajni UTC `confirmationExpiresAt` u istoj Serializable checkout transakciji. Podrazumevani TTL je 24 sata (`ORDER_CONFIRMATION_TTL_HOURS`). Promena konfiguracije ne menja postojeće deadline vrednosti niti ih idempotentni replay produžava.

Maintenance bira samo pending redove čiji je deadline `<= now`, zaključava order red i uslovno ga prebacuje u `CANCELLED`. Aktivne rezervacije postaju `RELEASED`, `reservedQuantity` se smanjuje uz zaštitu od negativne vrednosti, dok `stockQuantity` i SALE movements ostaju netaknuti. Event je `order.cancelled_by_timeout`, actor `SYSTEM`, razlog `CONFIRMATION_TIMEOUT`.

Strukturirani razlozi su `CUSTOMER_REQUEST`, `ADMIN_ACTION`, `CONFIRMATION_TIMEOUT` i `UNSPECIFIED`; slobodan tekst ostaje odvojeni `cancellationNote`. Deadline ostaje sačuvan kao istorijski podatak posle promene statusa.

## Concurrency i batch-evi

Order cancellation koristi PostgreSQL row lock, conditional status/deadline update, Serializable transakciju i najviše dva retry pokušaja za poznate write-conflict greške. Ponovljeni ili paralelni run zato ne oslobađa rezervaciju dvaput. Batch je `MAINTENANCE_BATCH_SIZE` (1–500, default 100), sa `MAINTENANCE_MAX_BATCHES` (default 10).

## Carts i sessions

Istekle ACTIVE korpe postaju `EXPIRED` bez stock promena. `EXPIRED`/`ABANDONED` korpe bez order relacije brišu se kada je `updatedAt` stariji od `CART_RETENTION_DAYS`; ACTIVE i CONVERTED istorija se ne brišu.

Customer/admin sessions brišu se tek kada je `expiresAt` ili `revokedAt` stariji od `SESSION_RETENTION_DAYS`. Nalozi, audit, orders, carts i aktivne sesije ostaju. Rezultati sadrže samo counts/duration, bez PII ili token hash-a.

## Scheduler i CLI

Scheduler je podrazumevano isključen (`MAINTENANCE_JOBS_ENABLED=false`), a cron je `ORDER_EXPIRATION_CRON=*/5 * * * *`. Poslovna logika je u testabilnom servisu, ne u decorator metodi.

```powershell
npm run maintenance:run --workspace=@borska-farmica/api -- orders
npm run maintenance:run --workspace=@borska-farmica/api -- carts
npm run maintenance:run --workspace=@borska-farmica/api -- sessions
npm run maintenance:run --workspace=@borska-farmica/api -- all --dry-run
```

`--dry-run` samo broji kandidate i ne menja orders, reservations, carts ili sessions. Produkcija treba da uključi scheduler na kontrolisanoj API instanci ili da koristi CLI iz spoljnog scheduler-a. Sledeće production oblasti su observability, backup/restore i deployment konfiguracija.
