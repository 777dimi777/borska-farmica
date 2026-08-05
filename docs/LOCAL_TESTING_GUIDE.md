# Lokalno testiranje Borske Farmice

## 1. Prvo pokretanje

U korenu projekta pokrenite:

```powershell
docker compose up -d
npm install
npm run prisma:generate --workspace=@borska-farmica/api
npm run prisma:migrate:deploy --workspace=@borska-farmica/api
$env:SEED_DEMO_CATALOG='true'
npm run prisma:seed --workspace=@borska-farmica/api
Remove-Item Env:SEED_DEMO_CATALOG
npm run dev
```

Otvorite:

- prodavnica: `http://localhost:3000`
- API dokumentacija: `http://localhost:4000/api/docs`
- admin prijava: `http://localhost:3000/admin/prijava`

Demo seed je idempotentan: može se pokrenuti više puta. Aktivira se samo kada je
`SEED_DEMO_CATALOG=true`, pa se demo proizvodi neće slučajno dodati u produkciju.
Cene, količine i opisi demo proizvoda služe isključivo za lokalno testiranje i
moraju se proveriti pre stvarne prodaje.

## 2. Provera javnog dela

1. Na početnoj proverite novi logo, veliku fotografiju, tablu dostupnosti,
   kategorije, sedam proizvoda, sezonski kalendar, korake i lokacije.
2. Otvorite `/proizvodi`. Mora biti prikazano sedam proizvoda sa fotografijama.
3. Isprobajte pretragu `mleko`, kategorije, dostupnost, sortiranje i paginaciju.
4. Otvorite svaki proizvod. Proverite fotografiju, cenu, pakovanje, stanje i
   izbor količine.
5. Proverite `/o-nama`, `/preuzimanje` i `/kontakt`, uključujući linkove ka
   mapi i navigaciju nazad ka ponudi.
6. Ponovite proveru na širini 390 px, 768 px i 1440 px u browser DevTools.

## 3. Registracija, korpa i porudžbina

1. Otvorite `/registracija`, napravite nov korisnički nalog i prijavite se.
2. Dodajte najmanje dva različita proizvoda u korpu.
3. Promenite količine, obrišite jednu stavku i proverite zbir.
4. Nastavite na checkout. Bez prijave kupovina mora biti onemogućena.
5. Izaberite preuzimanje na adresi ili Gradsku pijacu Bor.
6. Potvrdite porudžbinu. Jedini način plaćanja mora biti gotovina pri
   preuzimanju.
7. U `/nalog/porudzbine` proverite broj porudžbine, stavke, iznos, lokaciju i
   status `PENDING_CONFIRMATION`.

## 4. Admin provera

1. Prijavite se na `/admin/prijava` razvojnim admin nalogom.
2. U katalogu promenite naziv, cenu ili zalihu jednog demo proizvoda i proverite
   promenu na javnoj stranici nakon osvežavanja.
3. Postavite drugu sliku kao primarnu, promenite redosled i proverite galeriju.
4. U porudžbinama pronađite upravo kreiranu porudžbinu, potvrdite je i pratite
   dozvoljene promene statusa.
5. Proverite da potvrđivanje pravilno pretvara rezervisanu količinu u prodaju.
6. Napravite još jednu porudžbinu i otkažite je. Zaliha mora biti oslobođena,
   bez `SALE` movement-a.
7. Proverite kupce, audit događaje, obaveštenja i CSV izvoze.

## 5. Automatske provere

```powershell
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run check
git diff --check
```

Za E2E testove PostgreSQL kontejner mora biti pokrenut i test baza mora biti
dostupna kroz odgovarajuću `.env` konfiguraciju.

## 6. Ako se proizvodi ne vide

1. Proverite `docker compose ps`.
2. Ponovo pokrenite opt-in demo seed iz prvog odeljka.
3. Proverite da API radi na portu 4000 i frontend na portu 3000.
4. Otvorite DevTools Network i proverite odgovor zahteva ka `/products`.
5. Uradite hard refresh (`Ctrl+Shift+R`), jer se javni katalog kešira približno
   jedan minut.

Kada unesete stvarne proizvode kroz admin, demo proizvode arhivirajte ili
izmenite. Generisane fotografije su razvojni vizuelni materijal; pre javne
objave zamenite ih stvarnim fotografijama ako treba da predstavljaju tačan
izgled proizvoda.
