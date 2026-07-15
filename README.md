# TikTok Affiliate Ops

Local dashboard for product discovery, manual product data entry, CSV import, and future crawler/scoring workflows.

## Requirements

- Node.js 20+
- npm 10+
- Python 3.10+

## Setup

Fast path:

```bash
./scripts/run.sh
```

Manual setup:

```bash
cp .env.example .env
npm install
npm run db:migrate -- --name init
python3 -m venv .venv
source .venv/bin/activate
pip install -r crawler/requirements.txt
npm run crawler:check
npm run dev
```

Open `http://localhost:3000`.

## Useful Scripts

- `npm run dev`: start the web app.
- `npm run build`: generate Prisma client and build the web app.
- `npm run db:migrate -- --name init`: create/update the local SQLite database.
- `npm run db:seed`: seed sample product data for local UI testing only.
- `npm run db:clear-sample`: remove seeded/fixture sample data from the local database (keeps crawled data).
- `npx prisma migrate reset`: wipe and recreate the entire database completely (deletes all tables, crawled products, targets, and history).
- `npm run crawler:check`: verify Python can import Scrapling.
- `npm run crawler:dev`: run the crawler service placeholder.
- `npm run crawl:product-list -- --url <public-list-url>`: crawl a small product list.
- `npm run crawl:product-detail -- --url <public-product-url>`: crawl one product detail page.
- `npm run crawl:product-urls -- --file data/product-urls.txt --limit 100`: crawl many product URLs from a file.
- `npm run crawl:reviews -- --url <public-review-url> --product-url <product-url>`: crawl public reviews.

To discover product URLs from a public list/search/category page and save them:

```bash
npm run crawl:product-list -- --url "<public-list-url>" --max-items 20 --output-file data/discovered-product-urls.txt
```

To discover URLs and immediately crawl each detail page:

```bash
npm run crawl:product-list -- --url "<public-list-url>" --max-items 20 --follow-details
```

For dynamic category pages with scroll or a `Read more` button:

```bash
npm run crawl:product-list -- --url "<public-list-url>" --fetcher dynamic --max-items 100 --scroll-rounds 12 --read-more-clicks 3 --output-file data/discovered-product-urls.txt --cache-ttl 0
```

If the parent category does not expose enough products, expand through its child categories until `--max-items` is reached:

```bash
npm run crawl:product-list -- --url "<public-list-url>" --fetcher dynamic --max-items 100 --expand-category-pages --max-category-pages 8 --output-file data/discovered-product-urls.txt --cache-ttl 0
```

To crawl many product URLs collected from TikTok Affiliate/Product Marketplace:

```bash
cp data/product-urls.example.txt data/product-urls.txt
# Edit data/product-urls.txt, one real product URL per line.
npm run crawl:product-urls -- --file data/product-urls.txt --limit 100 --batch-delay 3
```

To reset the local DB and test crawling real TikTok Shop products from scratch, add category URLs to `data/category-urls.txt`, edit `config/tiktok-crawl.env`, and run `./scripts/crawl-real-tiktok.sh`. To refresh existing products later, run `./scripts/refresh-existing-products.sh`. Full guide: `docs/test-real-tiktok-crawl.md`.

The crawler uses `Fetcher` first. Use `--fetcher dynamic` only when a page needs JavaScript rendering. Use `--fetcher stealthy` only for legitimate public pages that lightly block normal fetching, and always pass `--stealth-reason`.

Guardrails: do not bypass captcha, do not crawl protected/login-only pages, keep `--delay` and `--max-items` conservative, and use manual/CSV import when crawler access fails.

## CSV Import

Use `data/sample-products.csv` as the template. Supported columns:

```text
name,product_url,category,shop_name,price,commission_rate,commission_amount,sold_count,rating,review_count,bad_review_count,voucher_info,shipping_note
```
