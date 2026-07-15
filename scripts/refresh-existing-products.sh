#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

CONFIG_FILE="${1:-config/tiktok-crawl.env}"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "Config file not found: $CONFIG_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$CONFIG_FILE"
set +a

SOURCE="${SOURCE:-tiktok}"
PRODUCT_URLS_FILE="${PRODUCT_URLS_FILE:-data/product-detail-urls.txt}"
BATCH_DELAY="${BATCH_DELAY:-1}"
DETAIL_DELAY="${DETAIL_DELAY:-0}"
REFRESH_CACHE_TTL="${REFRESH_CACHE_TTL:-0}"
MAX_REVIEWS="${MAX_REVIEWS:-3}"

echo "Exporting existing product detail URLs from DB..."
node scripts/export-product-urls.mjs --output "$PRODUCT_URLS_FILE" --source "$SOURCE"

URL_COUNT="$(wc -l < "$PRODUCT_URLS_FILE" | tr -d ' ')"
echo "Found $URL_COUNT product URLs in $PRODUCT_URLS_FILE"

if [ "$URL_COUNT" = "0" ]; then
  echo "No existing product URLs found. Run ./scripts/crawl-real-tiktok.sh first." >&2
  exit 1
fi

echo "Refreshing $URL_COUNT existing products..."
npm run crawl:product-urls -- \
  --file "$PRODUCT_URLS_FILE" \
  --limit "$URL_COUNT" \
  --batch-delay "$BATCH_DELAY" \
  --source "$SOURCE" \
  --delay "$DETAIL_DELAY" \
  --cache-ttl "$REFRESH_CACHE_TTL" \
  --max-reviews "$MAX_REVIEWS"

echo "Refresh done."
