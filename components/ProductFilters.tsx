"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductFilters as ProductFilterValues } from "@/lib/products";

type ProductFiltersProps = {
  categories: string[];
  filters: ProductFilterValues;
};

const DEFAULT_PAGE_SIZE = "20";

export function ProductFilters({ categories, filters }: ProductFiltersProps) {
  const router = useRouter();
  const debounceRef = useRef<number | null>(null);
  const [values, setValues] = useState({
    category: filters.category ?? "",
    minRating: filters.minRating ?? "",
    minCommission: filters.minCommission ?? "",
    minSold: filters.minSold ?? "",
    sort: filters.sort ?? "updated",
    pageSize: filters.pageSize ?? DEFAULT_PAGE_SIZE,
  });

  useEffect(() => {
    setValues({
      category: filters.category ?? "",
      minRating: filters.minRating ?? "",
      minCommission: filters.minCommission ?? "",
      minSold: filters.minSold ?? "",
      sort: filters.sort ?? "updated",
      pageSize: filters.pageSize ?? DEFAULT_PAGE_SIZE,
    });
  }, [filters.category, filters.minRating, filters.minCommission, filters.minSold, filters.sort, filters.pageSize]);

  function replaceUrl(nextValues: typeof values) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(nextValues)) {
      if (value && !(key === "sort" && value === "updated") && !(key === "pageSize" && value === DEFAULT_PAGE_SIZE)) {
        params.set(key, value);
      }
    }

    const query = params.toString();
    router.replace(query ? `/products?${query}` : "/products", { scroll: false });
  }

  function updateValue(key: keyof typeof values, value: string, debounce = false) {
    const nextValues = { ...values, [key]: value };
    setValues(nextValues);

    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }

    if (debounce) {
      debounceRef.current = window.setTimeout(() => replaceUrl(nextValues), 350);
      return;
    }

    replaceUrl(nextValues);
  }

  return (
    <form className="filters product-filters" onSubmit={(event) => event.preventDefault()}>
      <div className="field">
        <label htmlFor="category">Category</label>
        <select id="category" name="category" value={values.category} onChange={(event) => updateValue("category", event.target.value)}>
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
        <input
          id="minRating"
          name="minRating"
          type="number"
          step="0.1"
          value={values.minRating}
          onChange={(event) => updateValue("minRating", event.target.value, true)}
          placeholder="e.g. 4.0"
        />
      </div>
      <div className="field">
        <label htmlFor="minCommission">Min Commission %</label>
        <input
          id="minCommission"
          name="minCommission"
          type="number"
          step="0.1"
          value={values.minCommission}
          onChange={(event) => updateValue("minCommission", event.target.value, true)}
          placeholder="e.g. 10"
        />
      </div>
      <div className="field">
        <label htmlFor="minSold">Min Sold</label>
        <input
          id="minSold"
          name="minSold"
          type="number"
          value={values.minSold}
          onChange={(event) => updateValue("minSold", event.target.value, true)}
          placeholder="e.g. 1000"
        />
      </div>
      <div className="field">
        <label htmlFor="sort">Sort By</label>
        <select id="sort" name="sort" value={values.sort} onChange={(event) => updateValue("sort", event.target.value)}>
          <option value="updated">Recently updated</option>
          <option value="rating">Rating high to low</option>
          <option value="commission">Commission high to low</option>
          <option value="sold">Sold high to low</option>
          <option value="price">Price low to high</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="pageSize">Page Size</label>
        <select id="pageSize" name="pageSize" value={values.pageSize} onChange={(event) => updateValue("pageSize", event.target.value)}>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
      <div className="field filters-reset">
        <label>&nbsp;</label>
        <Link className="button secondary" href="/products">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: "4px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Reset
        </Link>
      </div>
    </form>
  );
}
