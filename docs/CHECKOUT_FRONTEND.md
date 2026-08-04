# Checkout frontend

`/checkout` je customer-protected, noindex ruta. Auth bootstrap prikazuje stabilno stanje, anonymous customer ide na `/prijava?returnTo=/checkout`, a postojeći memory-only access token i single-flight 401 refresh tok ostaju jedini customer auth mehanizam. Korpa mora postojati i sve stavke moraju biti validne.

Checkout je jedna kontrolisana stranica: nalog/korpa, pickup i datum, customer note do 500 karaktera, cash-only objašnjenje, obavezan backend preview i finalni submit. Pickup opcije dolaze isključivo iz `/checkout/pickup-locations`; kuća podržava datum do 60 dana, pijaca subotu, a backend je konačni validator. Preview prikazuje server cene, totals i issue kodove; frontend ne računa autoritativan total.

Order creation šalje `Idempotency-Key`, nema automatski retry i blokira double submit. SHA-256 fingerprint sadrži sortirane cart item/variant identifikatore, quantities, pickup ID, datum i digest note-a. Session storage sadrži samo fingerprint, random UUID key i vreme nastanka — nikada token, PII, note, cenu ili payload. Isti fingerprint i neizvestan network/timeout koriste isti key; promenjen payload dobija novi; potvrđen success briše zapis.

Success invalidira cart i customer order queries, osvežava badge i vodi na `/porudzbina-uspesna/[publicNumber]`. Ruta učitava stvarni customer-scoped detail i radi posle refresh-a. Frontend ne menja stock/reserved i ne implementira dostavu, online plaćanje ili admin potvrdu.
