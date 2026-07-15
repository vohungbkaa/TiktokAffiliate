import Link from "next/link";
import { ProductFilters } from "@/components/ProductFilters";
import { ProductTable } from "@/components/ProductTable";
import { buildProductQuery, getProductCategories } from "@/lib/products";
import { prisma } from "@/lib/prisma";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    minRating?: string;
    minCommission?: string;
    minSold?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  }>;
};

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = new Set([20, 50, 100]);

function positiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildPageHref(filters: Awaited<ProductsPageProps["searchParams"]>, page: number) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value && key !== "page") {
      params.set(key, value);
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = await searchParams;
  const { where, orderBy } = buildProductQuery(filters);
  const requestedPageSize = positiveInt(filters.pageSize, DEFAULT_PAGE_SIZE);
  const pageSize = PAGE_SIZE_OPTIONS.has(requestedPageSize) ? requestedPageSize : DEFAULT_PAGE_SIZE;
  const page = positiveInt(filters.page, 1);
  const [totalProducts, categories] = await Promise.all([
    prisma.product.count({ where }),
    getProductCategories(),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const currentPage = Math.min(page, totalPages);
  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Filter and sort products by rating, commission, sold count, and category.</p>
        </div>
        <Link className="button" href="/products/new">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: "4px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Product
        </Link>
      </div>

      <ProductFilters categories={categories} filters={{ ...filters, pageSize: String(pageSize) }} />

      <section className="panel">
        <div className="panel-header">
          <h2>Product List</h2>
          <span className="muted">
            Showing {products.length.toLocaleString()} of {totalProducts.toLocaleString()} products
          </span>
        </div>
        <ProductTable products={products} />
        <div className="pagination">
          <Link
            className={`button secondary ${currentPage <= 1 ? "disabled-link" : ""}`}
            href={currentPage <= 1 ? buildPageHref(filters, 1) : buildPageHref(filters, currentPage - 1)}
            scroll={false}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: "4px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Previous
          </Link>
          <span className="pagination-info">
            Page <strong className="current">{currentPage.toLocaleString()}</strong> of <strong>{totalPages.toLocaleString()}</strong>
          </span>
          <Link
            className={`button secondary ${currentPage >= totalPages ? "disabled-link" : ""}`}
            href={currentPage >= totalPages ? buildPageHref(filters, totalPages) : buildPageHref(filters, currentPage + 1)}
            scroll={false}
          >
            Next
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginLeft: "4px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
