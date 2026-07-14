import json
import re
from html import unescape
from typing import Any
from urllib.parse import urljoin

from normalizer import compact_text


def html_text(response: Any) -> str:
    body = getattr(response, "body", None)
    if isinstance(body, bytes):
        encoding = getattr(response, "encoding", None) or "utf-8"
        return body.decode(encoding, errors="replace")

    html_content = getattr(response, "html_content", None)
    if isinstance(html_content, bytes):
        return html_content.decode("utf-8", errors="replace")
    if html_content:
        return str(html_content)

    value = getattr(response, "text", None)
    if callable(value):
        return str(value())
    if value is not None:
        return str(value)
    return str(response)


def first_match(patterns: list[str], html: str) -> str | None:
    for pattern in patterns:
        match = re.search(pattern, html, flags=re.IGNORECASE | re.DOTALL)
        if match:
            return compact_text(unescape(match.group(1)))
    return None


def meta_content(html: str, key: str) -> str | None:
    patterns = [
        rf'<meta[^>]+property=["\']{re.escape(key)}["\'][^>]+content=["\']([^"\']+)["\']',
        rf'<meta[^>]+name=["\']{re.escape(key)}["\'][^>]+content=["\']([^"\']+)["\']',
        rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']{re.escape(key)}["\']',
        rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']{re.escape(key)}["\']',
    ]
    return first_match(patterns, html)


def extract_json_ld(html: str) -> list[dict[str, Any]]:
    blocks = re.findall(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html,
        flags=re.IGNORECASE | re.DOTALL,
    )
    records: list[dict[str, Any]] = []
    for block in blocks:
        try:
            parsed = json.loads(unescape(block.strip()))
        except json.JSONDecodeError:
            continue

        if isinstance(parsed, list):
            records.extend([item for item in parsed if isinstance(item, dict)])
        elif isinstance(parsed, dict):
            graph = parsed.get("@graph")
            if isinstance(graph, list):
                records.extend([item for item in graph if isinstance(item, dict)])
            records.append(parsed)
    return records


def first_url(image: Any) -> str | None:
    if not isinstance(image, dict):
        return None
    urls = image.get("url_list")
    if isinstance(urls, list) and urls:
        return compact_text(urls[0])
    return compact_text(image.get("url"))


