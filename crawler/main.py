import argparse
import hashlib
import os
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

try:
    from scrapling.fetchers import DynamicFetcher, Fetcher, StealthyFetcher
except ImportError as exc:
    raise SystemExit(
        "Scrapling is not installed. Run: pip install -r crawler/requirements.txt"
    ) from exc

from extractor import (
    extract_category_links,
    extract_product,
    extract_product_links,
    extract_reviews,
    html_text,
)
from normalizer import normalize_product, normalize_review
from storage import CrawlStore


ROOT = Path(__file__).resolve().parents[1]
CACHE_DIR = ROOT / "crawler" / ".cache"


def valid_public_url(url: str) -> bool:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        return False

    lowered = url.lower()
    blocked_tokens = ["captcha", "login", "signin", "account", "auth"]
    return not any(token in lowered for token in blocked_tokens)


def cache_path(url: str) -> Path:
    digest = hashlib.sha256(url.encode("utf-8")).hexdigest()
    return CACHE_DIR / f"{digest}.html"


def fetch_html(
    url: str,
    *,
    fetcher: str,
    retries: int,
    delay_seconds: float,
    cache_ttl_seconds: int,
    stealth_reason: str | None,
    scroll_rounds: int = 0,
    scroll_wait_ms: int = 1200,
    read_more_clicks: int = 0,
    dynamic_wait_ms: int = 0,
) -> str:
    if not valid_public_url(url):
        raise RuntimeError("Refusing to crawl non-public, login, auth, or captcha URL.")

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    path = cache_path(url)
    if path.exists() and cache_ttl_seconds > 0:
        age = time.time() - path.stat().st_mtime
        if age <= cache_ttl_seconds:
            print(f"cache hit: {url}")
            return path.read_text(encoding="utf-8")

    if fetcher == "stealthy" and not stealth_reason:
        raise RuntimeError("--stealth-reason is required when using StealthyFetcher.")

    last_error: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            if attempt > 1 or delay_seconds > 0:
                time.sleep(delay_seconds)

            print(f"fetch attempt {attempt}/{retries}: {url} via {fetcher}")
            browser_kwargs = {}
            if scroll_rounds > 0 or read_more_clicks > 0:
                browser_kwargs["page_action"] = make_dynamic_page_action(
                    scroll_rounds=scroll_rounds,
                    scroll_wait_ms=scroll_wait_ms,
                    read_more_clicks=read_more_clicks,
                )
                browser_kwargs["wait"] = dynamic_wait_ms
                browser_kwargs["network_idle"] = True
                browser_kwargs["timeout"] = max(30_000, (scroll_rounds + read_more_clicks + 2) * scroll_wait_ms)

            if fetcher == "dynamic":
                response = DynamicFetcher.fetch(url, **browser_kwargs)
            elif fetcher == "stealthy":
                print(f"stealth reason: {stealth_reason}")
                response = StealthyFetcher.fetch(url, **browser_kwargs)
            else:
                response = Fetcher.get(url)

            html = html_text(response)
            lowered_html = html.lower()
            if "captcha_container" in lowered_html or "<title>security check</title>" in lowered_html:
                raise RuntimeError(
                    "TikTok returned a security check/captcha page. "
                    "Crawler will not bypass captcha; use a public product URL, export, or manual URL file."
                )
            path.write_text(html, encoding="utf-8")
            return html
        except Exception as exc:  # Scrapling wraps backend exceptions differently per fetcher.
            last_error = exc
            print(f"fetch failed: {exc}", file=sys.stderr)

    raise RuntimeError(f"Failed after {retries} attempts: {last_error}")


def make_dynamic_page_action(scroll_rounds: int, scroll_wait_ms: int, read_more_clicks: int):
    def click_read_more(page) -> None:
        labels = ["Read more", "Show more", "Load more", "Xem thêm"]
        for label in labels:
            try:
                locator = page.get_by_text(label, exact=False)
                count = locator.count()
                if count > 0:
                    locator.nth(count - 1).click(timeout=1500)
                    page.wait_for_timeout(scroll_wait_ms)
                    return
            except Exception:
                continue

    def action(page) -> None:
        for _ in range(read_more_clicks):
            click_read_more(page)

        previous_height = 0
        stable_rounds = 0
        for _ in range(scroll_rounds):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(scroll_wait_ms)
            click_read_more(page)
            current_height = page.evaluate("document.body.scrollHeight")
            if current_height == previous_height:
                stable_rounds += 1
            else:
                stable_rounds = 0
            previous_height = current_height
            if stable_rounds >= 3:
                break

    return action


