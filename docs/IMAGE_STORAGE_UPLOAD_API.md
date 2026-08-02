# Image Storage and Upload API

## Arhitektura

Product domen zavisi od internog `ImageStorageProvider` interfejsa, ne od Cloudinary tipova. Produkcioni `CloudinaryImageStorageProvider` centralizuje SDK konfiguraciju, upload i idempotentni delete. Kasniji R2/S3 provider može zameniti implementaciju bez promene product domena.

## Konfiguracija

`IMAGE_UPLOAD_ENABLED=false` bezbedno isključuje upload; ostatak API-ja i readiness rade normalno, a upload vraća 503. Kada je true, Joi zahteva `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` i `CLOUDINARY_API_SECRET`.

Ostale promenljive: `IMAGE_STORAGE_PROVIDER=cloudinary`, `CLOUDINARY_FOLDER=borska-farmica`, `IMAGE_UPLOAD_MAX_BYTES=8388608`, input width/height 6000, output dimension 2400 i `IMAGE_MAX_PER_PRODUCT=12`. Deployment administrator ručno unosi tri Cloudinary credential vrednosti; secret se nikada ne šalje browseru ili Swaggeru.

## Endpoint

`POST /api/v1/admin/products/:productId/images/upload` prima multipart `file`, obavezni `altText` i opcioni `isPrimary`. ADMIN i SUPER_ADMIN koriste admin bearer JWT. Limit je 15 pokušaja/minut i jedna datoteka do 8 MiB.

Dozvoljeni su stvarni JPEG, PNG i WebP. Magic bytes moraju odgovarati MIME-u. SVG, GIF/animacija, HTML/PDF, prazni, nečitljivi, preveliki ili dimenziono/pixel preveliki ulazi se odbijaju kontrolisano.

Sharp dekodira sa pixel limitom, proverava dimenzije, primenjuje EXIF orientation, ne uvećava, zadržava odnos stranica, smanjuje unutar 2400×2400 i emituje WebP quality 85. Pošto se ne koristi `withMetadata`, EXIF/GPS se ne prenose. Original ostaje samo u bounded memoriji i ne upisuje se na disk.

Folder i UUID public ID generiše server: `borska-farmica/products/{productId}`. Cloudinary koristi image resource, HTTPS secure URL i overwrite=false.

## Metadata i response

Managed zapis čuva provider, interni public ID, canonical HTTPS URL, width, height, format i byte size. External URL metadata ostaje kompatibilna i unmanaged. Admin response daje `storageProvider` i metadata, ali nikada storage key; public response daje URL, alt text, primary, width/height i stabilan redosled bez provider detalja.

Managed URL se ne može menjati običnim PATCH-em. Alt text, primary i order ostaju promenljivi. Prva slika je primary; eksplicitni primary atomski demotira prethodnu. Nova slika ide na kraj. Serializable transakcija/retry štiti primary i konkurentni limit od 12.

## Failure i delete

Ako cloud upload uspe, a DB upis/limit ne uspe, servis pokušava kompenzacioni remote delete i vraća originalnu grešku. Cleanup je best-effort jer cloud i PostgreSQL nemaju zajedničku transakciju.

External delete briše samo DB metadata. Managed delete prvo poziva provider koristeći key isključivo iz baze; not-found je uspeh, provider failure zaustavlja DB brisanje. Potom postojeća bounded serializable DB retry logika briše metadata i stabilno bira sledeći primary. Mogući parcijalni slučaj remote-success/ponovljeni trajni DB-failure je dokumentovano ograničenje bez queue/worker infrastrukture.

Audit akcije uključuju `product_image.uploaded`, updated, primary_changed, reordered i deleted. Upload audit sadrži samo bezbedne dimenzije/format/byte size/provider/primary podatke, bez buffera, credentials, signature ili storage key-a.

Automatski testovi koriste lokalno Sharp procesiranje i ne zahtevaju niti pozivaju pravi Cloudinary nalog.
