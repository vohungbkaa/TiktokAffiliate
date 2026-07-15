-- Product.id is now application-assigned. For TikTok products, it must be
-- the TikTok product id stored in Product.externalId.
CREATE UNIQUE INDEX "Product_externalId_key" ON "Product"("externalId");