def common_fetch_kwargs(args: argparse.Namespace) -> dict[str, object]:
    return {
        "fetcher": args.fetcher,
        "retries": args.retries,
        "delay_seconds": args.delay,
        "cache_ttl_seconds": args.cache_ttl,
        "stealth_reason": args.stealth_reason,
        "scroll_rounds": getattr(args, "scroll_rounds", 0),
        "scroll_wait_ms": getattr(args, "scroll_wait_ms", 1200),
        "read_more_clicks": getattr(args, "read_more_clicks", 0),
        "dynamic_wait_ms": getattr(args, "dynamic_wait_ms", 0),
    }


def crawl_product_detail(args: argparse.Namespace) -> int:
    store = CrawlStore()
    job_id = store.create_job(args.source, "product_detail", args.url)
    try:
        store.start_job(job_id, 1)
        html = fetch_html(args.url, **common_fetch_kwargs(args))
        raw = extract_product(html, args.url)
        normalized = normalize_product(raw, args.url, args.source)
        product_id = store.upsert_product(normalized)
        max_reviews = getattr(args, "max_reviews", 10)
        normalized_reviews = [normalize_review(review) for review in raw.get("reviews", [])]
        for review in normalized_reviews[:max_reviews]:
            store.add_review(product_id, review)
        store.add_snapshot(
            product_id=product_id,
            crawl_job_id=job_id,
            source=args.source,
            target_url=args.url,
            source_url=args.url,
            payload={
                "raw": raw,
                "normalized": normalized,
                "reviews_inserted": len(normalized_reviews[:max_reviews]),
            },
        )
        store.finish_job(job_id, "completed")
        print(
            f"completed product_detail: product_id={product_id}, "
            f"reviews={len(normalized_reviews[:max_reviews])}"
        )
        return 0
    except Exception as exc:
        store.finish_job(job_id, "failed", str(exc))
        print(f"failed product_detail: {exc}", file=sys.stderr)
        return 1
    finally:
        store.close()


def crawl_product_list(args: argparse.Namespace) -> int:
    store = CrawlStore()
    job_id = store.create_job(args.source, "product_list", args.url)
    try:
        store.start_job(job_id, 1)
        html = fetch_html(args.url, **common_fetch_kwargs(args))
        links = extract_product_links(html, args.url, args.max_items)
        crawled_category_urls: list[str] = []

        if args.expand_category_pages and len(links) < args.max_items:
            category_urls = extract_category_links(html, args.url, args.max_category_pages)
            for category_url in category_urls:
                if len(links) >= args.max_items:
                    break
                if category_url == args.url.split("?")[0]:
                    continue

                print(f"expanding category: {category_url}")
                category_html = fetch_html(category_url, **common_fetch_kwargs(args))
                crawled_category_urls.append(category_url)
                for link in extract_product_links(category_html, category_url, args.max_items):
                    if link not in links:
                        links.append(link)
                    if len(links) >= args.max_items:
                        break

        if args.output_file:
            output_path = Path(args.output_file)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_text("\n".join(links) + ("\n" if links else ""), encoding="utf-8")
        store.add_snapshot(
            product_id=None,
            crawl_job_id=job_id,
            source=args.source,
            target_url=args.url,
            source_url=args.url,
            payload={
                "product_links": links,
                "count": len(links),
                "expanded_categories": crawled_category_urls,
            },
        )
        store.finish_job(job_id, "completed")
        print(f"completed product_list: {len(links)} links")
        for link in links:
            print(link)

        if args.follow_details:
            for link in links:
                child_args = argparse.Namespace(**vars(args))
                child_args.url = link
                crawl_product_detail(child_args)
        return 0
    except Exception as exc:
        store.finish_job(job_id, "failed", str(exc))
        print(f"failed product_list: {exc}", file=sys.stderr)
        return 1
    finally:
        store.close()


def crawl_product_urls(args: argparse.Namespace) -> int:
    path = Path(args.file)
    if not path.exists():
        print(f"URL file not found: {path}", file=sys.stderr)
        return 1

    urls = [
        line.strip()
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.strip().startswith("#")
    ]
    if args.limit:
        urls = urls[: args.limit]

    if not urls:
        print("No URLs found in file.", file=sys.stderr)
        return 1

    success = 0
    failed = 0
    print(f"batch crawl started: {len(urls)} URLs")
    for index, url in enumerate(urls, start=1):
        print(f"[{index}/{len(urls)}] {url}")
        child_args = argparse.Namespace(**vars(args))
        child_args.url = url
        result = crawl_product_detail(child_args)
        if result == 0:
            success += 1
        else:
            failed += 1

        if index < len(urls) and args.batch_delay > 0:
            time.sleep(args.batch_delay)

    print(f"batch crawl completed: success={success}, failed={failed}")
    return 0 if failed == 0 else 1


