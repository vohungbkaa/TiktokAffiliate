"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productDataFromForm } from "@/lib/products";

export async function createProduct(formData: FormData) {
  const data = productDataFromForm(formData);

  await prisma.product.create({ data });

  revalidatePath("/products");
  redirect("/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const data = productDataFromForm(formData);

  await prisma.product.update({
    where: { id },
    data,
  });

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  redirect(`/products/${id}`);
}
