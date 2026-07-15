-- CreateTable
CREATE TABLE "CrawlTarget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "source" TEXT NOT NULL DEFAULT 'tiktok',
    "maxItems" INTEGER NOT NULL DEFAULT 25,
    "fetcher" TEXT NOT NULL DEFAULT 'dynamic',
    "expandCategoryPages" BOOLEAN NOT NULL DEFAULT true,
    "maxCategoryPages" INTEGER NOT NULL DEFAULT 8,
    "scrollRounds" INTEGER NOT NULL DEFAULT 2,
    "readMoreClicks" INTEGER NOT NULL DEFAULT 1,
    "scrollWaitMs" INTEGER NOT NULL DEFAULT 800,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "discoveredCount" INTEGER NOT NULL DEFAULT 0,
    "crawledCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "lastStartedAt" DATETIME,
    "lastFinishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CrawlTarget_url_key" ON "CrawlTarget"("url");

-- CreateIndex
CREATE INDEX "CrawlTarget_status_idx" ON "CrawlTarget"("status");

-- CreateIndex
CREATE INDEX "CrawlTarget_source_idx" ON "CrawlTarget"("source");
