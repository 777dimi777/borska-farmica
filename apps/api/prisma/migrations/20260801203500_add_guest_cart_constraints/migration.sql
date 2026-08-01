ALTER TABLE "Cart"
  ADD CONSTRAINT "Cart_currency_check" CHECK ("currency" = 'RSD'),
  ADD CONSTRAINT "Cart_active_expiry_check" CHECK ("status" <> 'ACTIVE' OR "expiresAt" IS NOT NULL),
  ADD CONSTRAINT "Cart_converted_at_check" CHECK ("status" <> 'CONVERTED' OR "convertedAt" IS NOT NULL);

ALTER TABLE "CartItem"
  ADD CONSTRAINT "CartItem_quantity_positive_check" CHECK ("quantity" > 0),
  ADD CONSTRAINT "CartItem_unit_price_nonnegative_check" CHECK ("unitPriceAtAddition" >= 0);