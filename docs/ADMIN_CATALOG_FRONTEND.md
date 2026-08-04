# Admin catalog frontend

Admin katalog koristi izolovanu admin sesiju i TanStack Query cache pod `admin-catalog` ključem. Rute su `/admin/kategorije`, `/admin/kategorije/nova`, `/admin/kategorije/[categoryId]`, `/admin/proizvodi`, `/admin/proizvodi/novi` i `/admin/proizvodi/[productId]`.

Listing filteri i paginacija žive u URL-u. Kategorije imaju create/edit, aktivaciju, pristupačne kontrole redosleda i SUPER_ADMIN-only fizičko brisanje. Proizvodi imaju listing, draft create tok, osnovni sadržaj, eksplicitne lifecycle potvrde i SUPER_ADMIN-only fizičko brisanje. Mutacije se ne prikazuju optimistički; nakon uspeha invalidira se catalog cache.

Product editor koristi `tab=osnovno|varijante|slike|dostupnost|zalihe`. ADMIN i SUPER_ADMIN mogu svakodnevno uređivati sadržaj. Samo SUPER_ADMIN vidi fizičko brisanje kategorije, proizvoda i varijante; backend ostaje konačna authorization granica.

Stanja učitavanja, praznog rezultata, API greške, konflikta i zabrane imaju tekstualni status. Mobilni prikaz koristi horizontalno skrolujuće tabele i responsivne forme. Browser vizuelna provera u ovom razvoju nije mogla da se pokrene zbog lokalnog Windows ACL ograničenja; build, lint, typecheck i component/unit fallback ostaju obavezne provere.
