import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ProductFilters = {
  category?: string;
  minRating?: string;
  minCommission?: string;
  minSold?: string;
  sort?: string;
};

export type ProductFormState = {
  error?: string;
};

export const productSelect = {
  id: true,
  name: true,
  productUrl: true,
  category: true,
  shopName: true,
  price: true,
  commissionRate: true,
  commissionAmount: true,
  soldCount: true,
  rating: true,
  reviewCount: true,
  badReviewCount: true,
  voucherInfo: true,
  shippingNote: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

export function toNumber(value: FormDataEntryValue | null) {
  if (value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toInt(value: FormDataEntryValue | null) {
  const parsed = toNumber(value);
  return parsed === null ? 0 : Math.trunc(parsed);
}

export function toStringOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function productDataFromForm(formData: FormData) {
  const name = toStringOrNull(formData.get("name"));
  const productUrl = toStringOrNull(formData.get("productUrl"));

  if (!name || !productUrl) {
    throw new Error("Name and product URL are required.");
  }

  return {
    name,
    productUrl,
    category: toStringOrNull(formData.get("category")),
    shopName: toStringOrNull(formData.get("shopName")),
    price: toNumber(formData.get("price")),
    commissionRate: toNumber(formData.get("commissionRate")),
    commissionAmount: toNumber(formData.get("commissionAmount")),
    soldCount: toInt(formData.get("soldCount")),
    rating: toNumber(formData.get("rating")),
    reviewCount: toInt(formData.get("reviewCount")),
    badReviewCount: toInt(formData.get("badReviewCount")),
    voucherInfo: toStringOrNull(formData.get("voucherInfo")),
    shippingNote: toStringOrNull(formData.get("shippingNote")),
  };
}

export function buildProductQuery(filters: ProductFilters) {
  const where: Prisma.ProductWhereInput = {};
  const orderBy: Prisma.ProductOrderByWithRelationInput = {};

  if (filters.category) {
    where.category = filters.category;
  }

  const minRating = Number(filters.minRating);
  if (Number.isFinite(minRating)) {
    where.rating = { gte: minRating };
  }

  const minCommission = Number(filters.minCommission);
  if (Number.isFinite(minCommission)) {
    where.commissionRate = { gte: minCommission };
  }

  const minSold = Number(filters.minSold);
  if (Number.isFinite(minSold)) {
    where.soldCount = { gte: Math.trunc(minSold) };
  }

  switch (filters.sort) {
    case "rating":
      orderBy.rating = "desc";
      break;
    case "commission":
      orderBy.commissionRate = "desc";
      break;
    case "sold":
      orderBy.soldCount = "desc";
      break;
    case "price":
      orderBy.price = "asc";
      break;
    default:
      orderBy.updatedAt = "desc";
  }

  return { where, orderBy };
}

export async function getProductCategories() {
  const rows = await prisma.product.findMany({
    distinct: ["category"],
    select: { category: true },
    where: { category: { not: null } },
    orderBy: { category: "asc" },
  });

  return rows.flatMap((row) => (row.category ? [row.category] : []));
}
