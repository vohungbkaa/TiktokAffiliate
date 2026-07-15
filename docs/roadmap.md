# Roadmap Thi Cong He Thong

## Muc Tieu

Xay dung mot pipeline hoan chinh:

```text
Crawl san pham -> Chuan hoa du lieu -> Cham diem -> Chon san pham -> Tao video -> Dang TikTok -> Do chi so -> Scale
```

MVP khong phai la mot tool render video tu dong. MVP la mot he thong giup moi ngay chon ra nhung san pham dang lam video nhat, tao y tuong noi dung cho chung, va do xem video co tao ra don hang hay khong.

## Quyet Dinh Cong Nghe

```text
App: Next.js hoac full-stack web app tuong duong
Database: PostgreSQL
ORM: Prisma
Crawler service: Python + Scrapling
AI analysis: OpenAI API
Video workflow ban dau: CapCut/manual asset package
Video render tu dong sau nay: FFmpeg
```

Crawler:

```text
Primary: Scrapling Fetcher/Spider
Dynamic pages: Scrapling DynamicFetcher
Harder pages: Scrapling StealthyFetcher, dung han che
LLM-ready Markdown phu tro: Crawl4AI, khong phai crawler core
Fallback: manual form va CSV import
```

## Phase 0: Setup Nen Mong Project

Chi tiet: [Phase 00: Project Foundation](./phases/phase-00-project-foundation.md)

Muc tieu: tao khung app de co the thi cong tung module.

Tasks:

- Khoi tao app.
- Cai database.
- Cai Prisma/schema migration.
- Tao layout dashboard co navigation.
- Tao env config cho database va OpenAI.
- Tao Python crawler service folder rieng.
- Tao script dev cho web app va crawler.

Definition of Done:

- Chay duoc app local.
- Connect duoc database.
- Co trang dashboard rong.
- Co Python service import duoc `scrapling`.
- Co docs/env mau de nguoi khac setup lai.

## Phase 1: Product Data Core

Chi tiet: [Phase 01: Product Data Core](./phases/phase-01-product-data-core.md)

Muc tieu:

- Tao data model cho san pham, shop, review, crawl job, raw snapshot.
- Tao manual form va CSV import truoc de test scoring khong phu thuoc crawler.
- Tao Product List va Product Detail.

Tasks:

- Tao model `Product`.
- Tao model `ProductReview`.
- Tao model `CrawlJob`.
- Tao model `RawCrawlSnapshot`.
- Tao product create/edit form.
- Tao CSV import.
- Tao product table voi filter/sort.
- Tao product detail page.

Ket qua can co:

- Nhap duoc san pham thu cong.
- Import duoc 50 san pham tu CSV.
- Xem duoc product list/detail.
- Chua can crawler hoan hao o phase nay.

## Phase 2: Scrapling Crawler MVP

Chi tiet: [Phase 02: Scrapling Crawler MVP](./phases/phase-02-scrapling-crawler-mvp.md)

Muc tieu: tu dong thu thap du lieu san pham o muc do nho, co kiem soat.

Tasks:

- Cai `scrapling[fetchers]`.
- Tao crawler CLI/service: `crawl product-list`, `crawl product-detail`, `crawl reviews`.
- Dung `Fetcher` truoc cho HTML public neu lay duoc.
- Dung `DynamicFetcher` khi can render JS/scroll.
- Chi dung `StealthyFetcher` khi can va co rate limit chat.
- Tao normalizer: price, commission, sold count, rating, review count.
- Tao `ProductMetricSnapshot` de tinh sales/review growth 7d/30d.
- Lay them voucher, shipping note, bad review count neu public page co.
- Tao crawl job queue don gian.
- Tao retry/error handling.
- Tao raw snapshot toi thieu de debug.

Definition of Done:

- Crawl thu duoc mot tap URL nho.
- Normalize duoc du lieu vao `Product`.
- Co log crawl thanh cong/that bai.
- Co rate limit va cache.
- Manual/CSV import van la fallback.

Guardrails:

- Khong vuot captcha.
- Khong crawl o at sau login.
- Khong su dung session bat thuong de ne bao ve.
- Khong reup video/asset cua creator khac.

## Phase 3: Product Scoring Va Review Analysis

Chi tiet: [Phase 03: Product Scoring Va Review Analysis](./phases/phase-03-product-scoring-review-analysis.md)

Muc tieu: bien raw product data thanh quyet dinh co nen lam video khong.

Tasks:

- Tao `ProductScore`.
- Implement scoring v1.
- Tinh `estimated_commission_revenue`, `bad_review_rate`, trend delta tu metric snapshot.
- Them score thanh phan: profit, quality, trend, content potential, competition, risk.
- Tao `CompetitorVideo` voi manual/CSV import truoc khi tinh crawl/search TikTok.
- Tao decision engine: `test_now`, `watchlist`, `only_if_good_angle`, `reject`.
- Tao AI review analyzer.
- Tom tat review tot/xau.
- Phat hien rui ro: giao cham, vi te, date gan het han, hang vo, claim suc khoe.
- Tao dashboard ranking.

