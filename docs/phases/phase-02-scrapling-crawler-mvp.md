# Phase 02: Scrapling Crawler MVP

## Muc Tieu

Tu dong thu thap du lieu san pham o muc do nho, co kiem soat, co log va co fallback.

## Tool Decision

```text
Primary: Scrapling Fetcher/Spider
Dynamic pages: Scrapling DynamicFetcher
Harder pages: Scrapling StealthyFetcher, dung han che
LLM-ready extraction phu tro: Crawl4AI neu can
Fallback: manual form va CSV import
```

## Tasks

- Cai `scrapling[fetchers]`.
- Tao crawler CLI/service.
- Tao command `crawl:product-list`.
- Tao command `crawl:product-detail`.
- Tao command `crawl:reviews`.
- Dung `Fetcher` truoc cho HTML public.
- Dung `DynamicFetcher` khi can render JS/scroll.
- Ghi ro dieu kien moi dung `StealthyFetcher`.
- Tao normalizer cho price, commission, sold count, rating, review count.
- Tao crawl job queue don gian.
- Tao retry/error handling.
- Tao raw snapshot toi thieu de debug.
- Hien crawl history trong Product Detail.

## Definition Of Done

- Crawl thu duoc mot tap URL nho.
- Normalize duoc du lieu vao `Product`.
- Co log crawl thanh cong/that bai.
- Co rate limit va cache.
- Manual/CSV import van hoat dong khi crawler fail.

## Guardrails

- Khong vuot captcha.
- Khong crawl o at sau login.
- Khong su dung session bat thuong de ne bao ve.
- Khong reup video/asset cua creator khac.
- Chi lay du lieu can cho scoring.

## Output

```text
Product records
ProductReview records
CrawlJob logs
RawCrawlSnapshot debug payloads neu can
```
