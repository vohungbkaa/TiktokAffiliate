-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "productUrl" TEXT NOT NULL,
    "category" TEXT,
    "shopName" TEXT,
    "price" DECIMAL,
    "commissionRate" DECIMAL,
    "commissionAmount" DECIMAL,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "badReviewCount" INTEGER NOT NULL DEFAULT 0,
    "voucherInfo" TEXT,
    "shippingNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "author" TEXT,
    "rating" REAL,
    "content" TEXT NOT NULL,
    "isBad" BOOLEAN NOT NULL DEFAULT false,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrawlJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "targetUrl" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RawCrawlSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT,
    "crawlJobId" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RawCrawlSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RawCrawlSnapshot_crawlJobId_fkey" FOREIGN KEY ("crawlJobId") REFERENCES "CrawlJob" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_productUrl_key" ON "Product"("productUrl");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_rating_idx" ON "Product"("rating");

-- CreateIndex
CREATE INDEX "Product_commissionRate_idx" ON "Product"("commissionRate");

-- CreateIndex
CREATE INDEX "Product_soldCount_idx" ON "Product"("soldCount");

-- CreateIndex
CREATE INDEX "ProductReview_productId_idx" ON "ProductReview"("productId");

-- CreateIndex
CREATE INDEX "ProductReview_isBad_idx" ON "ProductReview"("isBad");

-- CreateIndex
CREATE INDEX "CrawlJob_status_idx" ON "CrawlJob"("status");

-- CreateIndex
CREATE INDEX "CrawlJob_source_idx" ON "CrawlJob"("source");

-- CreateIndex
CREATE INDEX "RawCrawlSnapshot_productId_idx" ON "RawCrawlSnapshot"("productId");

-- CreateIndex
CREATE INDEX "RawCrawlSnapshot_crawlJobId_idx" ON "RawCrawlSnapshot"("crawlJobId");
