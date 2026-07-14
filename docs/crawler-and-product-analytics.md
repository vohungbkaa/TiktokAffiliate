# Crawler Va Product Analytics

## Muc Tieu

Crawler la loi dau tien cua he thong. Neu khong co du lieu san pham tot, video automation se chi giup san xuat nhanh hon nhung khong tang xac suat ra don.

Muc tieu cua crawler:

- Thu thap san pham dang ban chay trong ngach da chon.
- Lay du lieu gia, hoa hong, rating, review, shop, voucher, da ban.
- Phat hien san pham co tin hieu tot nhung noi dung hien tai tren TikTok con yeu.
- Tao danh sach san pham nen lam video truoc.

## Quyet Dinh Tool Crawl

Primary crawler la `Scrapling`, vi he thong can structured scraping hon la chi bien page thanh Markdown.

Dung theo thu tu:

```text
1. Scrapling Fetcher
   Cho trang public/HTML co san, nhanh va nhe.

2. Scrapling DynamicFetcher
   Cho trang can render JS, scroll, lazy load.

3. Scrapling StealthyFetcher
   Chi dung khi bi block nhe va van trong pham vi truy cap hop le.

4. Crawl4AI
   Phu tro khi can Markdown/LLM-ready extraction cho review/page dai.

5. Manual/CSV import
   Bat buoc co de tool van hoat dong khi crawler loi.
```

Khong coi stealth la loi the chinh. Loi the ben vung la crawl it, co cache, co rate limit, co fallback, va chi lay du lieu can thiet.

## Nguyen Tac Crawl

Can uu tien nguon hop le va on dinh.

Nen lam:

- Dung export, report, dashboard, API hop le neu nen tang cung cap.
- Dung browser automation cho tai khoan cua minh neu phu hop voi dieu khoan su dung.
- Gioi han toc do crawl.
- Luu raw HTML/snapshot chi khi can debug.
- Co manual import/CSV fallback.

Khong nen lam:

- Vuot captcha.
- Lay du lieu sau dang nhap bang cach pha co che bao ve.
- Reup video/asset cua creator khac.
- Crawl qua nhanh gay khoa tai khoan.

## Nguon Du Lieu Uu Tien

### 1. TikTok Shop Affiliate/Product Marketplace

Day la nguon chinh vi co du lieu can cho affiliate:

- Ten san pham.
- Link san pham.
- Gia.
- Hoa hong.
- Rating.
- So da ban neu co hien thi.
- Shop.
- Review.
- Voucher/khuyen mai.

### 2. TikTok Search/Creative Observation

Dung de xem san pham nao dang duoc creator lam video:

- So luong video quanh san pham.
- Hook pho bien.
- Comment nguoi xem.
- Tin hieu bao hoa noi dung.

### 3. Manual Input

Can co form nhap tay de khong bi phu thuoc vao crawler.

Bat buoc ho tro:

- Paste product URL.
- Nhap gia/hoa hong/rating.
- Paste review xau.
- Import CSV.

## Crawler Architecture

```text
Scheduler
  -> Crawl Job Queue
    -> Scrapling Worker / API Client / CSV Importer
      -> Raw Data Store
        -> Normalizer
          -> Product Database
            -> Scoring Engine
              -> Dashboard
```

## Thanh Phan

### Scheduler

Chay job theo lich:

- Crawl san pham moi moi ngay.
- Refresh san pham watchlist moi 12-24 gio.
- Refresh san pham winning moi 6-12 gio.

### Crawl Job Queue

Dung queue de tranh crawl qua nhanh:

- `pending`
- `running`
- `failed`
- `completed`
- `rate_limited`

### Scrapling Worker

Worker chay bang Python va Scrapling.

Worker nen:

- Uu tien `Fetcher` truoc.
- Dung `DynamicFetcher` khi can render JS/scroll.
- Dung `StealthyFetcher` han che, co log ly do.
- Dung session rieng cho tung nguon neu can.
- Co delay ngau nhien.
- Chi doc du lieu can thiet.
- Ghi log ro URL, thoi gian, status.
- Co cache de tranh hit lai cung mot URL qua nhieu.
- Co max pages/max items cho moi job.

Worker khong nen:

- Vuot captcha.
- Crawl bang toc do cao.
- Dung account chinh de test crawl rui ro.
- Lay du lieu khong can thiet cho scoring.

### Normalizer

Chuyen raw data thanh schema chung:

