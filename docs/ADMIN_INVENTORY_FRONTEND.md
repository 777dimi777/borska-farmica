# Admin inventory frontend

Tab zaliha bira varijantu i read-only prikazuje fizičko, rezervisano, raspoloživo stanje i low-stock prag. Ručne opcije su samo `RESTOCK`, `ADJUSTMENT` i `DAMAGE`; `SALE` ne postoji u UI-ju jer nastaje isključivo završetkom porudžbine.

Količina je decimalni string sa najviše tri decimale. `ADJUSTMENT` prihvata potpisanu promenu, dok su dopuna i otpis apsolutne količine prema backend ugovoru. Razlog je obavezan za korekciju i otpis. Svaka promena prolazi kroz eksplicitnu potvrdu i nema optimističko stanje.

Istorija movementa prikazuje tip, promenu, stanje posle, razlog, referencu i vreme. Rezervacije se ne menjaju iz ovog ekrana.
