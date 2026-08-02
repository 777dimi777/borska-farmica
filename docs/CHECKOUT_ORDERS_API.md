# Checkout and Orders API

Base API path is `/api/v1`. The backend supports account-only checkout, two pickup locations, cash payment at pickup, explicit stock reservations, customer order history and an audited admin workflow. Delivery, delivery addresses, fees and online payment do not exist.

## Business rules

- A valid customer access bearer token and the existing `bf_cart` cookie are required for preview and order creation.
- Currency is always RSD. `fee` is `0.00`, so `total` always equals `subtotal`.
- Payment method is only `CASH_ON_PICKUP`; orders remain `UNPAID` until a successful cash completion.
- There is no minimum order amount.
- Admin manually confirms the exact pickup time by telephone.
- Checkout requires physical available stock. `allowBackorder` does not permit order creation until a complete backorder fulfillment workflow exists.
- Product/customer/cart values are re-read server-side; frontend prices and totals are never trusted.

## Pickup locations and dates

`GET /api/v1/checkout/pickup-locations` is public and returns active locations without internal timestamps.

| Code              | Name/address                       | Rule                                                                                     |
| ----------------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| `FARM_HOME`       | Borska Farmica, Nade Dimić 30, Bor | Any calendar day from today through 60 days ahead; immediately below Stovarište Našković |
| `BOR_CITY_MARKET` | Gradska pijaca Bor                 | Saturday only                                                                            |

`allowedWeekday` uses ISO weekday semantics: Monday `1` through Sunday `7`; Saturday is `6`. Dates use `YYYY-MM-DD` and are evaluated in `Europe/Belgrade`. No opening hours, coordinates or unconfirmed exact times are stored.

## Preview

`POST /api/v1/checkout/preview` requires `Authorization: Bearer <customer-access>` and `bf_cart`.

```json
{
  "pickupLocationId": "00000000-0000-4000-8000-000000000000",
  "requestedPickupDate": "2026-08-08",
  "customerNote": "Pozvati pre dolaska"
}
```

The response contains current Decimal prices, line totals, customer profile, pickup details, `exactTimeRequiresConfirmation: true`, cash/RSD summary and item issues. Preview never creates an order, converts the cart, reserves stock or writes an inventory movement.

Typical issue codes include `CART_EMPTY`, `PRODUCT_INACTIVE`, `CATEGORY_INACTIVE`, `VARIANT_INACTIVE`, `PRODUCT_UNAVAILABLE`, `INVALID_QUANTITY`, `INSUFFICIENT_STOCK` and `BACKORDER_CHECKOUT_NOT_SUPPORTED`.

## Atomic order creation and idempotency

`POST /api/v1/checkout/orders` requires customer access, `bf_cart`, a matching allowed Origin when the browser sends Origin, and `Idempotency-Key` containing 16–128 characters from `A-Z`, `a-z`, digits, `.`, `_`, `:` or `-`. The raw key is never stored or returned; only SHA-256 is persisted.

The request body is identical to preview. First success returns HTTP 201 with `idempotentReplay: false`. Repeating the same customer/key/fingerprint returns the same order with HTTP 201 and `idempotentReplay: true`. Reusing the key with a different normalized request returns 409.

A Serializable transaction, conditional parametrized stock updates and bounded retry for Prisma `P2034` or PostgreSQL `40001` write conflicts provide all-or-nothing behavior. The transaction:

1. revalidates active customer, cart, catalog, quantities, availability, pickup/date and physical stock;
2. calculates current Decimal snapshots and totals;
3. atomically increases `reservedQuantity` without changing `stockQuantity`;
4. creates the Order, immutable OrderItems, ACTIVE StockReservations and events;
5. marks the cart `CONVERTED` without deleting cart history.

If any item fails, none of these changes commit. Successful creation clears the `bf_cart` cookie and creates no `SALE` movement. Public order numbers use `BF-YYYYMMDD-XXXXXXXX` with a cryptographically random, uppercase, non-confusing suffix and a unique constraint.

## Customer orders

All routes require customer access and are scoped to the authenticated customer:

- `GET /api/v1/account/orders?page=1&limit=12&status=&sort=newest|oldest`
- `GET /api/v1/account/orders/:orderNumber`
- `POST /api/v1/account/orders/:orderNumber/cancel`

Unknown and other-customer order numbers both return 404. Details expose snapshots and a public-safe timeline, never admin IDs, reservation internals, token hashes or audit metadata.

Customer cancellation is allowed only from `PENDING_CONFIRMATION`. It is idempotent after cancellation. The transaction releases ACTIVE reservations and decreases only `reservedQuantity`; physical stock and InventoryMovement remain unchanged. After confirmation, the customer must contact the farm.

## Admin orders

ADMIN and SUPER_ADMIN bearer tokens can use:

- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/orders/:id`
- `POST /api/v1/admin/orders/:id/transitions`

Listing supports pagination, search by order number/customer name/email/phone, status, payment status, pickup location, requested-pickup and creation date ranges, plus `newest`, `oldest`, `pickup_date` and `status` sorting. Details include snapshots, reservation status, current stock summary, customer profile summary and internal timeline without password/session data.

### Transition matrix

| From                   | Allowed target                  |
| ---------------------- | ------------------------------- |
| `PENDING_CONFIRMATION` | `CONFIRMED`, `CANCELLED`        |
| `CONFIRMED`            | `PREPARING`, `CANCELLED`        |
| `PREPARING`            | `READY_FOR_PICKUP`, `CANCELLED` |
| `READY_FOR_PICKUP`     | `COMPLETED`, `CANCELLED`        |
| `COMPLETED`            | none                            |
| `CANCELLED`            | none                            |

Confirmation requires `confirmedPickupAt`; its Belgrade calendar date must equal `requestedPickupDate`. Completion is allowed only from `READY_FOR_PICKUP` and requires `cashReceived: true`.

Completion atomically decreases both physical `stockQuantity` and `reservedQuantity`, marks reservations `CONSUMED`, creates one negative `SALE` InventoryMovement per reservation with the order number reference, marks payment `PAID`, records events and writes sanitized admin audits. A repeated completion returns 409 and cannot create a second sale.

Admin cancellation requires a reason, releases ACTIVE reservations and changes only `reservedQuantity`. It creates no InventoryMovement and keeps payment `UNPAID`. Completed orders cannot be cancelled; returns/refunds are a future workflow.

Audit actions are `order.confirmed`, `order.preparing`, `order.ready_for_pickup`, `order.completed`, `order.cancelled` and `payment.cash_received`.

## Errors and security

- `400`: malformed/extra DTO fields, missing cart/key, invalid date/key or missing transition-specific fields.
- `401`: missing/wrong customer or admin token type.
- `403`: insufficient admin role.
- `404`: scoped order or pickup resource not found.
- `409`: inactive resource, invalid date/transition, insufficient stock, idempotency mismatch or concurrency conflict.

Customer and admin JWT secrets/guards remain separate. Responses never expose session/token hashes, the idempotency hash/key or internal reservation IDs. Money and quantities use Prisma Decimal and string serialization; critical calculations never use JavaScript floating point.

## Not implemented

Frontend checkout/order screens, email/SMS notifications, returns/refunds, automatic reservation expiration, backorder fulfillment, delivery, online payments and analytics are not implemented.

## Automatic confirmation timeout

New pending orders persist `confirmationExpiresAt` using the configured 24-hour TTL. Customer/admin responses expose that deadline and structured `cancellationReason`. Timeout cancellation releases reservations without changing physical stock; see [MAINTENANCE_JOBS.md](MAINTENANCE_JOBS.md).
