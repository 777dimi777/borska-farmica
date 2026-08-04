# Admin dashboard frontend

`/admin/dashboard` koristi svih 12 read-only analytics endpointa, URL period, parcijalna widget error stanja i manual refresh. Recent order public number vodi na UUID detail rutu jer response bezbedno vraća `id`. Pending, stale-pending, ready i overdue-pickup attention stavke vode na podržani order listing filter/sort. Inventory i catalog upozorenja nemaju mrtve linkove dok njihove admin rute ne postoje.

Order mutation invalidation pravila su dokumentovana u [ADMIN_ORDERS_FRONTEND.md](ADMIN_ORDERS_FRONTEND.md).

## Operativne veze

Sidebar sada vodi na Porudžbine, Proizvode i Kategorije. Inventory i content attention kartice mogu se rešavati kroz product editor bez napuštanja admin workspace-a.
