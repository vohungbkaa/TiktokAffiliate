-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CrawlJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "jobType" TEXT NOT NULL DEFAULT 'product_detail',
    "status" TEXT NOT NULL DEFAULT 'queued',
    "targetUrl" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "finishedAt" DATETIME,
    "error" TEXT,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CrawlJob" ("completedAt", "createdAt", "error", "id", "source", "startedAt", "status", "targetUrl", "updatedAt") SELECT "completedAt", "createdAt", "error", "id", "source", "startedAt", "status", "targetUrl", "updatedAt" FROM "CrawlJob";
DROP TABLE "CrawlJob";
ALTER TABLE "new_CrawlJob" RENAME TO "CrawlJob";
CREATE INDEX "CrawlJob_status_idx" ON "CrawlJob"("status");
CREATE INDEX "CrawlJob_source_idx" ON "CrawlJob"("source");
CREATE INDEX "CrawlJob_jobType_idx" ON "CrawlJob"("jobType");
CREATE INDEX "CrawlJob_targetUrl_idx" ON "CrawlJob"("targetUrl");
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "productUrl" TEXT NOT NULL,
    "externalId" TEXT,
    "imageUrl" TEXT,
    "category" TEXT,
    "shopName" TEXT,
    "shopUrl" TEXT,
    "price" DECIMAL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "commissionRate" DECIMAL,
    "commissionAmount" DECIMAL,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "badReviewCount" INTEGER NOT NULL DEFAULT 0,
    "shopRating" REAL,
    "voucherInfo" TEXT,
    "shippingNote" TEXT,
    "rawSource" TEXT,
    "lastCrawledAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("badReviewCount", "category", "commissionAmount", "commissionRate", "createdAt", "id", "name", "price", "productUrl", "rating", "reviewCount", "shippingNote", "shopName", "soldCount", "updatedAt", "voucherInfo") SELECT "badReviewCount", "category", "commissionAmount", "commissionRate", "createdAt", "id", "name", "price", "productUrl", "rating", "reviewCount", "shippingNote", "shopName", "soldCount", "updatedAt", "voucherInfo" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_productUrl_key" ON "Product"("productUrl");
CREATE INDEX "Product_category_idx" ON "Product"("category");
CREATE INDEX "Product_rating_idx" ON "Product"("rating");
CREATE INDEX "Product_commissionRate_idx" ON "Product"("commissionRate");
CREATE INDEX "Product_soldCount_idx" ON "Product"("soldCount");
CREATE TABLE "new_ProductReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "author" TEXT,
    "rating" REAL,
    "content" TEXT NOT NULL,
    "isBad" BOOLEAN NOT NULL DEFAULT false,
    "hasImage" BOOLEAN NOT NULL DEFAULT false,
    "hasVideo" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "reviewedAt" DATETIME,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProductReview" ("author", "capturedAt", "content", "createdAt", "id", "isBad", "productId", "rating") SELECT "author", "capturedAt", "content", "createdAt", "id", "isBad", "productId", "rating" FROM "ProductReview";
DROP TABLE "ProductReview";
ALTER TABLE "new_ProductReview" RENAME TO "ProductReview";
CREATE INDEX "ProductReview_productId_idx" ON "ProductReview"("productId");
CREATE INDEX "ProductReview_isBad_idx" ON "ProductReview"("isBad");
CREATE TABLE "new_RawCrawlSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT,
    "crawlJobId" TEXT,
    "source" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "targetUrl" TEXT,
    "contentHash" TEXT,
    "payload" JSONB NOT NULL,
    "rawPayload" JSONB,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RawCrawlSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RawCrawlSnapshot_crawlJobId_fkey" FOREIGN KEY ("crawlJobId") REFERENCES "CrawlJob" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RawCrawlSnapshot" ("crawlJobId", "createdAt", "id", "payload", "productId", "sourceUrl") SELECT "crawlJobId", "createdAt", "id", "payload", "productId", "sourceUrl" FROM "RawCrawlSnapshot";
DROP TABLE "RawCrawlSnapshot";
ALTER TABLE "new_RawCrawlSnapshot" RENAME TO "RawCrawlSnapshot";
CREATE INDEX "RawCrawlSnapshot_productId_idx" ON "RawCrawlSnapshot"("productId");
CREATE INDEX "RawCrawlSnapshot_crawlJobId_idx" ON "RawCrawlSnapshot"("crawlJobId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
