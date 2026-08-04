# Customer orders frontend

`/nalog/porudzbine`, `/nalog/porudzbine/[publicNumber]` i success detail su protected/noindex. Listing koristi backend paginaciju i prikazuje public number, datum u Europe/Belgrade, pickup, item count, status, cash payment status i server total. Empty/unavailable stanja su odvojena.

Detail koristi isključivo immutable order snapshots za naziv, varijantu, pakovanje, quantity, unit price i subtotal. Pickup/customer snapshot, total, confirmation deadline i javni timeline dolaze iz customer detail response-a. Centralni mapper prevodi svih šest order statusa, UNPAID/PAID i četiri cancellation razloga bez prikaza enum stringa.

Cancellation CTA postoji samo za `PENDING_CONFIRMATION` i koristi modal confirmation. Backend ostaje autoritet; success invalidira detail/list. Concurrent admin confirmation (`409`) osvežava detail i ne tvrdi da je order otkazan. Otkazivanje ne vraća stavke u cart i ne menja fizički stock.
