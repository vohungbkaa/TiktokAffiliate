import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function formatCurrency(value: unknown, currency = "VND") {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(Number(value));
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: { orderBy: { capturedAt: "desc" }, take: 10 },
      snapshots: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { crawlJob: true },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{product.name}</h1>
          <p>{product.productUrl}</p>
        </div>
        <Link className="button" href={`/products/${product.id}/edit`}>
          Edit Product
        </Link>
      </div>

      <div className="detail-grid">
        <section className="card">
          <h2>Product Details</h2>
          <div className="kv">
            <div>
              <span>Category</span>
              {formatValue(product.category)}
            </div>
            <div>
              <span>Shop</span>
              {formatValue(product.shopName)}
            </div>
            <div>
              <span>Price</span>
              {formatCurrency(product.price, product.currency)}
            </div>
            <div>
              <span>Commission Rate</span>
              {formatValue(product.commissionRate)}%
            </div>
            <div>
              <span>Commission Amount</span>
              {formatCurrency(product.commissionAmount, product.currency)}
            </div>
            <div>
              <span>Sold Count</span>
              {product.soldCount.toLocaleString()}
            </div>
            <div>
              <span>Rating</span>
              {formatValue(product.rating)}
            </div>
            <div>
              <span>Reviews</span>
              {product.reviewCount.toLocaleString()}
            </div>
            <div>
              <span>Bad Reviews</span>
              {product.badReviewCount.toLocaleString()}
            </div>
            <div>
              <span>Voucher</span>
              {formatValue(product.voucherInfo)}
            </div>
            <div>
              <span>Shipping</span>
              {formatValue(product.shippingNote)}
            </div>
            <div>
              <span>Updated</span>
              {product.updatedAt.toLocaleString()}
            </div>
          </div>
        </section>

        <aside className="card">
          <h2>Crawler Data</h2>
          <p className="muted">{product.snapshots.length} raw snapshots linked.</p>
          <p className="muted">{product.reviews.length} recent reviews linked.</p>
          <div className="crawl-history">
            {product.snapshots.map((snapshot) => (
              <div key={snapshot.id} className="crawl-history-item">
                <strong>{snapshot.crawlJob?.jobType ?? "snapshot"}</strong>
                <span>{snapshot.crawlJob?.status ?? "captured"}</span>
                <span>{snapshot.capturedAt.toLocaleString()}</span>
                <span>{snapshot.contentHash?.slice(0, 12) ?? "-"}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
