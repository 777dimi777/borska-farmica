# Frontend arhitektura

Storefront koristi Next.js 16 App Router u `apps/web/src/app`. Homepage i informativne stranice su Server Components; jedini Client Components u ovoj celini su mobile navigation i globalni error prikaz. Struktura je podeljena na `components/ui`, `components/layout`, `components/storefront`, `lib/api`, `lib/config`, `lib/formatters`, `lib/seo` i `types`.

## Rute

- `/` Ã¢â‚¬â€ homepage sa server-side public catalog preview podacima
- `/o-nama`, `/preuzimanje`, `/kontakt` Ã¢â‚¬â€ zavrÃ…Â¡ene informativne stranice
- `/robots.txt`, `/sitemap.xml` Ã¢â‚¬â€ SEO sistemske rute

SledeÃ„â€¡a celina dodaje kompletan katalog, filter/search/sort/pagination i product detail. Korpa, customer auth/checkout i admin ostaju kasnije faze.

## API i konfiguracija

`API_INTERNAL_URL` je server-only URL. `NEXT_PUBLIC_API_URL` je buduÃ„â€¡i browser URL, a `NEXT_PUBLIC_SITE_URL` je canonical osnova. Sva tri imaju dokumentovan lokalni fallback; eksplicitni production localhost URL se odbija. Deployment mora postaviti javni site URL. Typed client pokriva `/categories` i `/products`, ima 5 s timeout, kontrolisano mapiranje greÃ…Â¡aka i Next revalidation od 60 s. Homepage pokuÃ…Â¡ava featured, zatim main, pa najnovije proizvode, najviÃ…Â¡e Ã„Âetiri. Build ne zahteva aktivan API; unavailable i empty stanja ne prikazuju raw greÃ…Â¡ke niti fake podatke.

Javni novac ostaje string sa dve decimale, stock se prikazuje samo kroz `currentlyAvailable`, `inStock` i `purchasable`, a frontend tip nema storage key. Server Components su podrazumevani; globalni client state i TanStack Query se uvode tek uz stvarne mutations/auth potrebe.

## Images, greÃ…Â¡ke i testovi

`next/image` prihvata samo HTTPS `res.cloudinary.com`; Ã„Âuva dimensions i koristi responsive sizes. NedostajuÃ„â€¡a slika dobija brendirani CSS fallback. Globalni loading/error/not-found UI ne otkriva API URL, stack ili internu poruku.

Vitest, jsdom, React Testing Library, jest-dom i vitest-axe rade bez mreÃ…Â¾e/API-ja. Pokriveni su env/client mapper, currency, Brand, header/mobile menu, footer, product/empty states, JSON-LD i osnovni axe pregled. BuduÃ„â€¡i cart/auth client state treba ostaviti blizu pripadajuÃ„â€¡ih feature-a, ne praviti jedan globalni store bez potrebe.

## Dependency revizija

Next/React su ciljano podignuti sa 16.2.12/19.2.4 na 16.3.0/19.2.8, Äime su uklonjeni ranije prijavljeni Next tranzitivni `postcss` i `sharp` high nalazi. I production-only i puni frontend `npm audit` sada prijavljuju 0 ranjivosti. Major tooling nadogradnje iz `npm outdated` nisu primenjene.

## Catalog i product detail

Katalog koristi URL search params kao jedini state i ostaje Server Component; samo mobile dialog, galerija i variant selector koriste client state. Product metadata i page dele request-scoped cached fetch. Detaljni query/error/cache/SEO contract dokumentovan je u [CATALOG_FRONTEND](CATALOG_FRONTEND.md).

## Customer auth i cart

Client provider sloj dodaje TanStack Query, memory-only customer auth i anonymous HttpOnly-cookie cart bez promene SSR kataloga. Detalji su u [CUSTOMER_AUTH_FRONTEND](CUSTOMER_AUTH_FRONTEND.md) i [CART_FRONTEND](CART_FRONTEND.md).

## Checkout i customer orders

Protected checkout koristi obavezan server preview i sessionStorage idempotency metapodatke bez PII. Customer order rute koriste javni broj i snapshots. Detalji: [CHECKOUT_FRONTEND](CHECKOUT_FRONTEND.md) i [CUSTOMER_ORDERS_FRONTEND](CUSTOMER_ORDERS_FRONTEND.md).
