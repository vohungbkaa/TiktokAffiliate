# TikTok Affiliate Ops

Local dashboard for product discovery, manual product data entry, CSV import, and future crawler/scoring workflows.

## Requirements

- Node.js 20+
- npm 10+
- Python 3.10+

## Setup

```bash
cp .env.example .env
npm install
npm run db:migrate -- --name init
npm run db:seed
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
- `npm run db:seed`: seed sample product data.
- `npm run crawler:check`: verify Python can import Scrapling.
- `npm run crawler:dev`: run the crawler service placeholder.

## CSV Import

Use `data/sample-products.csv` as the template. Supported columns:

```text
name,product_url,category,shop_name,price,commission_rate,commission_amount,sold_count,rating,review_count,bad_review_count,voucher_info,shipping_note
```
