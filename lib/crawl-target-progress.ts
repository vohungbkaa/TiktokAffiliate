import { prisma } from "@/lib/prisma";

export type CrawlTargetProgress = {
  productUrls: string[];
  crawledProductUrls: Set<string>;
  discoveredCount: number;
  crawledCount: number;
};

export async function getCrawlTargetProgress(url: string): Promise<CrawlTargetProgress> {
  const snapshots = await prisma.rawCrawlSnapshot.findMany({
    where: { sourceUrl: url },
    orderBy: { capturedAt: "desc" },
    take: 50,
  });

  const productUrls = [
    ...new Set(
      snapshots.flatMap((snapshot) => {
        const payload = snapshot.payload as { product_links?: unknown };
        return Array.isArray(payload.product_links)
          ? payload.product_links.filter((productUrl): productUrl is string => typeof productUrl === "string")
          : [];
      }),
    ),
  ];

  const products = productUrls.length
    ? await prisma.product.findMany({
        where: { productUrl: { in: productUrls } },
        select: { productUrl: true },
      })
    : [];
  const crawledProductUrls = new Set(products.map((product) => product.productUrl));

  return {
    productUrls,
    crawledProductUrls,
    discoveredCount: productUrls.length,
    crawledCount: crawledProductUrls.size,
  };
}

export function effectiveCrawlTargetStatus(
  storedStatus: string,
  progress: Pick<CrawlTargetProgress, "discoveredCount" | "crawledCount">,
) {
  if (storedStatus === "running") {
    return storedStatus;
  }

  if (progress.discoveredCount > 0 && progress.crawledCount >= progress.discoveredCount) {
    return "completed";
  }

  if (progress.crawledCount > 0) {
    return "partial";
  }

  return storedStatus;
}
