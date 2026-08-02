ALTER TABLE "ProductImage"
  ADD COLUMN "storageProvider" VARCHAR(40),
  ADD COLUMN "width" INTEGER,
  ADD COLUMN "height" INTEGER,
  ADD COLUMN "format" VARCHAR(20),
  ADD COLUMN "byteSize" INTEGER;

CREATE UNIQUE INDEX "ProductImage_storageProvider_storageKey_key"
  ON "ProductImage"("storageProvider", "storageKey");

ALTER TABLE "ProductImage"
  ADD CONSTRAINT "ProductImage_managed_metadata_check" CHECK (
    ("storageProvider" IS NULL AND "storageKey" IS NULL AND "width" IS NULL AND "height" IS NULL AND "format" IS NULL AND "byteSize" IS NULL)
    OR
    ("storageProvider" IS NOT NULL AND "storageKey" IS NOT NULL AND "width" > 0 AND "height" > 0 AND "format" IS NOT NULL AND "byteSize" > 0)
  );