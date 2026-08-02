CREATE TYPE "OrderCancellationReason" AS ENUM ('CUSTOMER_REQUEST', 'ADMIN_ACTION', 'CONFIRMATION_TIMEOUT', 'UNSPECIFIED');

ALTER TABLE "Order"
  RENAME COLUMN "cancellationReason" TO "cancellationNote";

ALTER TABLE "Order"
  ADD COLUMN "confirmationExpiresAt" TIMESTAMPTZ(3),
  ADD COLUMN "cancellationReason" "OrderCancellationReason";

UPDATE "Order"
SET "confirmationExpiresAt" = "createdAt" + INTERVAL '24 hours'
WHERE "status" = 'PENDING_CONFIRMATION';

UPDATE "Order"
SET "cancellationReason" = 'UNSPECIFIED'
WHERE "status" = 'CANCELLED';

CREATE INDEX "Order_status_confirmationExpiresAt_idx"
ON "Order"("status", "confirmationExpiresAt");