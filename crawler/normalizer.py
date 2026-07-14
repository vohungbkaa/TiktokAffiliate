import re
from decimal import Decimal, InvalidOperation
from typing import Any


def compact_text(value: Any) -> str | None:
    if value is None:
        return None
    text = re.sub(r"\s+", " ", str(value)).strip()
    return text or None


def normalize_price(value: Any) -> Decimal | None:
    text = compact_text(value)
    if not text:
        return None

    cleaned = re.sub(r"[^\d.,]", "", text)
    if not cleaned:
        return None

    if "," in cleaned and "." in cleaned:
        cleaned = cleaned.replace(",", "")
    elif "," in cleaned:
        cleaned = cleaned.replace(",", ".")

    try:
        return Decimal(cleaned)
    except InvalidOperation:
        return None


def normalize_percent(value: Any) -> Decimal | None:
    text = compact_text(value)
    if not text:
        return None

    match = re.search(r"(\d+(?:[.,]\d+)?)", text)
    if not match:
        return None

    return normalize_price(match.group(1))


def normalize_count(value: Any) -> int:
    text = compact_text(value)
    if not text:
        return 0

    lowered = text.lower().replace(",", "").replace("+", "")
    match = re.search(r"(\d+(?:\.\d+)?)\s*([kmb])?", lowered)
    if not match:
        return 0

    number = float(match.group(1))
    suffix = match.group(2)
    multiplier = {"k": 1_000, "m": 1_000_000, "b": 1_000_000_000}.get(suffix, 1)
    return int(number * multiplier)


def normalize_rating(value: Any) -> float | None:
    text = compact_text(value)
    if not text:
        return None

    match = re.search(r"(\d+(?:[.,]\d+)?)", text)
    if not match:
        return None

    rating = float(match.group(1).replace(",", "."))
    return rating if 0 <= rating <= 5 else None


def normalize_product(raw: dict[str, Any], url: str, source: str) -> dict[str, Any]:
    name = compact_text(raw.get("name")) or compact_text(raw.get("title")) or url
    price = normalize_price(raw.get("price"))
    commission_rate = normalize_percent(raw.get("commission_rate"))
    commission_amount = normalize_price(raw.get("commission_amount"))

    return {
        "name": name,
        "productUrl": compact_text(raw.get("product_url")) or url,
        "externalId": compact_text(raw.get("external_id")),
        "imageUrl": compact_text(raw.get("image_url")),
        "category": compact_text(raw.get("category")),
        "shopName": compact_text(raw.get("shop_name")),
        "shopUrl": compact_text(raw.get("shop_url")),
        "price": str(price) if price is not None else None,
        "currency": compact_text(raw.get("currency")) or "USD",
        "commissionRate": str(commission_rate) if commission_rate is not None else None,
        "commissionAmount": str(commission_amount) if commission_amount is not None else None,
        "soldCount": normalize_count(raw.get("sold_count")),
        "rating": normalize_rating(raw.get("rating")),
        "reviewCount": normalize_count(raw.get("review_count")),
        "badReviewCount": normalize_count(raw.get("bad_review_count")),
        "shopRating": normalize_rating(raw.get("shop_rating")),
        "voucherInfo": compact_text(raw.get("voucher_info")),
        "shippingNote": compact_text(raw.get("shipping_note")),
        "rawSource": source,
    }


def normalize_review(raw: dict[str, Any]) -> dict[str, Any]:
    rating = normalize_rating(raw.get("rating"))
    return {
        "author": compact_text(raw.get("author")),
        "rating": rating,
        "content": compact_text(raw.get("content")) or "",
        "isBad": bool(rating is not None and rating <= 2),
        "hasImage": str(raw.get("has_image", "")).lower() in {"1", "true", "yes"},
        "hasVideo": str(raw.get("has_video", "")).lower() in {"1", "true", "yes"},
        "source": compact_text(raw.get("source")),
    }
