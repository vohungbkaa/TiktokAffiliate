# TikTok Affiliate Product Intelligence

Bo tai lieu nay mo ta ke hoach xay dung he thong ho tro kiem tien TikTok Affiliate theo huong data-driven:

1. Tu dong thu thap du lieu san pham.
2. Phan tich va cham diem san pham.
3. Sinh y tuong va kich ban video.
4. Tao va toi uu kenh TikTok.
5. Dang video, do chi so, scale bang organic hoac ads.

Thu tu uu tien da duoc dieu chinh: phan tich san pham va crawler la loi dau tien cua he thong, truoc khi dau tu vao video automation hay quang cao.

Quyet dinh cong nghe cho crawler:

- Primary crawler: `Scrapling`.
- Browser/render fallback: `Scrapling DynamicFetcher`.
- Stealth fallback co kiem soat: `Scrapling StealthyFetcher`.
- LLM-ready extraction phu tro: `Crawl4AI` neu can bien page/review thanh Markdown sach.
- Manual/CSV import: bat buoc co de giam phu thuoc vao crawl.

## Tai Lieu

- [Roadmap tong the](./roadmap.md)
- [Crawler va product analytics](./crawler-and-product-analytics.md)
- [Data model](./data-model.md)
- [Video va channel workflow](./video-channel-workflow.md)
- [MVP backlog](./mvp-backlog.md)

## Phase Files

- [Phase 00: Project Foundation](./phases/phase-00-project-foundation.md)
- [Phase 01: Product Data Core](./phases/phase-01-product-data-core.md)
- [Phase 02: Scrapling Crawler MVP](./phases/phase-02-scrapling-crawler-mvp.md)
- [Phase 03: Product Scoring Va Review Analysis](./phases/phase-03-product-scoring-review-analysis.md)
- [Phase 04: AI Content Generator](./phases/phase-04-ai-content-generator.md)
- [Phase 05: Video Production Workflow](./phases/phase-05-video-production-workflow.md)
- [Phase 06: Channel Setup Va Organic Posting](./phases/phase-06-channel-organic-posting.md)
- [Phase 07: Tracking Va Feedback Loop](./phases/phase-07-tracking-feedback-loop.md)
- [Phase 08: Ads Scaling](./phases/phase-08-ads-scaling.md)

## Nguyen Tac San Pham

- Khong chon san pham theo cam tinh.
- Moi san pham can co score, ly do nen test, rui ro, va y tuong video.
- Moi video phai gan voi product va content idea de do hieu qua.
- Chi scale san pham/video khi co du lieu organic chung minh.
- Automation phai phuc vu quy trinh ra quyet dinh, khong chi tao nhieu video hon.
- Crawl it, co cache, co rate limit; khong vuot captcha, khong crawl o at sau login.
