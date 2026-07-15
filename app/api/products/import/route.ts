import { NextResponse } from "next/server";
import { parse } from "papaparse";
import { prisma } from "@/lib/prisma";
import { productIdFromUrl } from "@/lib/products";

type CsvRow = Record<string, string | undefined>;

function text(row: CsvRow, key: string) {
  const value = row[key]?.trim();
  return value ? value : null;
}

function number(row: CsvRow, key: string) {
  const value = text(row, key);
  if (!value) {
    return null;
  }

  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function int(row: CsvRow, key: string) {
  const parsed = number(row, key);
  return parsed === null ? 0 : Math.trunc(parsed);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "CSV file is required." }, { status: 400 });
  }

  const csv = await file.text();
  const result = parse<CsvRow>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  if (result.errors.length > 0) {
    return NextResponse.json(
      { error: "CSV parse failed.", details: result.errors.slice(0, 5) },
      { status: 400 },
    );
  }

  let imported = 0;
  const skipped: string[] = [];

  for (const row of result.data) {
    const name = text(row, "name");
    const productUrl = text(row, "product_url");

    if (!name || !productUrl) {
      skipped.push(name ?? productUrl ?? "row without name/url");
      continue;
    }

    await prisma.product.upsert({
      where: { productUrl },
      update: {
        name,
        category: text(row, "category"),
        shopName: text(row, "shop_name"),
        price: number(row, "price"),
        commissionRate: number(row, "commission_rate"),
        commissionAmount: number(row, "commission_amount"),
        soldCount: int(row, "sold_count"),
        rating: number(row, "rating"),
        reviewCount: int(row, "review_count"),
        badReviewCount: int(row, "bad_review_count"),
        voucherInfo: text(row, "voucher_info"),
        shippingNote: text(row, "shipping_note"),
      },
      create: {
        id: productIdFromUrl(productUrl),
        name,
        productUrl,
        category: text(row, "category"),
        shopName: text(row, "shop_name"),
        price: number(row, "price"),
        commissionRate: number(row, "commission_rate"),
        commissionAmount: number(row, "commission_amount"),
        soldCount: int(row, "sold_count"),
        rating: number(row, "rating"),
        reviewCount: int(row, "review_count"),
        badReviewCount: int(row, "bad_review_count"),
        voucherInfo: text(row, "voucher_info"),
        shippingNote: text(row, "shipping_note"),
      },
    });
    imported += 1;
  }

  const url = new URL("/products", request.url);
  url.searchParams.set("imported", String(imported));
  if (skipped.length > 0) {
    url.searchParams.set("skipped", String(skipped.length));
  }

  return NextResponse.redirect(url, 303);
}
