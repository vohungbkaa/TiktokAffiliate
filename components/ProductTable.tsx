import Link from "next/link";
import type { Product } from "@prisma/client";

type ProductTableProps = {
  products: Product[];
};

function formatCurrency(value: unknown) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `$${Number(value).toFixed(2)}`;
}

function formatPercent(value: unknown) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${Number(value).toFixed(2)}%`;
}

export function ProductTable({ products }: ProductTableProps) {
  if (products.length === 0) {
    return <div className="card">No products yet.</div>;
  }

  return (
    <div className="panel">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Shop</th>
              <th>Price</th>
              <th>Commission</th>
              <th>Sold</th>
              <th>Rating</th>
              <th>Reviews</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <Link href={`/products/${product.id}`}>
                    <strong>{product.name}</strong>
                  </Link>
                  <div className="muted">{product.productUrl}</div>
                </td>
                <td>{product.category ?? "-"}</td>
                <td>{product.shopName ?? "-"}</td>
                <td>{formatCurrency(product.price)}</td>
                <td>
                  {formatPercent(product.commissionRate)}
                  <div className="muted">{formatCurrency(product.commissionAmount)}</div>
                </td>
                <td>{product.soldCount.toLocaleString()}</td>
                <td>{product.rating ?? "-"}</td>
                <td>
                  {product.reviewCount.toLocaleString()}
                  <div className="muted">Bad: {product.badReviewCount.toLocaleString()}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
