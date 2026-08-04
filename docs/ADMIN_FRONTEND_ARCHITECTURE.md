# Admin frontend architecture

Admin workspace koristi odvojeni memorijski access token, HttpOnly refresh cookie i sopstveni React Query cache. Javni customer provider i storefront chrome se ne pokreću na `/admin` rutama. Protected shell podržava Dashboard, Porudžbine i funkcionalni link ka prodavnici; ostali CRUD linkovi se ne prikazuju pre implementacije.

Dashboard arhitektura je dokumentovana u [ADMIN_DASHBOARD_FRONTEND.md](ADMIN_DASHBOARD_FRONTEND.md), order workflow u [ADMIN_ORDERS_FRONTEND.md](ADMIN_ORDERS_FRONTEND.md), a auth granice u [ADMIN_FRONTEND.md](ADMIN_FRONTEND.md).

## Catalog workspace

Admin catalog deli izolovani auth/query sloj sa dashboardom i porudžbinama. Njegov cache namespace je dmin-catalog; listing state je u URL-u, a product editor koristi stabilni ab parametar. Multipart je jedini poseban transport i ne postavlja ručni content type.
