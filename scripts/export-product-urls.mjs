import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function readArg(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1 || index + 1 >= process.argv.length) {
    return fallback;
  }
  return process.argv[index + 1];
}

const outputFile = readArg("--output", "data/product-detail-urls.txt");
const source = readArg("--source", "tiktok");

try {
  const products = await prisma.product.findMany({
    where: {
      productUrl: { not: "" },
      ...(source === "all" ? {} : { rawSource: source }),
    },
    select: { productUrl: true },
    orderBy: { updatedAt: "desc" },
  });

  const urls = [...new Set(products.map((product) => product.productUrl).filter(Boolean))];
  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, urls.join("\n") + (urls.length ? "\n" : ""), "utf8");
  console.log(`exported ${urls.length} product URLs to ${outputFile}`);
} finally {
  await prisma.$disconnect();
}
