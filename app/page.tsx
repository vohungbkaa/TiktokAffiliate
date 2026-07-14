import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductTable } from "@/components/ProductTable";

export default async function DashboardPage() {
  const [productCount, reviewCount, crawlJobCount, latestProducts] = await Promise.all([
    prisma.product.count(),
    prisma.productReview.count(),
    prisma.crawlJob.count(),
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const aggregate = await prisma.product.aggregate({
    _avg: { rating: true, commissionRate: true },
    _sum: { soldCount: true },
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Manual product database, CSV import, and crawler foundation.</p>
        </div>
        <Link className="button" href="/products/new">
          Add Product
        </Link>
      </div>

      <section className="stats-grid">
        <div className="stat">
          <span>Products</span>
          <strong>{productCount.toLocaleString()}</strong>
        </div>
        <div className="stat">
          <span>Total Sold</span>
          <strong>{(aggregate._sum.soldCount ?? 0).toLocaleString()}</strong>
        </div>
        <div className="stat">
          <span>Avg Rating</span>
          <strong>{aggregate._avg.rating?.toFixed(2) ?? "-"}</strong>
        </div>
        <div className="stat">
          <span>Crawl Jobs</span>
          <strong>{crawlJobCount.toLocaleString()}</strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Recent Products</h2>
          <span className="muted">{reviewCount.toLocaleString()} reviews captured</span>
        </div>
        <ProductTable products={latestProducts} />
      </section>
    </>
  );
}
