"use server";

import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productDataFromForm, productIdFromUrl, toInt, toStringOrNull } from "@/lib/products";

export async function createProduct(formData: FormData) {
  const data = productDataFromForm(formData);

  await prisma.product.create({ data: { id: productIdFromUrl(data.productUrl), ...data } });

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

export async function createCrawlTarget(formData: FormData) {
  const url = toStringOrNull(formData.get("url"));
  const label = toStringOrNull(formData.get("label"));
  const maxItems = toInt(formData.get("maxItems")) || 25;

  if (!url || !/^https?:\/\//i.test(url)) {
    throw new Error("A valid URL is required.");
  }

  await prisma.crawlTarget.upsert({
    where: { url },
    update: {
      label,
      maxItems,
      status: "pending",
      lastError: null,
      lastFinishedAt: null,
    },
    create: {
      url,
      label,
      maxItems,
      status: "pending",
    },
  });

  revalidatePath("/crawler");
  redirect("/crawler");
}

export async function deleteCrawlTarget(id: string) {
  await prisma.crawlTarget.delete({ where: { id } });
  revalidatePath("/crawler");
  redirect("/crawler");
}

export async function resetCrawlTarget(id: string) {
  await prisma.crawlTarget.update({
    where: { id },
    data: {
      status: "pending",
      lastError: null,
      lastStartedAt: null,
      lastFinishedAt: null,
      discoveredCount: 0,
      crawledCount: 0,
    },
  });

  revalidatePath("/crawler");
  revalidatePath(`/crawler/${id}`);
}

export async function startPendingCrawlTargets() {
  const targets = await prisma.crawlTarget.findMany({
    where: { status: { in: ["pending", "failed"] } },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  const targetIds = targets.map((target) => target.id);

  if (targetIds.length === 0) {
    revalidatePath("/crawler");
    return;
  }

  if (targetIds.length > 0) {
    await prisma.crawlTarget.updateMany({
      where: { id: { in: targetIds } },
      data: {
        status: "running",
        lastStartedAt: new Date(),
        lastFinishedAt: null,
        lastError: null,
        discoveredCount: 0,
        crawledCount: 0,
      },
    });
  }

  await mkdir("data", { recursive: true });
  const logPath = join(process.cwd(), "data", "crawl-targets.log");
  const logStream = createWriteStream(logPath, { flags: "a" });
  logStream.write(`\n[${new Date().toISOString()}] start crawl targets: ${targetIds.length} URL(s)\n`);

  const child = spawn("node", ["scripts/crawl-targets.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, CRAWL_TARGET_IDS: targetIds.join(",") },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.pipe(logStream, { end: false });
  child.stderr.pipe(logStream, { end: false });

  child.on("close", (code) => {
    logStream.write(`[${new Date().toISOString()}] finish crawl targets: code ${code}\n`);
    logStream.end();
  });

  revalidatePath("/crawler");
}

async function exportProductUrls(outputFile = "data/product-detail-urls.txt", source = "tiktok") {
  const products = await prisma.product.findMany({
    where: {
      productUrl: { not: "" },
      ...(source === "all" ? {} : { rawSource: source }),
    },
    select: { productUrl: true },
    orderBy: { updatedAt: "desc" },
  });

  const urls = [...new Set(products.map((product) => product.productUrl).filter(Boolean))];
  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, urls.join("\n") + (urls.length ? "\n" : ""), "utf8");
  return urls.length;
}

export async function exportExistingProductUrls() {
  await exportProductUrls();
  revalidatePath("/crawler");
}

export async function refreshExistingProducts() {
  const job = await prisma.crawlJob.create({
    data: {
      source: "tiktok",
      jobType: "refresh_existing_products",
      status: "running",
      targetUrl: "data/product-detail-urls.txt",
      startedAt: new Date(),
      attemptCount: 1,
    },
  });

  await mkdir("data", { recursive: true });
  const logPath = join(process.cwd(), "data", "refresh-existing-products.log");
  const logStream = createWriteStream(logPath, { flags: "a" });
  logStream.write(`\n[${new Date().toISOString()}] start refresh job ${job.id}\n`);

  const child = spawn("./scripts/refresh-existing-products.sh", [], {
    cwd: process.cwd(),
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.pipe(logStream, { end: false });
  child.stderr.pipe(logStream, { end: false });

  child.on("close", async (code) => {
    const status = code === 0 ? "completed" : "failed";
    const error = code === 0 ? null : `refresh script exited with code ${code}`;
    try {
      await prisma.crawlJob.update({
        where: { id: job.id },
        data: {
          status,
          completedAt: new Date(),
          finishedAt: new Date(),
          error,
          errorMessage: error,
        },
      });
    } finally {
      logStream.write(`[${new Date().toISOString()}] finish refresh job ${job.id}: ${status}\n`);
      logStream.end();
    }
  });

  revalidatePath("/crawler");
}

export async function refreshProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { productUrl: true, rawSource: true },
  });

  if (!product) {
    redirect("/products");
  }

  const job = await prisma.crawlJob.create({
    data: {
      source: product.rawSource ?? "tiktok",
      jobType: "refresh_product",
      status: "running",
      targetUrl: product.productUrl,
      startedAt: new Date(),
      attemptCount: 1,
    },
  });

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      ".venv/bin/python",
      [
        "crawler/main.py",
        "product-detail",
        "--url",
        product.productUrl,
        "--source",
        product.rawSource ?? "tiktok",
        "--fetcher",
        "fetcher",
        "--cache-ttl",
        "0",
        "--delay",
        "0",
        "--max-reviews",
        "3",
      ],
      { cwd: process.cwd(), stdio: "inherit" },
    );

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`product refresh exited with code ${code}`));
      }
    });
  })
    .then(async () => {
      await prisma.crawlJob.update({
        where: { id: job.id },
        data: { status: "completed", completedAt: new Date(), finishedAt: new Date() },
      });
    })
    .catch(async (error) => {
      await prisma.crawlJob.update({
        where: { id: job.id },
        data: {
          status: "failed",
          completedAt: new Date(),
          finishedAt: new Date(),
          error: String(error),
          errorMessage: String(error),
        },
      });
    });

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
}
