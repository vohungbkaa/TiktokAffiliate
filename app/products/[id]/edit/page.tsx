import { notFound } from "next/navigation";
import { ProductForm } from "@/components/ProductForm";
import { updateProduct } from "@/app/actions";
import { prisma } from "@/lib/prisma";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    notFound();
  }

  const action = updateProduct.bind(null, product.id);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Edit Product</h1>
          <p>{product.name}</p>
        </div>
      </div>
      <ProductForm action={action} product={product} submitLabel="Save Changes" />
    </>
  );
}
