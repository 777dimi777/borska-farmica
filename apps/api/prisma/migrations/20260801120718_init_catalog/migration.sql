-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AvailabilityMode" AS ENUM ('ALWAYS', 'SEASONAL', 'MANUAL');

-- CreateEnum
CREATE TYPE "MeasurementUnit" AS ENUM ('PIECE', 'GRAM', 'KILOGRAM', 'MILLILITER', 'LITER', 'PACKAGE', 'BAG');

-- CreateEnum
CREATE TYPE "AvailabilityWindowType" AS ENUM ('RECURRING_ANNUAL', 'FIXED_DATE_RANGE');

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('INITIAL', 'RESTOCK', 'SALE', 'ORDER_CANCELLATION', 'RETURN', 'ADJUSTMENT', 'DAMAGE');

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "imageUrl" VARCHAR(2048),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "shortDescription" VARCHAR(320),
    "description" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isMainProduct" BOOLEAN NOT NULL DEFAULT false,
    "availabilityMode" "AvailabilityMode" NOT NULL DEFAULT 'ALWAYS',
    "isManuallyAvailable" BOOLEAN NOT NULL DEFAULT true,
    "seoTitle" VARCHAR(70),
    "seoDescription" VARCHAR(170),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "sku" VARCHAR(80) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "compareAtPrice" DECIMAL(12,2),
    "packageAmount" DECIMAL(12,3) NOT NULL,
    "measurementUnit" "MeasurementUnit" NOT NULL,
    "stockQuantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "reservedQuantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "lowStockThreshold" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "minimumPurchaseQuantity" DECIMAL(12,3) NOT NULL DEFAULT 1,
    "purchaseIncrement" DECIMAL(12,3) NOT NULL DEFAULT 1,
    "allowBackorder" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "storageKey" VARCHAR(512),
    "altText" VARCHAR(240) NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityWindow" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "type" "AvailabilityWindowType" NOT NULL,
    "startsAt" DATE,
    "endsAt" DATE,
    "startMonth" INTEGER,
    "startDay" INTEGER,
    "endMonth" INTEGER,
    "endDay" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "publicLabel" VARCHAR(240),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AvailabilityWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "type" "InventoryMovementType" NOT NULL,
    "quantityDelta" DECIMAL(12,3) NOT NULL,
    "resultingStock" DECIMAL(12,3),
    "reason" VARCHAR(500),
    "reference" VARCHAR(160),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_isActive_sortOrder_idx" ON "Category"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_categoryId_status_idx" ON "Product"("categoryId", "status");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_isFeatured_status_idx" ON "Product"("isFeatured", "status");

-- CreateIndex
CREATE INDEX "Product_isMainProduct_status_idx" ON "Product"("isMainProduct", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_isActive_sortOrder_idx" ON "ProductVariant"("productId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductImage_productId_sortOrder_idx" ON "ProductImage"("productId", "sortOrder");

-- CreateIndex
CREATE INDEX "AvailabilityWindow_productId_isActive_idx" ON "AvailabilityWindow"("productId", "isActive");

-- CreateIndex
CREATE INDEX "InventoryMovement_variantId_createdAt_idx" ON "InventoryMovement"("variantId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityWindow" ADD CONSTRAINT "AvailabilityWindow_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddCheckConstraints
ALTER TABLE "Category"
  ADD CONSTRAINT "Category_sortOrder_nonnegative" CHECK ("sortOrder" >= 0);

ALTER TABLE "ProductVariant"
  ADD CONSTRAINT "ProductVariant_price_nonnegative" CHECK ("price" >= 0),
  ADD CONSTRAINT "ProductVariant_compareAtPrice_above_price" CHECK ("compareAtPrice" IS NULL OR "compareAtPrice" > "price"),
  ADD CONSTRAINT "ProductVariant_packageAmount_positive" CHECK ("packageAmount" > 0),
  ADD CONSTRAINT "ProductVariant_stockQuantity_nonnegative" CHECK ("stockQuantity" >= 0),
  ADD CONSTRAINT "ProductVariant_reservedQuantity_nonnegative" CHECK ("reservedQuantity" >= 0),
  ADD CONSTRAINT "ProductVariant_reserved_not_above_stock" CHECK ("reservedQuantity" <= "stockQuantity"),
  ADD CONSTRAINT "ProductVariant_lowStockThreshold_nonnegative" CHECK ("lowStockThreshold" >= 0),
  ADD CONSTRAINT "ProductVariant_minimumPurchaseQuantity_positive" CHECK ("minimumPurchaseQuantity" > 0),
  ADD CONSTRAINT "ProductVariant_purchaseIncrement_positive" CHECK ("purchaseIncrement" > 0),
  ADD CONSTRAINT "ProductVariant_sortOrder_nonnegative" CHECK ("sortOrder" >= 0);

ALTER TABLE "ProductImage"
  ADD CONSTRAINT "ProductImage_sortOrder_nonnegative" CHECK ("sortOrder" >= 0);

ALTER TABLE "AvailabilityWindow"
  ADD CONSTRAINT "AvailabilityWindow_startMonth_range" CHECK ("startMonth" IS NULL OR "startMonth" BETWEEN 1 AND 12),
  ADD CONSTRAINT "AvailabilityWindow_endMonth_range" CHECK ("endMonth" IS NULL OR "endMonth" BETWEEN 1 AND 12),
  ADD CONSTRAINT "AvailabilityWindow_startDay_range" CHECK ("startDay" IS NULL OR "startDay" BETWEEN 1 AND 31),
  ADD CONSTRAINT "AvailabilityWindow_endDay_range" CHECK ("endDay" IS NULL OR "endDay" BETWEEN 1 AND 31),
  ADD CONSTRAINT "AvailabilityWindow_fixed_dates_ordered" CHECK ("startsAt" IS NULL OR "endsAt" IS NULL OR "endsAt" >= "startsAt"),
  ADD CONSTRAINT "AvailabilityWindow_fields_match_type" CHECK (
    ("type" = 'RECURRING_ANNUAL' AND "startsAt" IS NULL AND "endsAt" IS NULL AND "startMonth" IS NOT NULL AND "startDay" IS NOT NULL AND "endMonth" IS NOT NULL AND "endDay" IS NOT NULL)
    OR
    ("type" = 'FIXED_DATE_RANGE' AND "startsAt" IS NOT NULL AND "endsAt" IS NOT NULL AND "startMonth" IS NULL AND "startDay" IS NULL AND "endMonth" IS NULL AND "endDay" IS NULL)
  ),
  ADD CONSTRAINT "AvailabilityWindow_sortOrder_nonnegative" CHECK ("sortOrder" >= 0);

ALTER TABLE "InventoryMovement"
  ADD CONSTRAINT "InventoryMovement_quantityDelta_nonzero" CHECK ("quantityDelta" <> 0),
  ADD CONSTRAINT "InventoryMovement_resultingStock_nonnegative" CHECK ("resultingStock" IS NULL OR "resultingStock" >= 0);