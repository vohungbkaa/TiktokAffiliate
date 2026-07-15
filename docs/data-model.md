# Data Model

## Product

```text
id
external_id
name
category
product_url
image_url
shop_name
shop_url
price
currency
commission_rate
commission_amount
sold_count
rating
review_count
bad_review_count
shop_rating
voucher_info
shipping_note
raw_source
last_crawled_at
status
estimated_commission_revenue
bad_review_rate
affiliate_score
affiliate_decision
created_at
updated_at
```

`status`:

```text
new
watchlist
testing
winning
scaled
rejected
```

## ProductScore

```text
id
product_id
profit_score
quality_score
trend_score
content_potential_score
competition_score
risk_adjustment_score
total_score
decision
reason_summary
badges
created_at
```

`decision`:

```text
test_now
watchlist
only_if_good_angle
reject
```

## ProductMetricSnapshot

```text
id
product_id
price
commission_rate
commission_amount
sold_count
rating
review_count
bad_review_count
voucher_info
shipping_note
source
captured_at
created_at
```

Derived metrics:

```text
sold_count_delta_7d
sold_count_delta_30d
review_count_delta_7d
rating_change
commission_change
```

## AffiliateScoreSnapshot

```text
id
product_id
product_score_id
profit_score
quality_score
trend_score
content_potential_score
competition_score
risk_adjustment_score
total_score
decision
reason_summary
captured_at
created_at
```

## ProductReview

```text
id
product_id
rating
content
has_image
has_video
reviewed_at
source
created_at
```

## ReviewAnalysis

```text
id
product_id
positive_themes
negative_themes
risk_summary
content_angles
claim_warnings
complaint_summary
visual_hook_score
pain_point_score
demo_score
created_at
```

## CompetitorVideo

```text
id
product_id
video_url
creator_name
caption
views
likes
comments
shares
posted_at
captured_at
source
created_at
updated_at
```

Derived metrics:

```text
engagement_rate = (likes + comments + shares) / views
creator_count per product
video_count per product
top_video_views per product
competition_score
```

## CrawlJob

```text
id
source
target_url
job_type
status
attempt_count
error_message
started_at
finished_at
created_at
```

`job_type`:

```text
product_list
product_detail
review_list
manual_import
csv_import
```

`status`:

```text
pending
running
completed
failed
rate_limited
skipped
```

## RawCrawlSnapshot

```text
id
crawl_job_id
source
target_url
content_hash
raw_payload
captured_at
```

Chi luu raw payload khi can debug. Neu payload lon hoac nhay cam, uu tien luu trich xuat da normalize.

## ContentIdea

```text
id
product_id
angle
format
hook
script
caption
hashtags
cta
text_overlay
shot_list
duration_seconds
status
created_at
updated_at
```

`format`:

```text
pov
ranking
review
comparison
bad_review_check
office_snack
late_night
combo
```

`status`:

```text
idea
selected
produced
posted
measured
discarded
```

## Video

```text
id
product_id
content_idea_id
title
script
voice_url
asset_urls
final_video_url
tiktok_post_url
posted_at
status
created_at
updated_at
```

`status`:

```text
draft
ready
posted
measured
scaled
archived
```

## VideoMetric

```text
id
video_id
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
measured_at
created_at
```

Derived metrics:

```text
view_to_click_rate = product_clicks / views
click_to_order_rate = orders / product_clicks
commission_per_1000_views = commission / views * 1000
```

## AdCampaign

```text
id
video_id
platform
campaign_type
budget
spend
orders
commission
cpa
roas_proxy
started_at
ended_at
status
created_at
updated_at
```

`campaign_type`:

```text
spark_ads
boost_post
other
```
