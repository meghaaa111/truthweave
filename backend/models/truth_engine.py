import httpx
import os
import re
import html
import urllib.parse
import asyncio
import google.generativeai as genai

try:
    from duckduckgo_search import DDGS
except ImportError:
    try:
        from ddgs import DDGS
    except ImportError:
        DDGS = None

TRUSTED_DOMAINS = [
    "who.int", "cdc.gov", "nih.gov", "reuters.com", "bbc.com", "apnews.com",
    "factcheck.org", "snopes.com", "thehindu.com", "ndtv.com", "pib.gov.in",
    "healthline.com", "mayoclinic.org", "wikipedia.org", "indianexpress.com",
    "hindustantimes.com", "timesofindia.indiatimes.com", "jagranjosh.com",
    "gov.in", ".gov", ".edu", ".org", "altnews.in", "boomlive.in"
]

def is_trusted(url: str) -> bool:
    url_lower = url.lower()
    return any(d in url_lower for d in TRUSTED_DOMAINS)


# ─── Search Strategies ────────────────────────────────────────────────────────

def search_ddg_package(query: str, max_results: int = 8) -> list[dict]:
    """Use the duckduckgo-search package to fetch text results."""
    results = []
    if not DDGS:
        return results
    try:
        d = DDGS()
        # Try text search first (richer snippets)
        raw = list(d.text(query, max_results=max_results))
        for r in raw:
            url = r.get("href", "") or r.get("url", "")
            title = r.get("title", "")
            snippet = r.get("body", "")
            if url and title:
                results.append({"title": title, "snippet": snippet, "url": url})
    except Exception as e:
        print(f"[DDGS text error] {e}")

    # If text search returned nothing, try news
    if not results:
        try:
            d2 = DDGS()
            raw2 = list(d2.news(query, max_results=max_results))
            for r in raw2:
                url = r.get("url", "") or r.get("href", "")
                title = r.get("title", "")
                snippet = r.get("body", "")
                if url and title:
                    results.append({"title": title, "snippet": snippet, "url": url})
        except Exception as e:
            print(f"[DDGS news error] {e}")

    return results


