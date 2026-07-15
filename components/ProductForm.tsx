import Link from "next/link";
import type { Product } from "@prisma/client";

type ProductFormProps = {
  action: (formData: FormData) => Promise<void>;
  product?: Product;
  submitLabel: string;
};

function valueOf(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

export function ProductForm({ action, product, submitLabel }: ProductFormProps) {
  return (
    <form action={action} className="panel">
      <div className="panel-header">
        <h2>Product Data</h2>
      </div>
      <div style={{ padding: "24px" }}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" required defaultValue={product?.name ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="productUrl">Product URL</label>
            <input
              id="productUrl"
              name="productUrl"
              type="url"
              required
              defaultValue={product?.productUrl ?? ""}
            />
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <input id="category" name="category" defaultValue={product?.category ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="shopName">Shop Name</label>
            <input id="shopName" name="shopName" defaultValue={product?.shopName ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              name="price"
              inputMode="decimal"
              type="number"
              step="0.01"
              min="0"
              defaultValue={valueOf(product?.price)}
            />
          </div>
          <div className="field">
            <label htmlFor="currency">Currency</label>
            <input id="currency" name="currency" defaultValue={product?.currency ?? "VND"} />
          </div>
          <div className="field">
            <label htmlFor="commissionRate">Commission Rate (%)</label>
            <input
              id="commissionRate"
              name="commissionRate"
              inputMode="decimal"
              type="number"
              step="0.01"
              min="0"
              defaultValue={valueOf(product?.commissionRate)}
            />
          </div>
          <div className="field">
            <label htmlFor="commissionAmount">Commission Amount</label>
            <input
              id="commissionAmount"
              name="commissionAmount"
              inputMode="decimal"
              type="number"
              step="0.01"
              min="0"
              defaultValue={valueOf(product?.commissionAmount)}
            />
          </div>
          <div className="field">
            <label htmlFor="soldCount">Sold Count</label>
            <input
              id="soldCount"
              name="soldCount"
              type="number"
              min="0"
              defaultValue={product?.soldCount ?? 0}
            />
          </div>
          <div className="field">
            <label htmlFor="rating">Rating</label>
            <input
              id="rating"
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              defaultValue={product?.rating ?? ""}
            />
          </div>
          <div className="field">
            <label htmlFor="reviewCount">Review Count</label>
            <input
              id="reviewCount"
              name="reviewCount"
              type="number"
              min="0"
              defaultValue={product?.reviewCount ?? 0}
            />
          </div>
          <div className="field">
            <label htmlFor="badReviewCount">Bad Review Count</label>
            <input
              id="badReviewCount"
              name="badReviewCount"
              type="number"
              min="0"
              defaultValue={product?.badReviewCount ?? 0}
            />
          </div>
          <div className="field">
            <label htmlFor="voucherInfo">Voucher Info</label>
            <input id="voucherInfo" name="voucherInfo" defaultValue={product?.voucherInfo ?? ""} />
          </div>
          <div className="field full">
            <label htmlFor="shippingNote">Shipping Note</label>
            <textarea
              id="shippingNote"
              name="shippingNote"
              defaultValue={product?.shippingNote ?? ""}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit">{submitLabel}</button>
          <Link className="button secondary" href={product ? `/products/${product.id}` : "/products"}>
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
