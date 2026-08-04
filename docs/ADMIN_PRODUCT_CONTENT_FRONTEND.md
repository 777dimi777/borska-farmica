# Admin product content frontend

Varijante čuvaju cenu sa najviše dve decimale, a količine sa najviše tri; vrednosti se šalju kao stringovi. Forma pokriva SKU, pakovanje, jedinicu, minimum, korak, low-stock prag, default/active i backorder pravila. Fizičko brisanje varijante vidi samo SUPER_ADMIN.

Slike podržavaju external HTTPS metadata i stvarni multipart upload. Browser pre slanja dozvoljava JPEG, PNG i WebP do 8 MiB, alt tekst 3–160 znakova i nikada ne šalje niti prikazuje `storageKey`. `FormData` se šalje bez ručnog `Content-Type`, tako da browser postavlja boundary. Primarna slika, redosled i brisanje koriste server odgovor; managed delete može ukloniti i cloud resurs.

Dostupnost prikazuje trenutni server preview, poslovni datum i odvojene business/stock razloge. Podržani su inkluzivni fiksni datumi i godišnji periodi koji mogu preći Novu godinu. Redosled određuje prvu odgovarajuću javnu oznaku. SEASONAL proizvod bez aktivnog podudaranja nije dostupan.
