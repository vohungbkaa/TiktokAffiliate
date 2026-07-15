# Phase 03: Product Scoring Va Review Analysis

## Muc Tieu

Bien raw product data thanh quyet dinh: san pham nao nen lam video, san pham nao nen bo qua.

## Tasks

- Tao model `ProductScore`.
- Tao model `ReviewAnalysis`.
- Tao model `AffiliateScoreSnapshot` neu can luu lich su score theo ngay.
- Tao model `CompetitorVideo` cho du lieu canh tranh tu manual/CSV import.
- Implement scoring engine v1.
- Implement decision engine.
- Tinh `bad_review_rate`.
- Tinh `estimated_commission_revenue`.
- Tinh score thanh phan: profit, quality, trend, content, competition.
- Tao AI review analyzer.
- Tom tat review tot/xau.
- Phat hien rui ro.
- Sinh ly do cham diem de nguoi dung biet vi sao nen/khong nen lam video.
- Tao dashboard ranking.

## Scoring Formula V1

```text
Product Score =
Profit Score * 25%
+ Quality Score * 20%
+ Trend Score * 20%
+ Content Potential Score * 20%
+ Competition Score * 10%
+ Risk Adjustment * 5%
```

Thanh phan:

- `Profit Score`: commission amount, commission rate, price band, estimated commission revenue.
- `Quality Score`: rating, review count, bad review rate, shop risk.
- `Trend Score`: sold/review delta 7d va 30d tu `ProductMetricSnapshot`.
- `Content Potential Score`: visual hook, pain point, demo ability, before/after, review angle.
- `Competition Score`: creator count, video count, top video views, engagement rate. MVP lay bang manual/CSV import truoc.
- `Risk Adjustment`: claim warnings, safety complaints, delivery/product quality complaints.

## Decision Rules

```text
score >= 80: test_now
65-79: watchlist
50-64: only_if_good_angle
< 50: reject
```

Hard reject:

```text
rating < 4.3
bad_review_rate qua cao
commission_amount qua thap
review co nhieu phan nan ve an toan thuc pham
shop risk cao
```

## Data Inputs

Lay tu phase truoc:

- `Product`: price, commission, sold count, rating, review count, bad review count, voucher, shipping.
- `ProductMetricSnapshot`: sold/review/rating/price/commission theo thoi gian.
- `ProductReview`: review text va rating neu crawl duoc.
- `CompetitorVideo`: du lieu canh tranh tu manual/CSV/nguon hop le.

LLM chi dung cho:

- Review summary.
- Complaint classification.
- Content potential explanation.
- Claim warnings.

Khong goi LLM trong luc render Product List. Scoring nen chay bang job rieng va luu ket qua.

## Definition Of Done

- Moi san pham co score.
- Co decision `test_now`, `watchlist`, `only_if_good_angle`, `reject`.
- Co ly do cham diem.
- Co review summary.
- Product List sort duoc theo affiliate score.
- Co badge `Good Pick`, `Risky`, `Low Commission`, `High Bad Review`, `High Potential`.
- Co top san pham nen test moi ngay.

## Output

```text
ProductScore
AffiliateScoreSnapshot neu can lich su
ReviewAnalysis
CompetitorVideo
Daily top product ranking
Risk warnings
Content angles seed
```
