ALTER TABLE "PickupLocation"
  ADD CONSTRAINT "PickupLocation_allowedWeekday_check" CHECK ("allowedWeekday" IS NULL OR "allowedWeekday" BETWEEN 1 AND 7),
  ADD CONSTRAINT "PickupLocation_sortOrder_check" CHECK ("sortOrder" >= 0);

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_amounts_check" CHECK ("subtotal" >= 0 AND "total" >= 0 AND "total" = "subtotal"),
  ADD CONSTRAINT "Order_currency_check" CHECK ("currency" = 'RSD'),
  ADD CONSTRAINT "Order_idempotency_hash_check" CHECK (char_length("checkoutIdempotencyKeyHash") = 64),
  ADD CONSTRAINT "Order_fingerprint_check" CHECK (char_length("checkoutRequestFingerprint") = 64);

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_values_check" CHECK (
    "packageAmount" > 0 AND "quantity" > 0 AND "unitPrice" > 0 AND "lineTotal" > 0
  );

ALTER TABLE "StockReservation"
  ADD CONSTRAINT "StockReservation_quantity_check" CHECK ("quantity" > 0),
  ADD CONSTRAINT "StockReservation_lifecycle_check" CHECK (
    ("status" = 'ACTIVE' AND "releasedAt" IS NULL AND "consumedAt" IS NULL) OR
    ("status" = 'RELEASED' AND "releasedAt" IS NOT NULL AND "consumedAt" IS NULL) OR
    ("status" = 'CONSUMED' AND "releasedAt" IS NULL AND "consumedAt" IS NOT NULL)
  );

ALTER TABLE "OrderEvent"
  ADD CONSTRAINT "OrderEvent_actor_check" CHECK (
    ("actorType" = 'CUSTOMER' AND "customerId" IS NOT NULL AND "adminId" IS NULL) OR
    ("actorType" = 'ADMIN' AND "adminId" IS NOT NULL AND "customerId" IS NULL) OR
    ("actorType" = 'SYSTEM' AND "adminId" IS NULL AND "customerId" IS NULL)
  );