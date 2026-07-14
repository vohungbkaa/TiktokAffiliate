try:
    import scrapling
except ImportError as exc:
    raise SystemExit(
        "Scrapling is not installed. Run: pip install -r crawler/requirements.txt"
    ) from exc

print(f"Scrapling import ok: {getattr(scrapling, '__version__', 'unknown')}")