def search_ddg_lite(query: str, max_results: int = 6) -> list[dict]:
    """Scrape DuckDuckGo Lite as a fallback."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://lite.duckduckgo.com/",
    }
    results = []
    try:
        response = httpx.post(
            "https://lite.duckduckgo.com/lite/",
            data={"q": query},
            headers=headers,
            timeout=10.0,
            follow_redirects=True,
        )
        if response.status_code == 200:
            content = response.text
            link_pattern = re.compile(
                r'<a[^>]+href=["\']([^"\']+)["\'][^>]*class=["\']result-link["\'][^>]*>(.*?)</a>',
                re.DOTALL | re.IGNORECASE,
            )
            snippet_pattern = re.compile(
                r'<td[^>]*class=["\']result-snippet["\'][^>]*>(.*?)</td>',
                re.DOTALL | re.IGNORECASE,
            )
            links = link_pattern.findall(content)
            snippets = snippet_pattern.findall(content)
            seen_urls: set = set()
            for idx, (raw_url, raw_title) in enumerate(links):
                actual_url = raw_url
                if "uddg=" in raw_url:
                    parsed = urllib.parse.parse_qs(urllib.parse.urlparse(raw_url).query)
                    if "uddg" in parsed:
                        actual_url = parsed["uddg"][0]
                if actual_url in seen_urls or not actual_url.startswith("http"):
                    continue
                seen_urls.add(actual_url)
                title = html.unescape(re.sub(r"<[^>]+>", "", raw_title)).strip()
                snippet = ""
                if idx < len(snippets):
                    snippet = html.unescape(re.sub(r"<[^>]+>", "", snippets[idx])).strip()
                if title:
                    results.append({"title": title, "snippet": snippet, "url": actual_url})
                if len(results) >= max_results:
                    break
    except Exception as e:
        print(f"[DDG Lite Search Error] {e}")
    return results


async def fetch_web_evidence(claim: str) -> list[dict]:
    """Fetch evidence using package search first, then lite scraper as fallback."""
    # Strategy 1: DDGS package (most reliable)
    results = await asyncio.to_thread(search_ddg_package, claim, 8)

    # Strategy 2: DDG Lite scraper as backup
    if not results:
        results = await asyncio.to_thread(search_ddg_lite, claim, 6)

    # Strategy 3: Simplified keyword query if still empty
    if not results:
        cleaned = re.sub(r"[^\w\s]", "", claim)
        cleaned = re.sub(
            r"\b(is|the|are|was|were|a|an|that|this|it|does|do|can|will)\b",
            " ",
            cleaned,
            flags=re.IGNORECASE,
        )
        cleaned = " ".join(cleaned.split())
        if cleaned and cleaned.lower() != claim.lower():
            results = await asyncio.to_thread(search_ddg_package, cleaned, 6)

    return results


def filter_trusted(results: list[dict]):
    if not results:
        return [], "low"
    trusted = [r for r in results if is_trusted(r.get("url", ""))]
    if trusted:
        confidence = "high" if len(trusted) >= 2 else "medium"
        remaining = [r for r in results if r not in trusted]
        return trusted + remaining, confidence
    return results, "medium" if len(results) >= 3 else "low"


# ─── Gemini AI Reasoning ──────────────────────────────────────────────────────

def _build_model() -> genai.GenerativeModel:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable is not set on Render.")
    genai.configure(api_key=api_key)
    
    # Try gemini-3.6-flash first, then fallback to gemini-3.7-flash
    models_to_try = ["gemini-3.6-flash", "gemini-3.7-flash"]
    last_err = None
    for m in models_to_try:
        try:
            model = genai.GenerativeModel(m, generation_config={"temperature": 0.1})
            return model
        except Exception as e:
            last_err = e
            continue
    return genai.GenerativeModel("gemini-3.6-flash", generation_config={"temperature": 0.1})


def _parse_gemini_response(text: str) -> dict:
    """Parse VERDICT / EXPLANATION / TRUTH from Gemini output reliably."""
    verdict = ""
    explanation = ""
    correction = ""

    # Strip markdown bold markers
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text).strip()

    # Extract VERDICT
    m_verdict = re.search(r"VERDICT\s*:\s*(.+?)(?=\n|EXPLANATION|TRUTH|$)", text, re.IGNORECASE)
    if m_verdict:
        verdict = m_verdict.group(1).strip().rstrip(".")

    # Extract EXPLANATION
    m_exp = re.search(r"EXPLANATION\s*:\s*(.*?)(?=TRUTH\s*:|$)", text, re.IGNORECASE | re.DOTALL)
    if m_exp:
        explanation = m_exp.group(1).strip()

    # Extract TRUTH
    m_truth = re.search(r"TRUTH\s*:\s*(.*?)$", text, re.IGNORECASE | re.DOTALL)
    if m_truth:
        correction = m_truth.group(1).strip()

    # Normalize verdict
    v_upper = verdict.upper()
    if "FALSE" in v_upper:
        normalized = "FALSE"
    elif "MISLEADING" in v_upper:
        normalized = "MISLEADING"
    elif "TRUE" in v_upper:
        normalized = "TRUE"
    else:
        normalized = "UNVERIFIABLE"

    return {
        "verdict": normalized,
        "explanation": explanation or text[:300],
        "corrected_info": correction or "Refer to the linked sources for verified information.",
    }


async def run_gemini(claim: str, snippets: list[dict]) -> dict:
    try:
        model = _build_model()
    except RuntimeError as e:
        return {
            "verdict": "UNVERIFIABLE",
            "explanation": str(e),
            "corrected_info": "Please set the GEMINI_API_KEY environment variable in your Render service settings.",
        }

    sources_text = "\n".join(
        f"{i+1}. [{s.get('title', 'Source')}]({s.get('url', '')}): {s.get('snippet', '')}"
        for i, s in enumerate(snippets)
    ) if snippets else "No web sources retrieved."

    prompt = f"""You are TruthWeave, a precise AI fact-checking system.