def crawl_reviews(args: argparse.Namespace) -> int:
    store = CrawlStore()
    job_id = store.create_job(args.source, "review_list", args.url)
    try:
        store.start_job(job_id, 1)
        html = fetch_html(args.url, **common_fetch_kwargs(args))
        raw_reviews = extract_reviews(html, args.source, args.max_items)
        product_row = store.conn.execute(
            "SELECT id FROM Product WHERE productUrl = ?",
            (args.product_url,),
        ).fetchone()
        if not product_row:
            raw_product = {"name": args.product_url, "product_url": args.product_url}
            product_id = store.upsert_product(normalize_product(raw_product, args.product_url, args.source))
        else:
            product_id = str(product_row["id"])

        normalized_reviews = [normalize_review(review) for review in raw_reviews]
        for review in normalized_reviews:
            store.add_review(product_id, review)

        store.add_snapshot(
            product_id=product_id,
            crawl_job_id=job_id,
            source=args.source,
            target_url=args.url,
            source_url=args.url,
            payload={"reviews": raw_reviews, "count": len(raw_reviews)},
        )
        store.finish_job(job_id, "completed")
        print(f"completed reviews: product_id={product_id}, reviews={len(normalized_reviews)}")
        return 0
    except Exception as exc:
        store.finish_job(job_id, "failed", str(exc))
        print(f"failed reviews: {exc}", file=sys.stderr)
        return 1
    finally:
        store.close()


def add_common_options(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--source", default="tiktok")
    parser.add_argument("--fetcher", choices=["fetcher", "dynamic", "stealthy"], default="fetcher")
    parser.add_argument("--stealth-reason")
    parser.add_argument("--retries", type=int, default=3)
    parser.add_argument("--delay", type=float, default=2.0)
    parser.add_argument("--cache-ttl", type=int, default=60 * 60 * 12)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Controlled Scrapling crawler MVP")
    subparsers = parser.add_subparsers(dest="command", required=True)

    product_list = subparsers.add_parser("product-list", help="Crawl product links from a listing page")
    product_list.add_argument("--url", required=True)
    product_list.add_argument("--max-items", type=int, default=20)
    product_list.add_argument("--output-file")
    product_list.add_argument("--follow-details", action="store_true")
    product_list.add_argument("--scroll-rounds", type=int, default=0)
    product_list.add_argument("--scroll-wait-ms", type=int, default=1200)
    product_list.add_argument("--read-more-clicks", type=int, default=0)
    product_list.add_argument("--dynamic-wait-ms", type=int, default=0)
    product_list.add_argument("--expand-category-pages", action="store_true")
    product_list.add_argument("--max-category-pages", type=int, default=8)
    add_common_options(product_list)

    product_detail = subparsers.add_parser("product-detail", help="Crawl and normalize one product detail page")
    product_detail.add_argument("--url", required=True)
    product_detail.add_argument("--max-reviews", type=int, default=10)
    add_common_options(product_detail)

    product_urls = subparsers.add_parser("product-urls", help="Crawl product detail pages from a URL file")
    product_urls.add_argument("--file", required=True)
    product_urls.add_argument("--limit", type=int)
    product_urls.add_argument("--batch-delay", type=float, default=3.0)
    product_urls.add_argument("--max-reviews", type=int, default=10)
    add_common_options(product_urls)

    reviews = subparsers.add_parser("reviews", help="Crawl product reviews from a public review/detail page")
    reviews.add_argument("--url", required=True)
    reviews.add_argument("--product-url", required=True)
    reviews.add_argument("--max-items", type=int, default=20)
    add_common_options(reviews)

    return parser


def main() -> int:
    if not os.environ.get("DATABASE_URL") and (ROOT / ".env").exists():
        for line in (ROOT / ".env").read_text(encoding="utf-8").splitlines():
            if line.startswith("DATABASE_URL="):
                os.environ["DATABASE_URL"] = line.split("=", 1)[1].strip().strip('"')

    parser = build_parser()
    args = parser.parse_args()

    if args.command == "product-list":
        return crawl_product_list(args)
    if args.command == "product-detail":
        return crawl_product_detail(args)
    if args.command == "product-urls":
        return crawl_product_urls(args)
    if args.command == "reviews":
        return crawl_reviews(args)

    parser.print_help()
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
