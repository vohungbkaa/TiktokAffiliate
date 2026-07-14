import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleProductUrlPrefixes = [
  "https://shop.example/products/",
  "http://127.0.0.1:8765/",
  "http://localhost:8765/",
];

const sampleSources = ["fixture"];

async function main() {
  const sampleProducts = await prisma.product.findMany({
    where: {
      OR: [
        ...sampleProductUrlPrefixes.map((prefix) => ({
          productUrl: { startsWith: prefix },
        })),
        ...sampleSources.map((source) => ({ rawSource: source })),
      ],
    },
    select: { id: true },
  });

  const productIds = sampleProducts.map((product) => product.id);

  const deletedReviews = productIds.length
    ? await prisma.productReview.deleteMany({ where: { productId: { in: productIds } } })
    : { count: 0 };
  const deletedSnapshots = await prisma.rawCrawlSnapshot.deleteMany({
    where: {
      OR: [
        ...(productIds.length ? [{ productId: { in: productIds } }] : []),
        ...sampleSources.map((source) => ({ source })),
        ...sampleProductUrlPrefixes.map((prefix) => ({ sourceUrl: { startsWith: prefix } })),
      ],
    },
  });
  const deletedJobs = await prisma.crawlJob.deleteMany({
    where: {
      OR: [
        ...sampleSources.map((source) => ({ source })),
        ...sampleProductUrlPrefixes.map((prefix) => ({ targetUrl: { startsWith: prefix } })),
      ],
    },
  });
  const deletedProducts = productIds.length
    ? await prisma.product.deleteMany({ where: { id: { in: productIds } } })
    : { count: 0 };

  console.log(
    JSON.stringify(
      {
        deletedProducts: deletedProducts.count,
        deletedReviews: deletedReviews.count,
        deletedSnapshots: deletedSnapshots.count,
        deletedJobs: deletedJobs.count,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
