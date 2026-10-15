import os
import math
from urllib.parse import urlparse
from fastapi import APIRouter, HTTPException, status
import httpx
from bs4 import BeautifulSoup

from app.config import settings
from app.core.ssrf_validator import validate_target_url
from app.schemas.content import ContentExtractRequest, ContentExtractResponse

router = APIRouter(prefix="/content", tags=["Content Reader"])

@router.post("/extract", response_model=ContentExtractResponse)
async def extract_accessible_content(payload: ContentExtractRequest):
    """
    Extracts readable text and semantic structure from a public URL for Supported Integration Mode.
    Applies strict SSRF checks, request timeouts, and size limits.
    """
    is_valid, validated_url, err_msg = validate_target_url(payload.url)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Security policy blocked URL: {err_msg}. Please consider using Assist Mode (Option A) to visit the site directly."
        )

    parsed = urlparse(validated_url)

    # Handle local test fixture exemption
    if parsed.hostname in ("127.0.0.1", "localhost") and "/static/test_pages/" in parsed.path:
        filename = os.path.basename(parsed.path)
        static_file_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), "static", "test_pages", filename
        )
        if os.path.exists(static_file_path):
            with open(static_file_path, "r", encoding="utf-8") as f:
                raw_html = f.read()
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Local test fixture '{filename}' not found."
            )
    else:
        headers = {
            "User-Agent": "AccessAbleAI-AccessibleReader/1.0 (+https://accessable.ai/reader; accessibility-bot)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }
        try:
            async with httpx.AsyncClient(
                follow_redirects=True,
                timeout=settings.SCAN_TIMEOUT_SECONDS,
                limits=httpx.Limits(max_keepalive_connections=3, max_connections=5),
            ) as client:
                resp = await client.get(validated_url, headers=headers)
                if len(resp.content) > settings.MAX_RESPONSE_SIZE_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"Website content exceeds maximum size limit ({settings.MAX_RESPONSE_SIZE_BYTES // (1024*1024)}MB)."
                    )
                if resp.status_code >= 400:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Target website returned HTTP error {resp.status_code}. You may still use Assist Mode (Option A) to browse directly."
                    )
                raw_html = resp.text
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail=f"Connection to '{validated_url}' timed out after {settings.SCAN_TIMEOUT_SECONDS}s."
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to retrieve target website: {str(e)}"
            )

    soup = BeautifulSoup(raw_html, "html.parser")

    # Extract Page Title
    title = ""
    title_tag = soup.find("title")
    if title_tag and title_tag.string:
        title = title_tag.string.strip()
    if not title:
        h1_tag = soup.find("h1")
        if h1_tag:
            title = h1_tag.get_text().strip()
    if not title:
        title = parsed.netloc

    # Extract Meta Description
    meta_desc = None
    meta_tag = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
    if meta_tag and meta_tag.get("content"):
        meta_desc = meta_tag["content"].strip()

    # Remove non-content and clutter elements
    for element in soup(["script", "style", "noscript", "iframe", "svg", "nav", "footer", "header", "aside", "form"]):
        element.decompose()

    # Find main article or content body
    main_candidate = (
        soup.find("article") or
        soup.find("main") or
        soup.find(attrs={"role": "main"}) or
        soup.find(id=lambda x: x and ("content" in x.lower() or "article" in x.lower() or "post" in x.lower())) or
        soup.body or
        soup
    )

    # Collect headings
    headings = []
    for h in main_candidate.find_all(["h1", "h2", "h3"]):
        h_text = h.get_text().strip()
        if h_text and len(h_text) < 120:
            headings.append(h_text)

    # Build clean accessible HTML tags
    clean_blocks = []
    plain_text_parts = []

    for elem in main_candidate.find_all(["h1", "h2", "h3", "h4", "p", "ul", "ol", "blockquote"]):
        text = elem.get_text().strip()
        if not text or len(text) < 3:
            continue

        tag_name = elem.name
        if tag_name in ("h1", "h2", "h3", "h4"):
            clean_blocks.append(f"<{tag_name} class=\"text-xl font-bold my-4 text-slate-900 dark:text-white\">{text}</{tag_name}>")
            plain_text_parts.append(text + "\n")
        elif tag_name == "p":
            clean_blocks.append(f"<p class=\"my-3 text-base leading-relaxed text-slate-700 dark:text-slate-300\">{text}</p>")
            plain_text_parts.append(text + "\n")
        elif tag_name in ("ul", "ol"):
            items = elem.find_all("li")
            if items:
                li_html = "".join([f"<li class=\"my-1\">{li.get_text().strip()}</li>" for li in items if li.get_text().strip()])
                clean_blocks.append(f"<{tag_name} class=\"list-disc list-inside my-3 text-base leading-relaxed text-slate-700 dark:text-slate-300\">{li_html}</{tag_name}>")
                plain_text_parts.append("\n".join([li.get_text().strip() for li in items]) + "\n")
        elif tag_name == "blockquote":
            clean_blocks.append(f"<blockquote class=\"border-l-4 border-brand-500 pl-4 py-1 italic my-4 text-slate-600 dark:text-slate-400\">{text}</blockquote>")
            plain_text_parts.append(text + "\n")

    readable_html = "\n".join(clean_blocks)
    plain_text = "\n".join(plain_text_parts).strip()

    if not plain_text:
        # Fallback to general stripped body text if structure was irregular
        plain_text = main_candidate.get_text(separator="\n", strip=True)
        paragraphs = [p.strip() for p in plain_text.split("\n") if len(p.strip()) > 20]
        readable_html = "\n".join([f"<p class=\"my-3 text-base leading-relaxed text-slate-700 dark:text-slate-300\">{p}</p>" for p in paragraphs])

    word_count = len(plain_text.split())
    # Average reading speed is ~200 words per minute
    estimated_read_time = max(1, math.ceil(word_count / 200))

    return ContentExtractResponse(
        url=validated_url,
        title=title,
        meta_description=meta_desc,
        readable_html=readable_html,
        plain_text=plain_text,
        headings=headings[:12],
        word_count=word_count,
        estimated_read_time_minutes=estimated_read_time,
        supported=True,
        notice="Extracted for accessible distraction-free reading. Content remains copyright of original publisher."
    )
