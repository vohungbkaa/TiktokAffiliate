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

URLS_FILE="${URLS_FILE:-data/category-urls.txt}"
PRODUCT_LIMIT_PER_URL="${PRODUCT_LIMIT_PER_URL:-${PRODUCT_LIMIT:-25}}"
RESET_DB="${RESET_DB:-true}"
OUTPUT_FILE="${OUTPUT_FILE:-data/discovered-product-urls.txt}"
SOURCE="${SOURCE:-tiktok}"
FETCHER="${FETCHER:-dynamic}"
EXPAND_CATEGORY_PAGES="${EXPAND_CATEGORY_PAGES:-true}"
MAX_CATEGORY_PAGES="${MAX_CATEGORY_PAGES:-8}"
SCROLL_ROUNDS="${SCROLL_ROUNDS:-2}"
READ_MORE_CLICKS="${READ_MORE_CLICKS:-1}"
SCROLL_WAIT_MS="${SCROLL_WAIT_MS:-800}"
LIST_DELAY="${LIST_DELAY:-0}"
LIST_CACHE_TTL="${LIST_CACHE_TTL:-0}"
BATCH_DELAY="${BATCH_DELAY:-1}"
DETAIL_DELAY="${DETAIL_DELAY:-0}"
DETAIL_CACHE_TTL="${DETAIL_CACHE_TTL:-43200}"
MAX_REVIEWS="${MAX_REVIEWS:-3}"

if [ ! -f "$URLS_FILE" ]; then
  echo "URLS_FILE not found: $URLS_FILE" >&2
  exit 1
fi

CATEGORY_URLS=()
while IFS= read -r CATEGORY_URL; do
  CATEGORY_URLS+=("$CATEGORY_URL")
done < <(grep -v '^[[:space:]]*#' "$URLS_FILE" | sed '/^[[:space:]]*$/d')

if [ "${#CATEGORY_URLS[@]}" = "0" ]; then
  echo "No category URLs found. Paste TikTok Shop category URLs into $URLS_FILE." >&2
  exit 1
fi

if [ "$RESET_DB" = "true" ]; then
  echo "Resetting local database without seed data..."
  npx prisma migrate reset --force --skip-seed
fi

mkdir -p "$(dirname "$OUTPUT_FILE")"
DISCOVER_TMP="$(mktemp)"

for CATEGORY_URL in "${CATEGORY_URLS[@]}"; do
  CATEGORY_TMP="$(mktemp)"
  PRODUCT_LIST_ARGS=(
    --url "$CATEGORY_URL"
    --source "$SOURCE"
    --fetcher "$FETCHER"
    --max-items "$PRODUCT_LIMIT_PER_URL"
    --max-category-pages "$MAX_CATEGORY_PAGES"
    --scroll-rounds "$SCROLL_ROUNDS"
    --read-more-clicks "$READ_MORE_CLICKS"
    --scroll-wait-ms "$SCROLL_WAIT_MS"
    --output-file "$CATEGORY_TMP"
    --delay "$LIST_DELAY"
    --cache-ttl "$LIST_CACHE_TTL"
  )

  if [ "$EXPAND_CATEGORY_PAGES" = "true" ]; then
    PRODUCT_LIST_ARGS+=(--expand-category-pages)
  fi

  echo "Discovering up to $PRODUCT_LIMIT_PER_URL product URLs from:"
  echo "$CATEGORY_URL"
  npm run crawl:product-list -- "${PRODUCT_LIST_ARGS[@]}"

  cat "$CATEGORY_TMP" >> "$DISCOVER_TMP"
  rm -f "$CATEGORY_TMP"
done

sort -u "$DISCOVER_TMP" > "$OUTPUT_FILE"
rm -f "$DISCOVER_TMP"

URL_COUNT="$(wc -l < "$OUTPUT_FILE" | tr -d ' ')"
echo "Discovered $URL_COUNT product URLs in $OUTPUT_FILE"

if [ "$URL_COUNT" = "0" ]; then
  echo "No product URLs discovered. Stop before product-detail crawl." >&2
  exit 1
fi

echo "Crawling $URL_COUNT product details..."
npm run crawl:product-urls -- \
  --file "$OUTPUT_FILE" \
  --limit "$URL_COUNT" \
  --batch-delay "$BATCH_DELAY" \
  --source "$SOURCE" \
  --delay "$DETAIL_DELAY" \
  --cache-ttl "$DETAIL_CACHE_TTL" \
  --max-reviews "$MAX_REVIEWS"

echo "Done. Open /products in the web app to review crawled data."
