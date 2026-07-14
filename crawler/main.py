from dataclasses import dataclass

try:
    from scrapling.fetchers import Fetcher
except ImportError as exc:
    raise SystemExit(
        "Scrapling is not installed. Run: pip install -r crawler/requirements.txt"
    ) from exc


@dataclass
class CrawlerConfig:
    source: str = "manual-placeholder"


def main() -> None:
    config = CrawlerConfig()
    print(f"Crawler service ready for source: {config.source}")
    print(f"Fetcher available: {Fetcher.__name__}")


if __name__ == "__main__":
    main()
