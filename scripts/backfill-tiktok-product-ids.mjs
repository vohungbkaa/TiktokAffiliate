import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const products = await prisma.product.findMany({
    where: { externalId: { not: null } },
    select: { id: true, externalId: true },
  });

  let updated = 0;
  for (const product of products) {
    if (!product.externalId || product.id === product.externalId) {
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { id: product.externalId },
    });
    updated += 1;
  }

  console.log(`backfilled ${updated} TikTok product id(s)`);
} finally {
  await prisma.$disconnect();
}
