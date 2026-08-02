# Guest Cart API

Base path: `/api/v1/cart`. The cart remains anonymous, while checkout requires a separate authenticated customer account.

## Identity and lifecycle

The first successful mutation without a usable identity creates an ACTIVE cart. The server generates a 256-bit random token, stores only its SHA-256 hash and sends the raw token only in the `bf_cart` HttpOnly cookie. Tokens and hashes never appear in JSON or logs.

GET without a cookie returns an empty response and creates no database row. Random, expired, CONVERTED or otherwise unavailable identities are cleared without revealing whether a hash existed. An expired ACTIVE row is marked EXPIRED and is never reactivated. A later mutation creates a new cart. Mutations use sliding expiration (`now + CART_TTL_DAYS`); GET is read-only.

Cookie defaults: Path `/api/v1`, HttpOnly, 30 days, SameSite=Lax and non-Secure locally. The broader API path allows the same cart identity to reach checkout. Legacy `/api/v1/cart` cookies are reissued and cleared safely. Production must use Secure when SameSite=None. CORS uses the configured frontend origin with credentials and never wildcard. Browser mutations with an Origin header must match `FRONTEND_URL`; missing Origin is permitted for server-to-server and Swagger clients. Production cross-site deployment must confirm the final CSRF architecture.

## Endpoints

- `GET /cart` reads pricing and validation without creating a cart.
- `POST /cart/items` accepts `{"variantId":"uuid","quantity":"0.500"}`.
- `PATCH /cart/items/:itemId` accepts `{"quantity":"0.750"}`.
- `DELETE /cart/items/:itemId` removes one owned item and returns 204.
- `DELETE /cart/items` clears the current cart and returns 204.

Mutation routes have a 30 requests/minute endpoint limit, Origin protection, DTO whitelist and transactions.

## Decimal, pricing and quantity rules

Quantity is a JSON string only, positive, with at most three decimals. Numbers and implicit delete-by-zero are rejected. A quantity is valid when it is at least `minimumPurchaseQuantity` and `quantity - minimum` is an integer Decimal multiple of `purchaseIncrement`. JavaScript floating point is never used.

The first add stores `unitPriceAtAddition`; increasing the same variant preserves that snapshot. Current unit price, line totals and subtotal always use the current database price. Price changes set `priceChanged=true` but do not silently remove the item. Monetary strings have two decimals; quantity strings have three.

The summary exposes `distinctItemCount`, Decimal-string `totalQuantity`, `subtotal` and fixed currency `RSD`. This represents fractional products correctly.

GET validates product/category/variant activity, central business availability, stock/backorder and quantity rules without deleting invalid items. Responses omit stock quantities, reserved quantities, thresholds, storage keys, inventory history and cart credentials.

Errors use clear messages such as `CART_ITEM_UNAVAILABLE`, `CART_INSUFFICIENT_STOCK`, `CART_INVALID_QUANTITY`, `CART_LIMIT_REACHED` and ownership-safe 404 responses.

## Stock and scope

Adding, updating or deleting cart items never changes `stockQuantity`, `reservedQuantity` or InventoryMovement. A cart does not reserve or guarantee stock. Final validation and physical-stock reservation happen only during checkout/order creation.

Implemented separately: customer accounts, account-only checkout, pickup orders and reservations. Not implemented: cart merge, coupons, delivery, online payments, frontend or admin cart views.
