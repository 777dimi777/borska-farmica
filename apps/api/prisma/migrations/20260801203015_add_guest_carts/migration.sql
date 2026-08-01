-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'CONVERTED', 'EXPIRED', 'ABANDONED');

-- CreateTable
CREATE TABLE "Cart" (
    "id" UUID NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "status" "CartStatus" NOT NULL DEFAULT 'ACTIVE',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'RSD',
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "convertedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" UUID NOT NULL,
    "cartId" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "unitPriceAtAddition" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_tokenHash_key" ON "Cart"("tokenHash");

-- CreateIndex
CREATE INDEX "Cart_status_expiresAt_idx" ON "Cart"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "CartItem_cartId_createdAt_idx" ON "CartItem"("cartId", "createdAt");

-- CreateIndex
CREATE INDEX "CartItem_variantId_idx" ON "CartItem"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_variantId_key" ON "CartItem"("cartId", "variantId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
