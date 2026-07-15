# Phase 07: Tracking Va Feedback Loop

## Muc Tieu

Do hieu qua video sau khi dang va dung data thuc te de quyet dinh scale hay dung.

## Metrics

```text
views
likes
comments
shares
product_clicks
orders
gross_revenue
commission
refund_count
cancel_count
```

## Derived Metrics

```text
View -> Product Click = product_clicks / views
Product Click -> Order = orders / product_clicks
Commission per 1,000 views = commission / views * 1000
```

## Decision Rules

```text
View cao, click thap:
Hook/CTA/offer yeu.

Click cao, order thap:
San pham/shop/page yeu.

View thap, order tot:
San pham tot, can hook moi.

View cao, click cao, order cao:
Nhan ban format.
```

## Tasks

- Tao model `VideoMetric`.
- Tao form nhap metric.
- Tao dashboard video performance.
- Tao product performance page.
- Tao classification: weak hook, weak product, promising, winning.
- Cap nhat lai product score bang du lieu video thuc.
- Cap nhat lai `content_potential_score` dua tren view rate, engagement, click rate.
- Cap nhat lai `quality/product risk` dua tren click cao nhung order thap, refund/cancel cao.
- Luu feedback vao `AffiliateScoreSnapshot` de biet score ban dau dung hay sai.
- So sanh performance cua minh voi `CompetitorVideo` neu co du lieu.

## Definition Of Done

- Nhap duoc metric cho video.
- Tinh duoc conversion funnel.
- Biet video nao nen scale.
- Biet san pham nao nen reject.
- Co feedback loop vao product scoring.
- Biet scoring rule nao dang du doan sai de dieu chinh trong phase 3.
