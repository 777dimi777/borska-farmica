# Admin Category API

Zaštićeni API za upravljanje kategorijama koristi admin access JWT (`Authorization: Bearer <token>`). Role `ADMIN` i `SUPER_ADMIN` mogu da čitaju, kreiraju, menjaju, aktiviraju/deaktiviraju i menjaju redosled; samo `SUPER_ADMIN` može trajno da briše.

## Rute

| Metod    | Ruta                               | Uloga       | Namena                                                    |
| -------- | ---------------------------------- | ----------- | --------------------------------------------------------- |
| `GET`    | `/api/v1/admin/categories`         | ADMIN+      | Listing sa paginacijom, pretragom, statusom i sortiranjem |
| `GET`    | `/api/v1/admin/categories/:id`     | ADMIN+      | Detalj i broj proizvoda po statusu                        |
| `POST`   | `/api/v1/admin/categories`         | ADMIN+      | Kreiranje kategorije                                      |
| `PATCH`  | `/api/v1/admin/categories/:id`     | ADMIN+      | Parcijalna izmena ili aktivacija/deaktivacija             |
| `PATCH`  | `/api/v1/admin/categories/reorder` | ADMIN+      | Atomska promena redosleda                                 |
| `DELETE` | `/api/v1/admin/categories/:id`     | SUPER_ADMIN | Trajno brisanje prazne kategorije                         |

Listing prihvata `page`, `limit`, `search`, `status=all|active|inactive` i `sort=sort_order|name_asc|name_desc|newest|oldest`. Odgovor sadrži `productCount`, `activeProductCount` i standardne pagination metapodatke.

## Pravila

- `name` je obavezan pri kreiranju (2–80 znakova); `slug` se generiše iz imena kada nije poslat i normalizuje srpska slova.
- Ime i slug su jedinstveni; konflikt vraća `409`.
- Prazan PATCH, nepoznata polja, nevažeći UUID i neispravne vrednosti vraćaju `400`.
- Deaktivirana kategorija nestaje sa javnog API-ja, ali njeni proizvodi i podaci ostaju sačuvani.
- Kategorija koja sadrži makar jedan proizvod ne može trajno da se obriše; prvo je deaktivirajte. Pokušaj vraća `409`.
- Reorder prima 1–100 jedinstvenih `{ id, sortOrder }` stavki i izvršava se transakciono.

## Audit

Svaka stvarna mutacija u istoj DB transakciji upisuje append-only `AdminAuditLog`: admin ID, akciju (`category.created`, `category.updated`, `category.activated`, `category.deactivated`, `category.reordered`, `category.deleted`), resource ID gde postoji, promene, IP, user-agent i vreme. Lozinke i tokeni se nikada ne upisuju.

Swagger UI je na `http://localhost:4000/api/docs`. Autentifikacija i dobijanje access tokena opisani su u [ADMIN_AUTH.md](ADMIN_AUTH.md).
