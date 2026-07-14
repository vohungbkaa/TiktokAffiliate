# Test Real TikTok Crawl From Scratch

Tai lieu nay dung khi muon xoa sach database local va crawl lai du lieu that tu mot hoac nhieu TikTok Shop category URL.

## Quick Run

Sua file danh sach URL:

```text
data/category-urls.txt
```

Moi dong la mot TikTok Shop category URL. Dong bat dau bang `#` se bi bo qua.

Sua file config:

```text
config/tiktok-crawl.env
```

Sua so san pham moi category tai `PRODUCT_LIMIT_PER_URL`.

Chay:

```bash
./scripts/crawl-real-tiktok.sh
```

Hoac:

```bash
npm run crawl:real-tiktok
```

Script se tu dong:

1. Xoa sach DB neu `RESET_DB=true`.
2. Lay danh sach product URL tu tat ca category trong `data/category-urls.txt`.
3. Crawl detail tung product vao DB.

Mac dinh config hien tai crawl toi da `25` san pham moi category.

## 1. Xoa Sach Database

Lenh nay reset SQLite database, chay lai migration, va khong nap seed/sample data:

```bash
npx prisma migrate reset --force --skip-seed
```

Kiem tra DB da sach:

```bash
node -e 'const { PrismaClient } = require("@prisma/client"); const p = new PrismaClient(); Promise.all([p.product.count(), p.productReview.count(), p.rawCrawlSnapshot.count(), p.crawlJob.count()]).then(([products,reviews,snapshots,jobs]) => console.log({products,reviews,snapshots,jobs})).finally(() => p.$disconnect())'
```

Ket qua mong muon:

```text
{ products: 0, reviews: 0, snapshots: 0, jobs: 0 }
```

Khong chay `npm run db:seed` neu muc tieu la test du lieu that.

## 2. Config URL Category

Dung URL category TikTok Shop public ma browser cua ban dang mo duoc. Them URL vao:

```text
data/category-urls.txt
```

Vi du:

```text
https://shop.tiktok.com/vn/c/food-beverages/700437?source=ecommerce_mall&enter_method=categories&first_entrance=ecommerce_mall&first_entrance_position=region_not_match&first_entrance_tt_scene=seo&btm_pre=a2270.b46636.c37357.d69217_i19&btm_pre_show_id=047a4408-1c44-4997-9918-f9183b32976e&btm_transfer_id=009581d6-9f00-4aea-b45d-51077a968fd3
```

Neu co nhieu category, them nhieu dong:

```text
https://shop.tiktok.com/vn/c/food-beverages/700437?...
https://shop.tiktok.com/vn/c/beauty-personal-care/700645?...
https://shop.tiktok.com/vn/c/home-supplies/700635?...
```

## 3. Lay Product URL Tu Tat Ca Category

Lenh nhanh:

```bash
./scripts/crawl-real-tiktok.sh
```

Script render tung category bang browser automation, scroll/click Read more neu co, mo rong qua child categories neu page cha khong du san pham, va luu product URL vao `data/discovered-product-urls.txt`.

Neu muon chay rieng mot URL bang tay:

```bash
npm run crawl:product-list -- --url "https://shop.tiktok.com/vn/c/food-beverages/700437?source=ecommerce_mall&enter_method=categories&first_entrance=ecommerce_mall&first_entrance_position=region_not_match&first_entrance_tt_scene=seo&btm_pre=a2270.b46636.c37357.d69217_i19&btm_pre_show_id=047a4408-1c44-4997-9918-f9183b32976e&btm_transfer_id=009581d6-9f00-4aea-b45d-51077a968fd3" --source tiktok --fetcher dynamic --max-items 25 --expand-category-pages --max-category-pages 8 --scroll-rounds 2 --read-more-clicks 1 --scroll-wait-ms 800 --output-file data/discovered-product-urls.txt --delay 0 --cache-ttl 0
```

Kiem tra so URL da lay:

```bash
wc -l data/discovered-product-urls.txt
```

## 4. Crawl Detail San Pham Vao DB

Lenh nhanh `./scripts/crawl-real-tiktok.sh` se tu crawl detail tat ca URL da gom vao `data/discovered-product-urls.txt`.

Neu muon chay rieng buoc detail bang tay voi 25 URL dau tien:

```bash
npm run crawl:product-urls -- --file data/discovered-product-urls.txt --limit 25 --batch-delay 1 --source tiktok --delay 0 --cache-ttl 43200 --max-reviews 3
```

Kiem tra so luong data sau khi crawl:

```bash
node -e 'const { PrismaClient } = require("@prisma/client"); const p = new PrismaClient(); Promise.all([p.product.count({ where: { rawSource: "tiktok" } }), p.productReview.count(), p.rawCrawlSnapshot.count({ where: { source: "tiktok" } }), p.crawlJob.count({ where: { source: "tiktok" } })]).then(([products,reviews,snapshots,jobs]) => console.log({products,reviews,snapshots,jobs})).finally(() => p.$disconnect())'
```

`products` nen bang tong so product URL crawl thanh cong. Vi du: 1 category * 25 = toi da 25 products; 3 categories * 25 = toi da 75 products truoc khi tru link trung.

## 5. Chay Web De Kiem Tra

```bash
./scripts/run.sh
```

Mo:

```text
http://localhost:3000/products
```

Neu Next.js bao port `3000` dang ban va tu chuyen sang port khac, mo dung port terminal in ra, vi du:

```text
http://localhost:3001/products
```

## Luu Y

- Crawler khong bypass captcha/security check. Neu TikTok tra ve captcha, hay dung category/product URL khac hoac quay lai manual/CSV import.
- Nen giu `PRODUCT_LIMIT_PER_URL`, `--max-items`, va `--limit` nho khi test, vi TikTok co the thay doi cach render page hoac rate-limit.
- `data/discovered-product-urls.txt` chi la file trung gian. Muon crawl category moi thi chay lai buoc lay product URL voi URL moi.
