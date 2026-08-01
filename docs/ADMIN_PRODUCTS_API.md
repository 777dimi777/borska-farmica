# Admin Products API

Zaštićeni API pod `/api/v1/admin/products` upravlja proizvodima, varijantama i fizičkom zalihom. Sve rute zahtevaju Bearer access JWT i aktivnog administratora.

## Role

| Operacija                    | ADMIN | SUPER_ADMIN |
| ---------------------------- | ----: | ----------: |
| Product list/details         |    Da |          Da |
| Product create/update/status |    Da |          Da |
| Product physical delete      |    Ne |          Da |
| Variant create/update        |    Da |          Da |
| Variant physical delete      |    Ne |          Da |
| Inventory adjustment/history |    Da |          Da |

## Product rute i listing

- `GET /admin/products` — `page`, `limit`, `search`, `categoryId`, `status`, `featured`, `mainProduct`, `availabilityMode`, `stockStatus`, `sort`.
- `GET /admin/products/:id` — sva product polja, category summary, sve varijante, stock summary, read-only slike i availability windows.
- `POST /admin/products` — pravi isključivo `DRAFT`, bez nested podataka.
- `PATCH /admin/products/:id` — parcijalna izmena i lifecycle.
- `DELETE /admin/products/:id` — samo SUPER_ADMIN i samo prazan DRAFT.

`search` je case-insensitive nad imenom, slugom i SKU-om. Nepostojeći validan `categoryId` vraća praznu stranicu. Status je `all|DRAFT|ACTIVE|ARCHIVED`; sort je `newest|oldest|name_asc|name_desc|updated_desc|status`.

Stock status se računa nad aktivnim varijantama pre paginacije u PostgreSQL-u:

- `in_stock`: dostupno (`stock-reserved`) je iznad low-stock praga;
- `low_stock`: dostupno je pozitivno i manje ili jednako pragu;
- `backorder`: nema fizički dostupne količine, ali aktivna varijanta dozvoljava backorder;
- `out_of_stock`: nema aktivne varijante sa fizički dostupnom količinom niti backorderom.

Admin decimalne vrednosti se vraćaju kao stringovi. Listing ne učitava movement istoriju niti pune child kolekcije u response.

## Lifecycle

| Iz       | U        | Dozvoljeno                                            |
| -------- | -------- | ----------------------------------------------------- |
| DRAFT    | ACTIVE   | Da, uz aktivnu kategoriju i validnu aktivnu varijantu |
| DRAFT    | ARCHIVED | Da                                                    |
| ACTIVE   | DRAFT    | Da                                                    |
| ACTIVE   | ARCHIVED | Da                                                    |
| ARCHIVED | DRAFT    | Da                                                    |
| ARCHIVED | ACTIVE   | Ne; prvo vratiti u DRAFT                              |

Aktivacija zahteva aktivnu kategoriju, najmanje jednu aktivnu varijantu sa pozitivnom cenom i najviše jedan default. Ako default ne postoji, servis transakciono bira prvu aktivnu varijantu po `sortOrder`, nazivu i ID-u. Sezonski DRAFT/ACTIVE proizvod trenutno može biti bez window-a; javni availability engine ga tada prikazuje kao trenutno nedostupan. Window mutation API još ne postoji.

## Varijante

Rute su `POST /:productId/variants`, `PATCH /:productId/variants/:variantId` i SUPER_ADMIN-only `DELETE` iste rute. SKU se trimuje, pretvara u uppercase, globalno je jedinstven i prihvata `A-Z`, cifre, `-` i `_` bez razmaka.

Cene i količine se primaju isključivo kao obični decimalni stringovi: cena do 2, količine do 3 decimale; nema JS numbera, exponent notation, NaN ili Infinity. `price > 0`, `compareAtPrice` je null ili veći od cene, a package/minimum/increment su pozitivni. Prva varijanta automatski postaje default; novi default u istoj transakciji skida prethodni. Stock/reserved nisu dozvoljeni u variant DTO-u.

Varijanta sa movement istorijom, stockom ili rezervacijom se ne briše. ACTIVE proizvod ne može ostati bez aktivne/default varijante; koristite deaktivaciju kada fizičko brisanje nije bezbedno.

## Inventory

- `GET /:productId/variants/:variantId/inventory-movements` — paginacija, newest-first i opcioni `type` filter.
- `POST /:productId/variants/:variantId/inventory-adjustments` — samo `RESTOCK`, `DAMAGE`, `ADJUSTMENT`.

RESTOCK prima pozitivnu količinu; DAMAGE prima pozitivnu apsolutnu količinu i obavezan razlog; ADJUSTMENT prima signed `quantity` delta i obavezan razlog. Nulta delta se odbija. Reserved stock se nikada ne menja, a rezultat ne sme biti negativan niti ispod rezervisane količine.

Adjustment koristi `Serializable` transakciju i do tri retry pokušaja samo za Prisma/PostgreSQL write conflict (`P2034`). Variant update, immutable movement sa balance-after snapshotom i audit nastaju zajedno ili se sve rollbackuje.

## Audit i greške

Akcije: `product.created`, `product.updated`, `product.published`, `product.moved_to_draft`, `product.archived`, `product.deleted`; `product_variant.created|updated|activated|deactivated|default_changed|deleted`; `inventory.restocked|adjusted|damaged`.

Tipični statusi: `400` nevažeći DTO/UUID/decimal, `401` auth, `403` role, `404` product/variant/category, `409` unique/lifecycle/integrity/stock konflikt. Audit ne sadrži password, token, cookie, hash ili secret.

Swagger UI je na `/api/docs`. Nisu implementirani image upload/mutacije, availability window mutacije, admin UI, dashboard, porudžbine, reserved-stock mutacije niti stvarni admin nalog.
