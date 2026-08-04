# Customer auth frontend

Rute su `/prijava`, `/registracija` i zaštićeni `/nalog`; sve imaju `noindex, nofollow`. Browser API koristi `NEXT_PUBLIC_API_URL`, `credentials: include`, bezbedno mapiranje statusa i opcioni customer Bearer token. Access token postoji samo u memoriji aktivne kartice. Refresh ostaje u `bf_customer_refresh` HttpOnly cookie-ju i frontend ga nikada ne čita.

Auth provider pri mount-u radi refresh pa `/account/me`. Odsustvo cookie-ja znači anonymous stanje bez crvene greške. Refresh je single-flight po kartici, paralelni zahtevi čekaju isti Promise, a zaštićeni zahtev posle 401 sme samo jedan refresh i jedan retry. Nema storage persistence-a, BroadcastChannel tokena niti mešanja sa admin identitetom. Multi-tab kartice imaju odvojene access tokene; server cookie rotacija ostaje autoritativna.

Login prikazuje generičku 401 poruku i posebno 429 stanje. Registracija šalje samo backend DTO polja i po uspehu koristi vraćenu sesiju. `returnTo` prihvata samo jednu lokalnu `/` putanju; protokol, `//`, encoded external i control karakteri padaju na `/nalog`. Profil menja samo ime, prezime i telefon. Promena lozinke opoziva postojeći frontend state i zahteva novu prijavu. Logout je idempotentan, čisti memory state/query podatke i ne dira cart cookie.
