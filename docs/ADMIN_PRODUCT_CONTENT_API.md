# Admin Product Content API

Base path: `/api/v1/admin/products/:productId`. Every route requires an ADMIN or SUPER_ADMIN bearer access token. Invalid UUIDs return 400, missing resources 404, validation errors 400, and direct demotion of a primary image returns 409.

## Availability

- `GET /availability-windows` lists active and inactive windows by `sortOrder`, `createdAt`, then `id`.
- `POST /availability-windows` creates a window.
- `PATCH /availability-windows/:windowId` partially updates a window.
- `DELETE /availability-windows/:windowId` deletes metadata and returns 204.
- `PATCH /availability-windows/reorder` atomically applies unique ID/order pairs (maximum 100).
- `GET /availability-preview?at=<ISO-8601>` evaluates the central public availability engine. Omitted `at` means now.

Fixed example:

```json
{
  "type": "FIXED_DATE_RANGE",
  "startsAt": "2026-06-01",
  "endsAt": "2026-08-31",
  "label": "Dostupno tokom leta",
  "isActive": true,
  "sortOrder": 0
}
```

Fixed values are calendar dates, stored as PostgreSQL `date`, interpreted in the `Europe/Belgrade` business timezone, and both boundaries are inclusive. Start may equal end. Recurring fields must be absent.

Recurring example:

```json
{
  "type": "RECURRING_ANNUAL",
  "startMonth": 12,
  "startDay": 20,
  "endMonth": 1,
  "endDay": 10,
  "label": "Zimska ponuda",
  "sortOrder": 1
}
```

Recurring boundaries are inclusive. Cross-year ranges are supported. The same month/day is one annual day, not a whole year. February 29 is valid; impossible calendar dates are rejected. Fixed fields must be absent.

Active windows may overlap. The first match by `sortOrder`, `createdAt`, and `id` supplies the label and `matchedWindowId`. Deleting the last window does not change the product mode; a SEASONAL product without an active matching window is unavailable.

Preview returns `productId`, mode, evaluated UTC instant, Belgrade business date, availability/stock/purchasable booleans, label and matched ID. `businessReason` explains ALWAYS, MANUAL, fixed/recurring match, no active window, or outside windows; `stockReason` separately explains in-stock, out-of-stock, backorder, or no active variant.

Audit actions: `availability_window.created`, `.updated`, `.activated`, `.deactivated`, `.deleted`, and `.reordered`. No-op PATCH requests do not create audit records.

## Product image metadata

- `GET /images` lists primary first, then `sortOrder`, `createdAt`, and `id`.
- `POST /images` creates URL metadata.
- `PATCH /images/:imageId` updates URL, alt text, primary status, or order.
- `DELETE /images/:imageId` deletes the database record and, for managed images, first deletes the remote asset. External images remain metadata-only deletes.
- `PATCH /images/reorder` atomically changes unique orders and optionally `primaryImageId` (maximum 100 items).

Create example:

```json
{
  "url": "https://example.com/kozji-sir.jpg",
  "altText": "Domaći kozji sir",
  "isPrimary": true,
  "sortOrder": 0
}
```

Only absolute HTTPS URLs are accepted. The API never downloads, probes, or fetches them. Alt text is trimmed plain text of 3–160 characters. `storageKey` is neither accepted nor returned.

The first image becomes primary automatically. Selecting another primary atomically clears the previous one. Directly setting the current primary to false is rejected with 409; select a replacement instead. Deleting a primary promotes the next sorted image in the same transaction; deleting the last leaves no primary. Public product listing/details immediately follow this ordering.

Primary-changing create/update/delete/reorder operations use SERIALIZABLE transactions and retry PostgreSQL/Prisma write conflicts (`P2034`) at most twice. This prevents two normal concurrent requests from leaving two primary rows. A future PostgreSQL partial unique index may provide another database-level safeguard.

Audit actions: `product_image.created`, `.updated`, `.primary_changed`, `.deleted`, and `.reordered`. Audit snapshots exclude credentials and provider secrets.

## Managed upload

Stvarni multipart upload je dokumentovan u [IMAGE_STORAGE_UPLOAD_API.md](IMAGE_STORAGE_UPLOAD_API.md). External HTTPS metadata ostaje podržana. Managed Cloudinary URL/storage polja su server-managed; DELETE uklanja remote asset pre metadata zapisa, uz postojeći primary fallback.
