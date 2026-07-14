import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: "Portable Mini Blender",
      productUrl: "https://shop.example/products/portable-mini-blender",
      category: "Kitchen",
      shopName: "Daily Home",
      price: "24.90",
      commissionRate: "12.50",
      commissionAmount: "3.11",
      soldCount: 18420,
      rating: 4.7,
      reviewCount: 2360,
      badReviewCount: 84,
      voucherInfo: "10% off orders over $30",
      shippingNote: "Free shipping",
    },
    {
      name: "LED Makeup Mirror",
      productUrl: "https://shop.example/products/led-makeup-mirror",
      category: "Beauty",
      shopName: "Glow Lab",
      price: "18.50",
      commissionRate: "15.00",
      commissionAmount: "2.78",
      soldCount: 9320,
      rating: 4.5,
      reviewCount: 1204,
      badReviewCount: 61,
      voucherInfo: "Bundle voucher",
      shippingNote: "Ships in 2 days",
    },
    {
      name: "Pet Hair Remover Roller",
      productUrl: "https://shop.example/products/pet-hair-remover-roller",
      category: "Pets",
      shopName: "Paw Supply",
      price: "11.99",
      commissionRate: "10.00",
      commissionAmount: "1.20",
      soldCount: 22100,
      rating: 4.8,
      reviewCount: 3150,
      badReviewCount: 42,
      voucherInfo: "Buy 2 save 5%",
      shippingNote: "Standard shipping",
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { productUrl: product.productUrl },
      update: product,
      create: product,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