Definition of Done:

- Moi product co score va decision.
- Co ly do cham diem.
- Co review summary.
- Product List co the sort theo affiliate score va hien badge rui ro/co hoi.
- Co top san pham nen test moi ngay.

## Phase 4: AI Content Generator

Chi tiet: [Phase 04: AI Content Generator](./phases/phase-04-ai-content-generator.md)

Muc tieu:

- Bien san pham da duoc chon thanh y tuong video.
- Sinh hook, script, caption, hashtag, CTA, text overlay.
- Sinh visual hook, pain point, demo idea, before/after angle dua tren du lieu product/review.
- Canh bao cac claim khong nen noi qua, dac biet voi do an, suc khoe, giam can, hang gia, hang chinh hang.

Ket qua can co:

- Moi san pham co 5-10 content ideas.
- Moi idea co format ro rang: POV, ranking, review, so sanh, doc review xau, combo van phong, an dem.
- Co script ngan 15-30 giay de dua vao CapCut hoac video pipeline.

## Phase 5: Video Production Workflow

Chi tiet: [Phase 05: Video Production Workflow](./phases/phase-05-video-production-workflow.md)

Muc tieu:

- Ban dau ban thu cong/buon ban tu dong: AI sinh script, voice, subtitle, con nguoi edit bang CapCut.
- Sau khi co san pham win, moi dau tu render tu dong bang template.

Muc 1:

- Generate script.
- Generate voice-over.
- Generate subtitle.
- Export asset package cho CapCut.

Muc 2:

- Upload anh/video san pham.
- Chon template 9:16.
- Render video bang FFmpeg.
- Luu video vao storage.

## Phase 6: Channel Setup Va Organic Posting

Chi tiet: [Phase 06: Channel Setup Va Organic Posting](./phases/phase-06-channel-organic-posting.md)

Muc tieu:

- Tao kenh TikTok co dinh vi ro.
- Dang deu video theo batch.
- Moi video phai gan voi product va content idea trong database.

Goi y dinh vi kenh:

```text
Dev test snack deadline
```

Content pillars:

- Snack code dem.
- Do an van phong.
- Combo duoi 100k.
- Test mon viral.
- Mon dang mua/khong dang mua.

## Phase 7: Tracking Va Feedback Loop

Chi tiet: [Phase 07: Tracking Va Feedback Loop](./phases/phase-07-tracking-feedback-loop.md)

Muc tieu:

- Nhap hoac dong bo chi so video sau khi dang.
- Tinh conversion funnel.
- Cap nhat lai score san pham bang du lieu thuc te.

Chi so can theo doi:

```text
View -> Product Click = product_clicks / views
Product Click -> Order = orders / product_clicks
Commission per 1,000 views = commission / views * 1000
```

Quyet dinh:

- View cao, click thap: sua hook/CTA/offer.
- Click cao, order thap: san pham/shop/page yeu.
- View thap, order tot: tao lai hook manh hon.
- View cao, click cao, order cao: scale.

## Phase 8: Ads Scaling

Chi tiet: [Phase 08: Ads Scaling](./phases/phase-08-ads-scaling.md)

Chi chay ads sau khi organic da chung minh.

Dieu kien toi thieu:

```text
View -> Click >= 1%
Click -> Order >= 3%
Co don organic
Hoa hong/1000 views du tot
Shop va review on dinh
```

Voi do an vat, ads co the kho loi vi hoa hong moi don thap. Chi nen test ngan sach nho va dung ngay neu CPA cao hon hoa hong ky vong.

## Roadmap Thi Cong 8 Tuan

### Tuan 1

- Phase 0 va Phase 1.
- Tao app, database, schema.
- Xay Product List/Product Detail.
- Import thu cong 50 san pham.

### Tuan 2

- Phase 2.
- Xay Scrapling crawler MVP.
- Crawl thu tap URL nho.
- Chuan hoa du lieu san pham.
- Co cache/rate limit/log.

### Tuan 3

- Phase 3.
- Xay scoring v1.
- Them review analyzer.
- Tao dashboard ranking.
- Chon top 10 san pham can test.

### Tuan 4

- Phase 4.
- Them AI Content Generator.
- Sinh hook/script/caption/CTA.
- Chon 10 san pham dau tien de test.

### Tuan 5

- Phase 5 va Phase 6.
- Lam 30 video dau tien.
- Dang 2-3 video/ngay.
- Setup kenh TikTok.
- Gan moi video voi product/content idea.

### Tuan 6

- Phase 7.
- Nhap metric thu cong.
- Tao Video Tracking dashboard.
- Tim product/video co tin hieu win.
- Mua mau san pham thang.

### Tuan 7

- Quay footage that.
- Lam them bien the.
- Cai tien scoring bang du lieu video thuc.
- Them asset package cho CapCut.

### Tuan 8

- Phase 8.
- Scale san pham thang bang nhieu format.
- Toi uu profile kenh.
- Pin video tot.
- Test Spark Ads ngan sach nho cho video thang.
- Do CPA va loi nhuan.
- Quyet dinh scale ads hoac tiep tuc organic.
