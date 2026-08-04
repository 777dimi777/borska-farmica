# Admin audit and exports frontend

`/admin/audit` i `/admin/audit/[auditId]` su SUPER_ADMIN-only. Role guard se izvršava pre query-ja, ADMIN dobija bezbedno 403 stanje i nema sidebar link. Viewer je read-only, ima URL filtere i renderuje redigovani metadata JSON kao tekst u `pre` elementu, bez HTML interpretacije ili linkifikovanja. Nepoznata action vrednost ostaje vidljiva kao tehnički string.

`/admin/izvozi` prikazuje inventory CSV za ADMIN, a customers/orders/inventory/audit CSV za SUPER_ADMIN. Download ide kroz admin access token, refresh single-flight i `credentials: include`; response se čita kao Blob i nikada ne parsira ili ponovo generiše. BOM, CRLF i RFC4180 bytes ostaju netaknuti.

Filename helper podržava `filename` i `filename*`, uklanja putanje/kontrolne znakove, ograničava dužinu i forsira `.csv` fallback. Privremeni anchor se uklanja, a object URL se revoke-uje u `finally`. CSV se ne čuva u Query cache-u, storage-u ili globalnom state-u. `422` prikazuje limit od 10.000 redova; ostale greške mapiraju role, rate limit, timeout, network i request ID.

Uspešan SUPER_ADMIN export invalidira samo audit listing. Audit čitanje nema mutation niti frontend tracking.

Vizuelni browser screenshot je u lokalnom Windows okruženju blokiran ACL ograničenjem; component, unit, axe/build fallback se koristi bez tvrdnje da su screenshotovi izvršeni.
