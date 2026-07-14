import hashlib
import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4


ROOT = Path(__file__).resolve().parents[1]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def cuid() -> str:
    return f"py_{uuid4().hex}"


def database_path() -> Path:
    database_url = os.environ.get("DATABASE_URL", "file:./dev.db")
    if not database_url.startswith("file:"):
        raise RuntimeError("Crawler MVP supports SQLite DATABASE_URL only.")

    raw_path = database_url.removeprefix("file:")
    path = Path(raw_path)
    if path.is_absolute():
        return path
    return ROOT / "prisma" / path


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(database_path())
    conn.row_factory = sqlite3.Row
    return conn


def json_text(payload: object) -> str:
    return json.dumps(payload, ensure_ascii=False, sort_keys=True)


def content_hash(payload: object) -> str:
    return hashlib.sha256(json_text(payload).encode("utf-8")).hexdigest()


class CrawlStore:
    def __init__(self) -> None:
        self.conn = connect()

    def close(self) -> None:
        self.conn.close()

    def create_job(self, source: str, job_type: str, target_url: str) -> str:
        job_id = cuid()
        timestamp = now_iso()
        self.conn.execute(
            """
            INSERT INTO CrawlJob
              (id, source, jobType, status, targetUrl, attemptCount, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (job_id, source, job_type, "pending", target_url, 0, timestamp, timestamp),
        )
        self.conn.commit()
        return job_id

    def start_job(self, job_id: str, attempt_count: int) -> None:
        timestamp = now_iso()
        self.conn.execute(
            """
            UPDATE CrawlJob
            SET status = ?, startedAt = ?, attemptCount = ?, updatedAt = ?
            WHERE id = ?
            """,
            ("running", timestamp, attempt_count, timestamp, job_id),
        )
        self.conn.commit()

    def finish_job(self, job_id: str, status: str, error: str | None = None) -> None:
        timestamp = now_iso()
        self.conn.execute(
            """
            UPDATE CrawlJob
            SET status = ?, completedAt = ?, finishedAt = ?, error = ?, errorMessage = ?, updatedAt = ?
            WHERE id = ?
            """,
            (status, timestamp, timestamp, error, error, timestamp, job_id),
        )
        self.conn.commit()

    def upsert_product(self, data: dict[str, object]) -> str:
        existing = self.conn.execute(
            "SELECT id FROM Product WHERE productUrl = ?",
            (data["productUrl"],),
        ).fetchone()
        timestamp = now_iso()
        fields = [
            "name",
            "productUrl",
            "externalId",
            "imageUrl",
            "category",
            "shopName",
            "shopUrl",
            "price",
            "currency",
            "commissionRate",
            "commissionAmount",
            "soldCount",
            "rating",
            "reviewCount",
            "badReviewCount",
            "shopRating",
            "voucherInfo",
            "shippingNote",
            "rawSource",
        ]

        if existing:
            assignments = ", ".join([f"{field} = ?" for field in fields if field != "productUrl"])
            update_values = [data.get(field) for field in fields if field != "productUrl"]
            self.conn.execute(
                f"""
                UPDATE Product
                SET {assignments}, lastCrawledAt = ?, updatedAt = ?
                WHERE productUrl = ?
                """,
                [*update_values, timestamp, timestamp, data["productUrl"]],
            )
            self.conn.commit()
            return str(existing["id"])

        product_id = cuid()
        values = [data.get(field) for field in fields]
        self.conn.execute(
            f"""
            INSERT INTO Product
              (id, {", ".join(fields)}, status,
               lastCrawledAt, createdAt, updatedAt)
            VALUES ({", ".join(["?"] * (len(fields) + 5))})
            """,
            [
                product_id,
                *values,
                "new",
                timestamp,
                timestamp,
                timestamp,
            ],
        )
        self.conn.commit()
        return product_id

    def add_snapshot(
        self,
        *,
        product_id: str | None,
        crawl_job_id: str,
        source: str,
        target_url: str,
        source_url: str,
        payload: object,
    ) -> None:
        timestamp = now_iso()
        self.conn.execute(
            """
            INSERT INTO RawCrawlSnapshot
              (id, productId, crawlJobId, source, sourceUrl, targetUrl, contentHash,
               payload, rawPayload, capturedAt, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                cuid(),
                product_id,
                crawl_job_id,
                source,
                source_url,
                target_url,
                content_hash(payload),
                json_text(payload),
                json_text(payload),
                timestamp,
                timestamp,
            ),
        )
        self.conn.commit()

    def add_review(self, product_id: str, review: dict[str, object]) -> None:
        content = review.get("content")
        if not content:
            return

        timestamp = now_iso()
        self.conn.execute(
            """
            INSERT INTO ProductReview
              (id, productId, author, rating, content, isBad, hasImage, hasVideo,
               source, capturedAt, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                cuid(),
                product_id,
                review.get("author"),
                review.get("rating"),
                content,
                1 if review.get("isBad") else 0,
                1 if review.get("hasImage") else 0,
                1 if review.get("hasVideo") else 0,
                review.get("source"),
                timestamp,
                timestamp,
            ),
        )
        self.conn.commit()