Claim to verify: "{claim}"

Web Evidence:
{sources_text}

Task: Determine if the above claim is TRUE, FALSE, MISLEADING, or UNVERIFIABLE.
- Base your verdict on the claim itself and the web evidence above.
- Be specific to THIS claim — do not substitute a related or similar claim.
- If web evidence is not directly relevant, use your knowledge but state that clearly.

Respond in EXACTLY this format (no extra text before VERDICT):

VERDICT: [TRUE / FALSE / MISLEADING / UNVERIFIABLE]
EXPLANATION: [2-3 sentences explaining your verdict specifically about this claim]
TRUTH: [1-2 sentences with the accurate, corrected information]"""

    try:
        response = await asyncio.to_thread(model.generate_content, prompt)
        if not response or not response.text:
            return {
                "verdict": "UNVERIFIABLE",
                "explanation": "Gemini returned an empty response.",
                "corrected_info": "Please try again.",
            }
        print(f"[Gemini raw response] {response.text[:300]}")
        return _parse_gemini_response(response.text)
    except Exception as e:
        print(f"[Gemini Processing Error] {e}")
        return {
            "verdict": "UNVERIFIABLE",
            "explanation": f"Gemini API error: {str(e)}",
            "corrected_info": "Check your GEMINI_API_KEY and Render environment variables.",
        }


async def run_gemini_no_sources(claim: str) -> dict:
    try:
        model = _build_model()
    except RuntimeError as e:
        return {
            "verdict": "UNVERIFIABLE",
            "explanation": str(e),
            "corrected_info": "Please set the GEMINI_API_KEY on your Render service.",
        }

    prompt = f"""You are TruthWeave, a precise AI fact-checking system.

Claim: "{claim}"

No web search results were available. Fact-check this claim using your training knowledge.
- Be specific to THIS exact claim. Do not substitute with a similar claim.
- Definitions and factual statements should be classified as TRUE.

Respond in EXACTLY this format:

VERDICT: [TRUE / FALSE / MISLEADING / UNVERIFIABLE]
EXPLANATION: [2-3 sentences explaining your verdict for this specific claim]
TRUTH: [1-2 sentences with the accurate information]"""

    try:
        response = await asyncio.to_thread(model.generate_content, prompt)
        if not response or not response.text:
            return {
                "verdict": "UNVERIFIABLE",
                "explanation": "Gemini returned an empty response.",
                "corrected_info": "Please try again.",
            }
        print(f"[Gemini no-sources raw] {response.text[:300]}")
        return _parse_gemini_response(response.text)
    except Exception as e:
        print(f"[Gemini No-Sources Error] {e}")
        return {
            "verdict": "UNVERIFIABLE",
            "explanation": f"Gemini API error: {str(e)}",
            "corrected_info": "Check your GEMINI_API_KEY and Render environment variables.",
        }


# ─── Main Orchestrator ────────────────────────────────────────────────────────

async def hybrid_truth_engine(claim: str) -> dict:
    results = await fetch_web_evidence(claim)
    filtered, confidence = filter_trusted(results)

    if not results:
        print(f"[hybrid_truth_engine] No web results for: {claim!r} — using Gemini knowledge only")
        gemini_out = await run_gemini_no_sources(claim)
        return {**gemini_out, "confidence": "low", "sources": []}

    print(f"[hybrid_truth_engine] {len(results)} web results, {len(filtered)} after trust filter")
    out = await run_gemini(claim, filtered[:5])
    sources = [
        {"title": r["title"], "url": r["url"]}
        for r in filtered[:4]
        if r.get("title") and r.get("url")
    ]
    return {**out, "confidence": confidence, "sources": sources}