```text
price_text -> price_number
commission_text -> commission_rate / commission_amount
sold_text -> sold_count
rating_text -> rating
review_text -> review list
```

### Scoring Engine

Cham diem san pham theo cong thuc co the dieu chinh.

```text
Product Score =
Sales Momentum * 25%
+ Rating Quality * 20%
+ Commission Value * 20%
+ Content Potential * 20%
+ Risk Score * 15%
```

## Product Score

### Sales Momentum

Tin hieu:

- So da ban.
- Tang truong so da ban theo ngay.
- So creator dang ban.
- So video moi trong 7 ngay.

Cham diem:

```text
0-30: it don, khong co tin hieu trend
31-60: co don, co nguoi mua
61-80: dang ban tot
81-100: dang trend ro
```

### Rating Quality

Tin hieu:

- Rating trung binh.
- So luong review.
- Ty le review 1-2 sao.
- Chat luong review co anh/video.

Rule ban dau:

```text
rating >= 4.8 va review_count cao: tot
rating 4.6-4.79: chap nhan duoc
rating < 4.5: can can than
review_count qua thap: khong du tin cay
```

### Commission Value

Tin hieu:

- Hoa hong/phan tram.
- Hoa hong tien mat moi don.
- Gia san pham.

Rule ban dau:

```text
commission_amount < 5.000 VND: yeu
5.000-15.000 VND: chap nhan
15.000-30.000 VND: tot
> 30.000 VND: rat dang test neu conversion on
```

### Content Potential

Tin hieu:

- San pham co visual manh khong.
- Co de tao hook khong.
- Co phu hop voi kenh khong.
- Co goc quay an dem/van phong/dev khong.

Vi du san pham content potential cao:

- Snack cay.
- Do an co tieng gion.
- Combo nhieu vi.
- Mon la.
- Packaging bat mat.
- San pham co review trai chieu de tao curiosity.

### Risk Score

Risk Score cang cao nghia la cang it rui ro.

Rui ro can tru diem:

- Nhieu review che vi do.
- Giao hang cham.
- Hang be/vo/hong.
- Date gan het han.
- Shop rating thap.
- San pham co claim suc khoe qua manh.
- Ty le huy/hoan neu co.

## Decision Engine

Sau khi co score, he thong gan decision:

```text
score >= 80: test_now
65-79: watchlist
50-64: only_if_good_angle
< 50: reject
```

Them rule chan:

```text
rating < 4.3 -> reject
bad_review_rate qua cao -> reject
commission_amount qua thap va gia qua thap -> reject
review co nhieu phan nan ve an toan thuc pham -> reject
```

## Review Analyzer

Dung AI de tom tat review:

Output:

```text
Positive themes:
- Vi cay vua.
- Dong goi dep.
- Giao nhanh.

Negative themes:
- Co nguoi che hoi man.
- Mot so phan nan hang bi vo.

Risk summary:
- Rui ro chinh la dong goi, khong phai chat luong mon an.

Content angle:
- Nen khai thac "combo an dem" va "snack cay van phong".
```

## Dashboard Can Co

### Product Ranking

Cot:

- Product name.
- Price.
- Commission.
- Rating.
- Sold count.
- Review count.
- Product score.
- Decision.
- Status.

### Product Detail

Hien thi:

- Ly do score.
- Review summary.
- Risk.
- Content angles.
- Link san pham.
- Lich su crawl.

### Watchlist

San pham co tin hieu nhung can theo doi:

- Score dang tang.
- So da ban tang.
- Review moi tot.
- Commission moi tang.

## Manual QA Checklist

Truoc khi lam video, con nguoi nen check:

- San pham co phu hop voi kenh khong?
- Review xau co nghiem trong khong?
- Shop co uy tin khong?
- Gia co qua cao so voi gia tri cam nhan khong?
- Co the lam 3 hook khac nhau khong?
- Co can mua mau de quay that khong?

## Phien Ban MVP

Crawler MVP nen gom:

1. Manual import bang form/CSV.
2. Scrapling `Fetcher` collector cho trang product/list neu phu hop.
3. Scrapling `DynamicFetcher` cho trang can JS/scroll.
4. Normalizer.
5. Scoring engine v1.
6. Review analyzer.
7. Product ranking dashboard.

Khong can lam ngay:

- Crawl toan bo TikTok.
- Tu dong comment/engage.
- Tu dong dang video.
- Render video hang loat.
