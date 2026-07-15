import Link from "next/link";
import { notFound } from "next/navigation";
import { refreshProduct } from "@/app/actions";
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

function renderStars(rating: number | null) {
  if (rating === null) return null;
  const rounded = Math.round(rating);
  return (
    <span className="review-stars" style={{ color: "var(--accent-gold)", letterSpacing: "2px" }}>
      {"★".repeat(rounded) + "☆".repeat(5 - rounded)}
    </span>
  );
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
          <h1 style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {product.name}
            {product.category && <span className="badge" style={{ fontSize: "12px" }}>{product.category}</span>}
          </h1>
          <p className="url-text">{product.productUrl}</p>
        </div>
        <div className="button-group">
          <form action={refreshProduct.bind(null, product.id)}>
            <button type="submit" className="secondary">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: "4px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh Product
            </button>
          </form>
          <Link className="button" href={`/products/${product.id}/edit`}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: "4px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
            </svg>
            Edit Product
          </Link>
        </div>
      </div>

      <div className="detail-grid">
        <section className="card">
          <h2>Product Details</h2>
          <div className="kv">
            <div>
              <span>Category</span>
              <strong className="value">{formatValue(product.category)}</strong>
            </div>
            <div>
              <span>Shop</span>
              <strong className="value">{formatValue(product.shopName)}</strong>
            </div>
            <div>
              <span>Price</span>
              <strong className="value">{formatCurrency(product.price, product.currency)}</strong>
            </div>
            <div>
              <span>Commission Rate</span>
              <strong className="value" style={{ color: "var(--accent-cyan)" }}>
                {formatValue(product.commissionRate)}%
              </strong>
            </div>
            <div>
              <span>Commission Amount</span>
              <strong className="value" style={{ color: "var(--accent-cyan)" }}>
                {formatCurrency(product.commissionAmount, product.currency)}
              </strong>
            </div>
            <div>
              <span>Sold Count</span>
              <strong className="value">{product.soldCount.toLocaleString()}</strong>
            </div>
            <div>
              <span>Rating</span>
              <strong className="value" style={{ color: "var(--accent-gold)" }}>
                {product.rating ? `★ ${product.rating.toFixed(1)}` : "-"}
              </strong>
            </div>
            <div>
              <span>Reviews</span>
              <strong className="value">{product.reviewCount.toLocaleString()}</strong>
            </div>
            <div>
              <span>Bad Reviews</span>
              <strong className="value" style={{ color: product.badReviewCount > 0 ? "var(--danger)" : "var(--success)" }}>
                {product.badReviewCount.toLocaleString()}
              </strong>
            </div>
            <div>
              <span>Voucher</span>
              <strong className="value">{formatValue(product.voucherInfo)}</strong>
            </div>
            <div className="field full" style={{ borderBottom: 0, paddingBottom: 0 }}>
              <span>Shipping Note</span>
              <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "14px" }}>
                {formatValue(product.shippingNote)}
              </p>
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
                <span className={`badge ${snapshot.crawlJob?.status === "completed" ? "success" : "warning"}`} style={{ fontSize: "10px", width: "fit-content" }}>
                  {snapshot.crawlJob?.status ?? "captured"}
                </span>
                <span>{snapshot.capturedAt.toLocaleString()}</span>
                <span className="muted" style={{ fontFamily: "monospace" }}>{snapshot.contentHash?.slice(0, 12) ?? "-"}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="panel reviews-section">
        <div className="panel-header">
          <h2>Recent Customer Reviews</h2>
          <span className="muted">{product.reviews.length} reviews loaded</span>
        </div>
        <div style={{ padding: "24px" }}>
          {product.reviews.length === 0 ? (
            <p className="muted" style={{ margin: 0, textAlign: "center", padding: "20px" }}>No reviews captured yet.</p>
          ) : (
            <div className="reviews-grid">
              {product.reviews.map((review) => (
                <div key={review.id} className={`review-card ${review.isBad ? "bad-review" : ""}`}>
                  <div className="review-header">
                    <span className="review-author">{review.author || "TikTok Customer"}</span>
                    <div className="review-meta">
                      {renderStars(review.rating)}
                      <span className="review-date">
                        {review.reviewedAt ? new Date(review.reviewedAt).toLocaleDateString() : new Date(review.capturedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="review-content">{review.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
