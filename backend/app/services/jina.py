import asyncio
import logging

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)


class JinaError(RuntimeError):
    pass


async def fetch_markdown(url: str, *, timeout: float = 30.0, retries: int = 2) -> str:
    """Fetch a URL via r.jina.ai and return the markdown body."""
    settings = get_settings()
    target = f"{settings.jina_reader_base.rstrip('/')}/{url}"
    headers = {"Accept": "text/plain", "X-Return-Format": "markdown"}

    last_exc: Exception | None = None
    async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
        for attempt in range(retries + 1):
            try:
                resp = await client.get(target, headers=headers)
                if resp.status_code >= 500:
                    raise JinaError(f"Jina Reader {resp.status_code}")
                if resp.status_code != 200:
                    raise JinaError(
                        f"Jina Reader returned {resp.status_code}: {resp.text[:200]}"
                    )
                return resp.text
            except (httpx.HTTPError, JinaError) as exc:
                last_exc = exc
                if attempt >= retries:
                    break
                backoff = 2 ** attempt
                logger.warning("Jina fetch failed (attempt %d), retrying in %ds: %s", attempt + 1, backoff, exc)
                await asyncio.sleep(backoff)

    raise JinaError(f"Failed to fetch page: {last_exc}")
