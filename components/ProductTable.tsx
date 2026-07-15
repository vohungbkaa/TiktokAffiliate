import Link from "next/link";
import type { Product } from "@prisma/client";

type ProductTableProps = {
  products: Product[];
};

function formatCurrency(value: unknown, currency = "VND") {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(Number(value));
}

function formatPercent(value: unknown) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${Number(value).toFixed(2)}%`;
}

export function ProductTable({ products }: ProductTableProps) {
  if (products.length === 0) {
    return <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No products yet.</div>;
  }

  return (
    <div className="panel">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Category</th>
              <th>Shop</th>
              <th>Price</th>
              <th>Commission</th>
              <th>Units Sold</th>
              <th>Rating</th>
              <th>Customer Feedback</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="product-cell">
                    <div className="product-img-wrapper">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="product-img"
                        />
                      ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--text-muted)">
                          <path d="M12.53.02C13.84 0 15 1.04 15.02 2.35c.02.6-.19 1.18-.58 1.63a7.84 7.84 0 0 0-.29 3.01c.21 1.33 1.12 2.45 2.41 2.95.53.2 1.03.54 1.45.98.53.56.84 1.3.84 2.11 0 .97-.43 1.83-1.12 2.41a7.88 7.88 0 0 0-3.08 4.29c-.31 1.31-1.39 2.27-2.73 2.27a2.85 2.85 0 0 1-2.85-2.85c0-.6.18-1.16.51-1.63a7.83 7.83 0 0 0 .5-3.53 4.14 4.14 0 0 0-2.88-3.72A1.9 1.9 0 0 1 6 8.57c0-.7.38-1.31.96-1.63a7.87 7.87 0 0 0 3.8-5.32A2.84 2.84 0 0 1 12.53.02zM9 13v1c0 1.66 1.34 3 3 3s3-1.34 3-3v-1H9z" />
                        </svg>
                      )}
                    </div>
                    <div className="product-info">
                      <Link href={`/products/${product.id}`}>
                        <strong>{product.name}</strong>
                      </Link>
                      <span className="muted" title={product.productUrl}>{product.productUrl}</span>
                    </div>
                  </div>
                </td>
                <td>
                  {product.category ? (
                    <span className="badge">{product.category}</span>
                  ) : (
                    <span className="muted">-</span>
                  )}
                </td>
                <td>
                  <strong style={{ fontSize: "13px" }}>{product.shopName ?? "-"}</strong>
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(product.price, product.currency)}</span>
                </td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>
                      {formatPercent(product.commissionRate)}
                    </span>
                    <span className="muted" style={{ fontSize: "11px" }}>
                      {formatCurrency(product.commissionAmount, product.currency)}
                    </span>
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>{product.soldCount.toLocaleString()}</span>
                </td>
                <td>
                  {product.rating ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ color: "var(--accent-gold)", fontWeight: 700 }}>★</span>
                      <span style={{ fontWeight: 600 }}>{product.rating.toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="muted">-</span>
                  )}
                </td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{product.reviewCount.toLocaleString()} reviews</span>
                    {product.badReviewCount > 0 ? (
                      <span className="badge danger" style={{ fontSize: "10px", marginTop: "4px", alignSelf: "flex-start" }}>
                        Bad: {product.badReviewCount}
                      </span>
                    ) : (
                      <span className="badge success" style={{ fontSize: "10px", marginTop: "4px", alignSelf: "flex-start" }}>
                        100% Good
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
