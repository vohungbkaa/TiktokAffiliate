import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function readArg(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1 || index + 1 >= process.argv.length) {
    return fallback;
  }
  return process.argv[index + 1];
}

const inputFile = readArg("--file", "data/category-urls.txt");
const maxItems = Number(readArg("--max-items", "25"));

try {
  const content = await readFile(inputFile, "utf8");
  const urls = [
    ...new Set(
      content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#")),
    ),
  ];

  let imported = 0;
  for (const url of urls) {
    await prisma.crawlTarget.upsert({
      where: { url },
      update: { maxItems, status: "pending" },
      create: { url, maxItems, status: "pending" },
    });
    imported += 1;
  }

  console.log(`imported ${imported} crawl target(s) from ${inputFile}`);
} finally {
  await prisma.$disconnect();
}
