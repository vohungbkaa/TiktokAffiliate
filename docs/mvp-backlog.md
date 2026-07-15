# MVP Backlog

## Milestone 0: Project Foundation

Muc tieu: co nen mong de thi cong cac phase sau.

Tasks:

- Tao app skeleton.
- Tao database.
- Tao ORM/migration setup.
- Tao dashboard layout.
- Tao crawler service folder bang Python.
- Cai `scrapling[fetchers]`.
- Tao env example.
- Tao dev scripts.

Definition of Done:

- Chay duoc web app local.
- Ket noi duoc database.
- Chay duoc Python script import Scrapling.
- Co README setup local.

## Milestone 1: Product Data Core

Muc tieu: co the nhap san pham, import CSV, va xem dashboard san pham truoc khi crawler hoan thien.

Tasks:

- Tao model `Product`.
- Tao model `ProductReview`.
- Tao model `CrawlJob`.
- Tao model `RawCrawlSnapshot`.
- Tao Product List.
- Tao Product Detail.
- Tao manual product form.
- Tao CSV import.

Definition of Done:

- Nhap duoc 50 san pham.
- Dashboard sap xep duoc theo commission, rating, sold count.
- Co the edit/bo sung du lieu san pham bang tay.

## Milestone 2: Scrapling Crawler MVP

Muc tieu: thu thap du lieu ban tu dong tu nguon san pham hop le.

Tasks:

- Tao job queue don gian.
- Tao Scrapling worker prototype.
- Tao command `crawl:product-list`.
- Tao command `crawl:product-detail`.
- Tao command `crawl:reviews`.
- Dung `Fetcher` truoc.
- Dung `DynamicFetcher` cho trang can JS.
- Ghi ro khi nao moi dung `StealthyFetcher`.
- Tao normalizer.
- Tao `ProductMetricSnapshot` khi crawl/refresh detail.
- Lay voucher, shipping note, bad review count neu co.
- Tao error/rate-limit handling.
- Tao crawl history trong Product Detail.

Definition of Done:

- Tao duoc job crawl product detail.
- Chuan hoa duoc gia, rating, review count, commission neu co.
- Neu crawl fail, co log va retry control.
- Manual import van hoat dong khi crawler fail.

## Milestone 3: Product Scoring Va Review Analyzer

Muc tieu: cham diem san pham va dung AI de tom tat review/rui ro.

Tasks:

- Tao model `ProductScore`.
- Tao model `ReviewAnalysis`.
- Tao model `ProductMetricSnapshot`.
- Tao model `AffiliateScoreSnapshot`.
- Tao model `CompetitorVideo`.
- Tao scoring engine v1.
- Tao decision engine.
- Tinh estimated commission revenue.
- Tinh bad review rate.
- Tinh trend score tu sold/review delta.
- Import competitor video bang manual/CSV truoc.
- Tao ranking dashboard.
- Tao prompt phan tich review.
- Tach positive themes.
- Tach negative themes.
- Sinh risk summary.
- Sinh content angles.
- Sinh claim warnings.

Definition of Done:

- Moi san pham co score.
- Co decision `test_now`, `watchlist`, `reject`.
- Moi product co review summary.
- Co canh bao rui ro ro rang.
- Product List sort/filter duoc theo affiliate score va decision.
- Co 3-5 content angles cho san pham tot.

## Milestone 4: Content Generator

Muc tieu: tao y tuong video cho san pham co score cao.

Tasks:

- Tao model `ContentIdea`.
- Tao generator cho hook.
- Tao generator cho script 15s/30s.
- Tao generator cho caption/hashtags.
- Tao shot list.
- Tao CTA.
- Tao visual hook/pain point/demo idea.
- Dua content idea vao lai affiliate score neu san pham kho lam video.
- Tao status flow: idea -> selected -> produced -> posted.

Definition of Done:

- Chon 1 product co the sinh 10 ideas.
- Idea co hook, script, caption, hashtag, CTA.
- Co the mark idea thanh selected/produced.

## Milestone 5: Video Tracking

Muc tieu: do hieu qua video sau khi dang.

Tasks:

- Tao model `Video`.
- Tao model `VideoMetric`.
- Tao form nhap metric.
- Tinh view-to-click.
- Tinh click-to-order.
- Tinh commission per 1000 views.
- Tao dashboard video performance.

Definition of Done:

- Nhap duoc metric cho video.
- He thong phan loai video: weak hook, weak product, promising, winning.
- Product score co the tham chieu du lieu video thuc.

## Milestone 6: Channel Workflow

Muc tieu: quan ly lich dang va content pipeline.

Tasks:

- Tao calendar/list bai dang.
- Gan video voi product va content idea.
- Luu TikTok post URL.
- Luu ngay dang.
- Tao queue video can dang.

Definition of Done:

- Biet moi ngay can dang video nao.
- Biet video nao da dang va dang cho metric.
- Biet san pham nao can lam them bien the.

## Milestone 7: Video Asset Package

Muc tieu: ho tro san xuat video nhanh hon, chua can render tu dong hoan toan.

Tasks:

- Generate voice-over file.
- Generate subtitle file.
- Export script package.
- Export shot list.
- Luu asset URLs.
- Tao checklist edit CapCut.

Definition of Done:

- Mot content idea co the export thanh goi asset de edit video.
- Giam thoi gian tao 1 video xuong con 10-20 phut.

## Milestone 8: Ads Analytics

Muc tieu: chi chay ads cho video co tin hieu organic.

Tasks:

- Tao model `AdCampaign`.
- Nhap spend.
- Nhap orders/commission tu ads.
- Tinh CPA.
- Tinh profit proxy.
- Tao rule stop/scale.

Definition of Done:

- Biet video nao du dieu kien test ads.
- Biet ads dang loi hay lo.
- Co rule dung campaign khi CPA qua cao.

## Khong Lam Trong MVP Dau

- Tu dong reup video.
- Auto comment/auto like.
- Auto post TikTok.
- Crawl vuot captcha.
- Render hang tram video khi chua co product win.
- Xay mobile app.
