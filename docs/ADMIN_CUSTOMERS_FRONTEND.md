# Admin customers frontend

Rute su `/admin/kupci` i `/admin/kupci/[customerId]`. Listing URL podržava `page`, `limit`, `search`, `status`, `createdFrom`, `createdTo`, `lastOrderFrom`, `lastOrderTo` i backend sort vrednosti. Prikazane metrike dolaze sa servera; `totalSpent` obuhvata samo završene i plaćene porudžbine i ostaje Decimal string do RSD formatiranja.

Detail prikazuje kontakt, account metadata, status raspodelu, aktivne sesije i poseban paginirani customer-orders endpoint. Link porudžbine koristi vraćeni UUID ka postojećoj admin detail ruti.

ADMIN ima read-only pristup. SUPER_ADMIN može deaktivirati/aktivirati nalog i opozvati sve sesije. Sve akcije imaju eksplicitnu potvrdu, nemaju optimistic update i refetchuju detail/list. Disable opoziva sesije, ali ne briše nalog, korpu ili porudžbine i ne menja rezervacije/zalihe. Enable ne vraća stare sesije; revoke ne menja status.

Nema delete, edit credentials, password reset, impersonation ili customer token prikaza.
