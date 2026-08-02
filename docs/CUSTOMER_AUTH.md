# Customer authentication

Customer authentication is a backend-only foundation for mandatory customer accounts. It is deliberately isolated from admin identity, admin sessions and the guest cart.

## Account contract

- Registration requires `firstName`, `lastName`, `email`, `phone` and `password`.
- Email is trimmed and lowercased. Phone numbers are normalized to E.164 with Serbia (`RS`) as the default region.
- Passwords are hashed with Argon2id and are never returned by the API.
- Customer status is `ACTIVE` or `DISABLED`. Disabled customers cannot log in, refresh or use protected account routes.
- `emailVerifiedAt` is stored for a future verification flow. Verification is not enforced in this pre-production phase because no email provider has been selected.

## Routes

| Method  | Route                             | Authentication                    | Purpose                                                        |
| ------- | --------------------------------- | --------------------------------- | -------------------------------------------------------------- |
| `POST`  | `/api/v1/auth/register`           | public, rate-limited              | Create a customer and session                                  |
| `POST`  | `/api/v1/auth/login`              | public, rate-limited              | Verify email/password and create a session                     |
| `POST`  | `/api/v1/auth/refresh`            | customer refresh cookie           | Rotate the refresh session and issue new tokens                |
| `POST`  | `/api/v1/auth/logout`             | customer refresh cookie, optional | Revoke the current session and clear only its cookie           |
| `GET`   | `/api/v1/account/me`              | customer access bearer            | Return the sanitized customer profile                          |
| `PATCH` | `/api/v1/account/me`              | customer access bearer            | Update first name, last name and/or phone                      |
| `POST`  | `/api/v1/account/change-password` | customer access bearer            | Verify current password, change it and revoke all old sessions |

Unknown DTO fields are rejected. Email cannot be changed through the profile endpoint. Password reset and address management are not part of this phase.

## Tokens, sessions and cookies

Customer access and refresh JWTs use dedicated secrets and TTLs. They are cryptographically separate from admin tokens. Customer access tokens contain `sub`, customer token `type`, and `passwordChangedAt` as an invalidation version; they do not carry an admin role.

Only a SHA-256 hash of a refresh token is stored in `CustomerSession`. Refresh rotation revokes the previous session and creates the successor transactionally. Reuse of an old token is rejected. A password change revokes every existing customer session and returns one fresh session.

The refresh token is sent in the dedicated `bf_customer_refresh` HttpOnly cookie, scoped to `/api/v1/auth`. Logout does not clear or modify the `bf_cart` guest-cart cookie. In production, HTTPS and `CUSTOMER_COOKIE_SECURE=true` are mandatory. If cross-site cookies are needed, `SameSite=None` must be paired with `Secure` and an explicit CSRF strategy.

## Environment

Configure distinct, high-entropy values for:

- `CUSTOMER_JWT_ACCESS_SECRET`
- `CUSTOMER_JWT_REFRESH_SECRET`
- `CUSTOMER_JWT_ACCESS_TTL`
- `CUSTOMER_JWT_REFRESH_TTL`
- `CUSTOMER_REFRESH_COOKIE_NAME`
- `CUSTOMER_COOKIE_SECURE`
- `CUSTOMER_COOKIE_SAME_SITE`

The application rejects customer secrets that equal either admin secret or each other. Never commit real secrets.

## Checkout integration

Checkout and orders are now implemented as a separate backend domain. Purchasing requires both a valid customer access token and the existing `bf_cart` cookie; anonymous checkout is rejected. Customer/admin identities and sessions remain isolated, and cart merge is still not implied.

The implemented flow is cash-only pickup at Nade Dimić 30 or Gradska pijaca Bor on Saturdays, with telephone confirmation by admin, no delivery, no fee and no minimum amount. Atomic reservations and the complete order lifecycle are documented in [CHECKOUT_ORDERS_API.md](CHECKOUT_ORDERS_API.md).

## Verification

DTO unit tests cover normalization and invalid input. Isolated E2E tests cover registration, duplicate accounts, generic login errors, admin/customer token separation, refresh rotation and reuse rejection, sanitized profile access, profile validation, password invalidation, logout cookie isolation, disabled users and rate limiting. Test cleanup is limited to the dedicated customer fixture and does not delete admin, catalog, cart or seed data.
