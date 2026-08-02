ALTER TABLE "OrderItem"
  ADD COLUMN "categoryId" UUID,
  ADD COLUMN "categoryName" VARCHAR(100),
  ADD COLUMN "categorySlug" VARCHAR(120);

UPDATE "OrderItem" AS item
SET
  "categoryId" = product."categoryId",
  "categoryName" = category."name",
  "categorySlug" = category."slug"
FROM "Product" AS product
JOIN "Category" AS category ON category."id" = product."categoryId"
WHERE product."id" = item."productId";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "OrderItem"
    WHERE "categoryId" IS NULL OR "categoryName" IS NULL OR "categorySlug" IS NULL
  ) THEN
    RAISE EXCEPTION 'OrderItem category snapshot backfill was incomplete';
  END IF;
END $$;

ALTER TABLE "OrderItem"
  ALTER COLUMN "categoryId" SET NOT NULL,
  ALTER COLUMN "categoryName" SET NOT NULL,
  ALTER COLUMN "categorySlug" SET NOT NULL;

CREATE INDEX "Order_status_completedAt_idx" ON "Order"("status", "completedAt");
CREATE INDEX "Order_paymentStatus_completedAt_idx" ON "Order"("paymentStatus", "completedAt");
CREATE INDEX "OrderItem_categoryId_idx" ON "OrderItem"("categoryId");
