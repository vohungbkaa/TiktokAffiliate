import Link from "next/link";
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
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = await searchParams;
  const { where, orderBy } = buildProductQuery(filters);
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where, orderBy }),
    getProductCategories(),
  ]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Filter and sort products by rating, commission, sold count, and category.</p>
        </div>
        <Link className="button" href="/products/new">
          Add Product
        </Link>
      </div>

      <form className="filters">
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={filters.category ?? ""}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="minRating">Min Rating</label>
          <input id="minRating" name="minRating" type="number" step="0.1" defaultValue={filters.minRating ?? ""} />
        </div>
        <div className="field">
          <label htmlFor="minCommission">Min Commission %</label>
          <input
            id="minCommission"
            name="minCommission"
            type="number"
            step="0.1"
            defaultValue={filters.minCommission ?? ""}
          />
        </div>
        <div className="field">
          <label htmlFor="minSold">Min Sold</label>
          <input id="minSold" name="minSold" type="number" defaultValue={filters.minSold ?? ""} />
        </div>
        <div className="field">
          <label htmlFor="sort">Sort</label>
          <select id="sort" name="sort" defaultValue={filters.sort ?? "updated"}>
            <option value="updated">Recently updated</option>
            <option value="rating">Rating high to low</option>
            <option value="commission">Commission high to low</option>
            <option value="sold">Sold high to low</option>
            <option value="price">Price low to high</option>
          </select>
        </div>
        <div className="field">
          <label>&nbsp;</label>
          <button type="submit">Apply Filters</button>
        </div>
        <div className="field">
          <label>&nbsp;</label>
          <Link className="button secondary" href="/products">
            Reset
          </Link>
        </div>
      </form>

      <ProductTable products={products} />
    </>
  );
}
