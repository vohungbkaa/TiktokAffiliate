# Phase 03: Product Scoring Va Review Analysis

## Muc Tieu

Bien raw product data thanh quyet dinh: san pham nao nen lam video, san pham nao nen bo qua.

## Tasks

- Tao model `ProductScore`.
- Tao model `ReviewAnalysis`.
- Implement scoring engine v1.
- Implement decision engine.
- Tao AI review analyzer.
- Tom tat review tot/xau.
- Phat hien rui ro.
- Tao dashboard ranking.

## Scoring Formula V1

```text
Product Score =
Sales Momentum * 25%
+ Rating Quality * 20%
+ Commission Value * 20%
+ Content Potential * 20%
+ Risk Score * 15%
```

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

## Definition Of Done

- Moi san pham co score.
- Co decision `test_now`, `watchlist`, `only_if_good_angle`, `reject`.
- Co ly do cham diem.
- Co review summary.
- Co top san pham nen test moi ngay.

## Output

```text
ProductScore
ReviewAnalysis
Daily top product ranking
Risk warnings
Content angles seed
```
