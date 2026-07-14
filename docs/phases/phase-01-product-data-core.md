# Phase 01: Product Data Core

## Muc Tieu

Tao lop du lieu san pham truoc khi crawler hoan thien. Phase nay giup test scoring va dashboard bang du lieu nhap tay/CSV.

## Scope

- Product schema.
- Product review schema.
- Crawl job schema.
- Manual product form.
- CSV import.
- Product list/detail.

## Tasks

- Tao model `Product`.
- Tao model `ProductReview`.
- Tao model `CrawlJob`.
- Tao model `RawCrawlSnapshot`.
- Tao Product List.
- Tao Product Detail.
- Tao manual product create/edit form.
- Tao CSV import.
- Tao sort/filter theo rating, commission, sold count, category.

## Definition Of Done

- Nhap duoc san pham thu cong.
- Import duoc 50 san pham tu CSV.
- Xem duoc product list/detail.
- Co the edit/bo sung du lieu san pham bang tay.

## Data To Capture

```text
name
product_url
category
shop_name
price
commission_rate
commission_amount
sold_count
rating
review_count
bad_review_count
voucher_info
shipping_note
```

## Khong Lam Trong Phase Nay

- Chua can crawler hoan hao.
- Chua can AI review analyzer.
- Chua can video generator.