def extract_modern_router_data(html: str) -> dict[str, Any] | None:
    match = re.search(
        r'<script[^>]+id=["\']__MODERN_ROUTER_DATA__["\'][^>]*>(.*?)</script>',
        html,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if not match:
        return None

    try:
        return json.loads(unescape(match.group(1).strip()))
    except json.JSONDecodeError:
        return None


def find_tiktok_component_data(html: str, component_name: str) -> dict[str, Any] | None:
    data = extract_modern_router_data(html)
    if not data:
        return None

    loader_data = data.get("loaderData")
    if not isinstance(loader_data, dict):
        return None

    for page_data in loader_data.values():
        if not isinstance(page_data, dict):
            continue
        page_config = page_data.get("page_config")
        if not isinstance(page_config, dict):
            continue
        components = page_config.get("components_map")
        if not isinstance(components, list):
            continue
        for component in components:
            if not isinstance(component, dict):
                continue
            if component.get("component_name") == component_name:
                component_data = component.get("component_data")
                return component_data if isinstance(component_data, dict) else None
    return None


def enrich_with_tiktok_product_payload(raw: dict[str, Any], html: str) -> None:
    component = find_tiktok_component_data(html, "product_info")
    if not component:
        return

    categories = component.get("categories")
    product_info = component.get("product_info")
    review_info = component.get("review_info")
    shop_info = component.get("shop_info")

    product_model = product_info.get("product_model") if isinstance(product_info, dict) else None
    promotion_model = product_info.get("promotion_model") if isinstance(product_info, dict) else None
    review_model = product_info.get("review_model") if isinstance(product_info, dict) else None
    seller_model = product_info.get("seller_model") if isinstance(product_info, dict) else None

    if isinstance(product_model, dict):
        raw["external_id"] = product_model.get("product_id") or raw.get("external_id")
        raw["name"] = product_model.get("name") or raw.get("name")
        raw["sold_count"] = product_model.get("sold_count") or raw.get("sold_count")
        images = product_model.get("images")
        if isinstance(images, list) and images:
            raw["image_url"] = first_url(images[0]) or raw.get("image_url")

    if isinstance(categories, list) and categories:
        leaf = next((item for item in categories if isinstance(item, dict) and item.get("is_leaf")), None)
        category = leaf or categories[-1]
        if isinstance(category, dict):
            raw["category"] = category.get("category_name") or raw.get("category")

    price_info = None
    if isinstance(promotion_model, dict):
        product_price = promotion_model.get("promotion_product_price")
        if isinstance(product_price, dict):
            price_info = product_price.get("min_price")
            if not isinstance(price_info, dict):
                range_price = product_price.get("range_price")
                if isinstance(range_price, dict):
                    price_info = range_price
    if isinstance(price_info, dict):
        raw["price"] = (
            price_info.get("sale_price_decimal")
            or price_info.get("min_price_integer_part_format")
            or price_info.get("sale_price_format")
            or raw.get("price")
        )
        raw["currency"] = price_info.get("currency_name") or raw.get("currency")

    if isinstance(review_model, dict):
        raw["rating"] = review_model.get("product_overall_score") or raw.get("rating")
        raw["review_count"] = review_model.get("product_review_count") or raw.get("review_count")

    if isinstance(review_info, dict):
        ratings = review_info.get("review_ratings")
        if isinstance(ratings, dict):
            raw["rating"] = ratings.get("overall_score") or raw.get("rating")
            raw["review_count"] = ratings.get("review_count") or raw.get("review_count")
            rating_result = ratings.get("rating_result")
            if isinstance(rating_result, dict):
                raw["bad_review_count"] = int(rating_result.get("1") or 0) + int(
                    rating_result.get("2") or 0
                )
        raw_reviews = review_info.get("product_reviews")
        if isinstance(raw_reviews, list):
            raw["reviews"] = [
                {
                    "author": review.get("reviewer_name"),
                    "rating": review.get("review_rating"),
                    "content": review.get("review_text"),
                    "has_image": bool(review.get("review_images") or review.get("display_image_url")),
                    "has_video": bool(review.get("review_videos")),
                    "source": "tiktok",
                }
                for review in raw_reviews
                if isinstance(review, dict) and review.get("review_text")
            ]

    seller = shop_info if isinstance(shop_info, dict) else seller_model
    if isinstance(seller, dict):
        raw["shop_name"] = seller.get("shop_name") or raw.get("shop_name")
        raw["shop_url"] = seller.get("shop_link") or raw.get("shop_url")
        raw["shop_rating"] = seller.get("shop_rating") or raw.get("shop_rating")


def extract_product(html: str, url: str) -> dict[str, Any]:
    raw: dict[str, Any] = {
        "product_url": url,
        "name": meta_content(html, "og:title")
        or meta_content(html, "twitter:title")
        or first_match([r"<title[^>]*>(.*?)</title>"], html),
        "image_url": meta_content(html, "og:image") or meta_content(html, "twitter:image"),
        "price": meta_content(html, "product:price:amount"),
        "currency": meta_content(html, "product:price:currency"),
        "shop_name": meta_content(html, "og:site_name"),
        "rating": first_match([r'"ratingValue"\s*:\s*"?([0-9.]+)"?'], html),
        "review_count": first_match([r'"reviewCount"\s*:\s*"?([0-9,]+)"?'], html),
    }

    for record in extract_json_ld(html):
        record_type = record.get("@type")
        if isinstance(record_type, list):
            is_product = "Product" in record_type
        else:
            is_product = record_type == "Product"
        if not is_product:
            continue

        raw["name"] = raw.get("name") or record.get("name")
        image = record.get("image")
        if isinstance(image, list):
            raw["image_url"] = raw.get("image_url") or image[0]
        else:
            raw["image_url"] = raw.get("image_url") or image

        offers = record.get("offers")
        if isinstance(offers, list):
            offers = offers[0] if offers else None
        if isinstance(offers, dict):
            raw["price"] = raw.get("price") or offers.get("price")
            raw["currency"] = raw.get("currency") or offers.get("priceCurrency")

        aggregate = record.get("aggregateRating")
        if isinstance(aggregate, dict):
            raw["rating"] = raw.get("rating") or aggregate.get("ratingValue")
            raw["review_count"] = raw.get("review_count") or aggregate.get("reviewCount")

    enrich_with_tiktok_product_payload(raw, html)
    return raw


def extract_product_links(html: str, base_url: str, max_items: int) -> list[str]:
    decoded_html = html.replace("\\u002F", "/").replace("\\/", "/")
    hrefs = re.findall(r'href=["\']([^"\']+)["\']', decoded_html, flags=re.IGNORECASE)
    embedded_urls = re.findall(r'https?://[^"\'<>\s]+', decoded_html, flags=re.IGNORECASE)
    links: list[str] = []
    seen: set[str] = set()
    product_tokens = ["/pdp/", "/product", "/item", "/view/product", "product_id"]

    candidates = [*hrefs, *embedded_urls]
    for href in candidates:
        absolute = urljoin(base_url, unescape(href))
        lowered = absolute.lower()
        if not any(token in lowered for token in product_tokens):
            continue
        if "shop.tiktok.com" in lowered and "/c/" in lowered and "/pdp/" not in lowered:
            continue
        if absolute in seen:
            continue
        seen.add(absolute)
        links.append(absolute)
        if len(links) >= max_items:
            break
    return links


def extract_category_links(html: str, base_url: str, max_items: int = 20) -> list[str]:
    decoded_html = html.replace("\\u002F", "/").replace("\\/", "/")
    hrefs = re.findall(r'href=["\']([^"\']+)["\']', decoded_html, flags=re.IGNORECASE)
    embedded_urls = re.findall(r'https?://[^"\'<>\s]+', decoded_html, flags=re.IGNORECASE)
    links: list[str] = []
    seen: set[str] = set()

    component = find_tiktok_component_data(html, "categories_tab")
    if component:
        children = component.get("children")
        if isinstance(children, list):
            for child in children:
                if not isinstance(child, dict):
                    continue
                name = child.get("category_name_en")
                category_id = child.get("category_id")
                if not name or not category_id:
                    continue
                absolute = urljoin(base_url, f"/vn/c/{name}/{category_id}")
                if absolute not in seen:
                    seen.add(absolute)
                    links.append(absolute)
                if len(links) >= max_items:
                    return links

    for href in [*hrefs, *embedded_urls]:
        absolute = urljoin(base_url, unescape(href))
        lowered = absolute.lower()
        if "shop.tiktok.com/vn/c/" not in lowered or "/pdp/" in lowered:
            continue
        clean = absolute.split("?")[0]
        if clean in seen:
            continue
        seen.add(clean)
        links.append(clean)
        if len(links) >= max_items:
            break

    return links


def extract_reviews(html: str, source: str, max_items: int) -> list[dict[str, Any]]:
    component = find_tiktok_component_data(html, "product_info")
    if component:
        review_info = component.get("review_info")
        raw_reviews = review_info.get("product_reviews") if isinstance(review_info, dict) else None
        if isinstance(raw_reviews, list):
            return [
                {
                    "author": review.get("reviewer_name"),
                    "rating": review.get("review_rating"),
                    "content": review.get("review_text"),
                    "has_image": bool(review.get("review_images") or review.get("display_image_url")),
                    "has_video": bool(review.get("review_videos")),
                    "source": source,
                }
                for review in raw_reviews[:max_items]
                if isinstance(review, dict) and review.get("review_text")
            ]

    json_reviews: list[dict[str, Any]] = []
    for record in extract_json_ld(html):
        review = record.get("review")
        if isinstance(review, dict):
            review = [review]
        if not isinstance(review, list):
            continue
        for item in review:
            if not isinstance(item, dict):
                continue
            rating = item.get("reviewRating")
            json_reviews.append(
                {
                    "author": item.get("author", {}).get("name")
                    if isinstance(item.get("author"), dict)
                    else item.get("author"),
                    "rating": rating.get("ratingValue") if isinstance(rating, dict) else rating,
                    "content": item.get("reviewBody") or item.get("description"),
                    "source": source,
                }
            )
            if len(json_reviews) >= max_items:
                return json_reviews
    return json_reviews
