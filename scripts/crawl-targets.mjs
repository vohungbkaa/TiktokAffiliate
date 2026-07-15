import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${command} exited with code ${result.status}`);
  }
}

function countUrls(filePath) {
  return readFileSync(filePath, "utf8")
    .split("\n")
    .filter((line) => line.trim() && !line.trim().startsWith("#")).length;
}

async function main() {
  mkdirSync("data", { recursive: true });

  const targets = await prisma.crawlTarget.findMany({
    where: { status: { in: ["pending", "failed"] } },
    orderBy: { createdAt: "asc" },
  });

  if (targets.length === 0) {
    console.log("No pending crawl targets.");
    return;
  }

  const job = await prisma.crawlJob.create({
    data: {
      source: "tiktok",
      jobType: "crawl_targets",
      status: "running",
      targetUrl: `${targets.length} pending targets`,
      startedAt: new Date(),
      attemptCount: 1,
    },
  });

  let failed = 0;

  for (const target of targets) {
    const outputFile = `data/crawl-target-${target.id}.txt`;
    try {
      await prisma.crawlTarget.update({
        where: { id: target.id },
        data: {
          status: "running",
          lastStartedAt: new Date(),
          lastFinishedAt: null,
          lastError: null,
          discoveredCount: 0,
          crawledCount: 0,
        },
      });

      const listArgs = [
        "crawler/main.py",
        "product-list",
        "--url",
        target.url,
        "--source",
        target.source,
        "--fetcher",
        target.fetcher,
        "--max-items",
        String(target.maxItems),
        "--max-category-pages",
        String(target.maxCategoryPages),
        "--scroll-rounds",
        String(target.scrollRounds),
        "--read-more-clicks",
        String(target.readMoreClicks),
        "--scroll-wait-ms",
        String(target.scrollWaitMs),
        "--output-file",
        outputFile,
        "--delay",
        "0",
        "--cache-ttl",
        "0",
      ];

      if (target.expandCategoryPages) {
        listArgs.push("--expand-category-pages");
      }

      run(".venv/bin/python", listArgs);
      const discoveredCount = countUrls(outputFile);

      await prisma.crawlTarget.update({
        where: { id: target.id },
        data: { discoveredCount },
      });

      if (discoveredCount > 0) {
        run(".venv/bin/python", [
          "crawler/main.py",
          "product-urls",
          "--file",
          outputFile,
          "--limit",
          String(discoveredCount),
          "--batch-delay",
          "1",
          "--source",
          target.source,
          "--delay",
          "0",
          "--cache-ttl",
          "43200",
          "--max-reviews",
          "3",
        ]);
      }

      await prisma.crawlTarget.update({
        where: { id: target.id },
        data: {
          status: "completed",
          crawledCount: discoveredCount,
          lastFinishedAt: new Date(),
          lastError: null,
        },
      });
    } catch (error) {
      failed += 1;
      await prisma.crawlTarget.update({
        where: { id: target.id },
        data: {
          status: "failed",
          lastFinishedAt: new Date(),
          lastError: String(error),
        },
      });
    }
  }

  const status = failed === 0 ? "completed" : "failed";
  const error = failed === 0 ? null : `${failed} target(s) failed`;
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
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
