import { ProductForm } from "@/components/ProductForm";
import { createProduct } from "@/app/actions";

export default function NewProductPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1>Add Product</h1>
          <p>Create a product manually before crawler data is available.</p>
        </div>
      </div>
      <ProductForm action={createProduct} submitLabel="Create Product" />
    </>
  );
}
