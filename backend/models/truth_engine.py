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

def search_ddg_lite(query: str, max_results: int = 6) -> list[dict]:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://lite.duckduckgo.com/",
    }
    results = []
    try:
        url = "https://lite.duckduckgo.com/lite/"
        response = httpx.post(url, data={"q": query}, headers=headers, timeout=10.0, follow_redirects=True)
        if response.status_code == 200:
            content = response.text
            link_pattern = re.compile(r"<a[^>]+href=[\"']([^\"']+)[\"'][^>]*class=[\"']result-link[\"'][^>]*>(.*?)</a>", re.DOTALL | re.IGNORECASE)
            snippet_pattern = re.compile(r"<td[^>]*class=[\"']result-snippet[\"'][^>]*>(.*?)</td>", re.DOTALL | re.IGNORECASE)
            
            links = link_pattern.findall(content)
            snippets = snippet_pattern.findall(content)
            
            seen_urls = set()
            for idx, (raw_url, raw_title) in enumerate(links):
                actual_url = raw_url
                if "uddg=" in raw_url:
                    parsed = urllib.parse.parse_qs(urllib.parse.urlparse(raw_url).query)
                    if "uddg" in parsed:
                        actual_url = parsed["uddg"][0]
                
                if actual_url in seen_urls or not actual_url.startswith("http"):
                    continue
                seen_urls.add(actual_url)
                
                title = html.unescape(re.sub(r'<[^>]+>', '', raw_title)).strip()
                snippet = ""
                if idx < len(snippets):
                    snippet = html.unescape(re.sub(r'<[^>]+>', '', snippets[idx])).strip()
                
                if title:
                    results.append({
                        "title": title,
                        "snippet": snippet,
                        "url": actual_url
                    })
                if len(results) >= max_results:
                    break
    except Exception as e:
        print(f"[DDG Lite Search Error] {e}")
    return results

def search_ddg_package(query: str, max_results: int = 5) -> list[dict]:
    results = []
    if not DDGS:
        return results
    try:
        d = DDGS()
        raw = list(d.news(query, max_results=max_results))
        for r in raw:
            results.append({
                "title": r.get('title', ''),
                "snippet": r.get('body', ''),
                "url": r.get('url', '') or r.get('href', '')
            })
    except Exception as e:
        print(f"[DDGS Package Error] {e}")
    return results

async def fetch_web_evidence(claim: str) -> list[dict]:
    # 1. Primary search using DuckDuckGo Lite
    results = await asyncio.to_thread(search_ddg_lite, claim, 6)
    
    # 2. Fallback query if direct sentence search returned few/no results
    if not results:
        # Simplify claim: remove punctuation and common conversational words
        cleaned_query = re.sub(r'[^\w\s]', '', claim)
        cleaned_query = re.sub(r'\b(is|the|are|was|were|a|an|that|this)\b', ' ', cleaned_query, flags=re.IGNORECASE)
        cleaned_query = ' '.join(cleaned_query.split())
        if cleaned_query and cleaned_query.lower() != claim.lower():
            results = await asyncio.to_thread(search_ddg_lite, cleaned_query, 6)
            
    # 3. Fallback to DDG News / Package search if still empty
    if not results and DDGS:
        results = await asyncio.to_thread(search_ddg_package, claim, 5)
        
    return results

def filter_trusted(results: list[dict]):
    if not results:
        return [], "low"
    
    trusted = [r for r in results if is_trusted(r.get("url", ""))]
    if trusted:
        confidence = "high" if len(trusted) >= 2 else "medium"
        # Prioritize trusted sources first, then remaining results
        remaining = [r for r in results if r not in trusted]
        return trusted + remaining, confidence
    
    return results, "medium" if len(results) >= 3 else "low"

async def run_gemini(claim: str, snippets: list[dict]) -> dict:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-2.5-flash", generation_config={"temperature": 0.1})
    
    if not snippets:
        return {
            "verdict": "UNVERIFIABLE",
            "explanation": "No relevant search results found to verify the claim.",
            "corrected_info": "We could not find strong evidence supporting or refuting this claim."
        }

    sources_text = "\n".join(f"{i+1}. [{s.get('title', 'Source')}]({s.get('url', '')}): {s.get('snippet', '')}" for i, s in enumerate(snippets))
    
    prompt = f"""You are TruthWeave, an intelligent real-time fact-checking system.

Claim to verify: "{claim}"

Live Web Sources:
{sources_text}

Instructions:
1. Verify whether the claim is TRUE, FALSE, MISLEADING, or UNVERIFIABLE using the live web sources provided above.
2. If the claim is inaccurate or outdated, explicitly state the current accurate facts (including names, positions, or events) from the sources.
3. Respond STRICTLY in the following format:

VERDICT: [TRUE / FALSE / MISLEADING / UNVERIFIABLE]
EXPLANATION: [2-3 sentences explaining the verdict based on the evidence]
TRUTH: [1-2 clear sentences stating the corrected and accurate information]"""
    
    try:
        response = await asyncio.to_thread(model.generate_content, prompt)
        if not response or not response.text:
            return {
                "verdict": "UNVERIFIABLE",
                "explanation": "Failed to analyze claim.",
                "corrected_info": "Could not connect to Gemini reasoning engine."
            }
        
        lines = response.text.strip()
        verdict = ""
        explanation = ""
        correction = ""
        
        # Parse output markers
        if "VERDICT:" in lines or "Verdict:" in lines:
            tag = "VERDICT:" if "VERDICT:" in lines else "Verdict:"
            after_verdict = lines.split(tag, 1)[1]
            
            exp_tag = None
            for candidate in ["EXPLANATION:", "Explanation:", "Reason:", "REASON:"]:
                if candidate in after_verdict:
                    exp_tag = candidate
                    break
            
            if exp_tag:
                verdict = after_verdict.split(exp_tag, 1)[0].strip()
                after_exp = after_verdict.split(exp_tag, 1)[1]
                
                truth_tag = None
                for candidate in ["TRUTH:", "Truth:", "Correction:", "CORRECTION:"]:
                    if candidate in after_exp:
                        truth_tag = candidate
                        break
                
                if truth_tag:
                    explanation = after_exp.split(truth_tag, 1)[0].strip()
                    correction = after_exp.split(truth_tag, 1)[1].strip()
                else:
                    explanation = after_exp.strip()
            else:
                verdict = after_verdict.strip()
        
        # Normalize verdict string
        v_upper = verdict.upper()
        if "FALSE" in v_upper:
            normalized_verdict = "FALSE"
        elif "TRUE" in v_upper and "MISLEADING" not in v_upper:
            normalized_verdict = "TRUE"
        elif "MISLEADING" in v_upper:
            normalized_verdict = "MISLEADING"
        else:
            normalized_verdict = "UNVERIFIABLE"
            
        return {
            "verdict": normalized_verdict,
            "explanation": explanation or "Claim analyzed based on web evidence.",
            "corrected_info": correction or "Check verified sources for additional details."
        }
    except Exception as e:
        print("[Gemini Processing Error]", e)
        return {
            "verdict": "UNVERIFIABLE",
            "explanation": "Failed to analyze claim due to API error.",
            "corrected_info": "Could not connect to Gemini reasoning engine."
        }

async def run_gemini_no_sources(claim: str) -> dict:
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.5-flash", generation_config={"temperature": 0.2})
        prompt = f"""Claim: {claim}

No external web sources were reachable. Based on your knowledge:
1. Is this claim TRUE, FALSE, MISLEADING, or UNVERIFIABLE?
2. In 2-3 sentences, explain why.
3. What is the correct information? (1-2 plain language sentences)

Format:
VERDICT: [one word]
EXPLANATION: [2-3 sentences]
TRUTH: [1-2 sentences]"""
        
        response = await asyncio.to_thread(model.generate_content, prompt)
        if not response or not response.text:
            return {"verdict": "UNVERIFIABLE", "explanation": "Failed to analyze claim.", "corrected_info": "Could not connect to Gemini reasoning engine."}
        
        lines = response.text.strip()
        verdict = ""
        explanation = ""
        correction = ""
        
        if "VERDICT:" in lines or "Verdict:" in lines:
            tag = "VERDICT:" if "VERDICT:" in lines else "Verdict:"
            after_verdict = lines.split(tag, 1)[1]
            exp_tag = "EXPLANATION:" if "EXPLANATION:" in after_verdict else "Explanation:"
            if exp_tag in after_verdict:
                verdict = after_verdict.split(exp_tag, 1)[0].strip()
                after_exp = after_verdict.split(exp_tag, 1)[1]
                truth_tag = "TRUTH:" if "TRUTH:" in after_exp else "Truth:"
                if truth_tag in after_exp:
                    explanation = after_exp.split(truth_tag, 1)[0].strip()
                    correction = after_exp.split(truth_tag, 1)[1].strip()
                else:
                    explanation = after_exp.strip()
            else:
                verdict = after_verdict.strip()
        
        v_upper = verdict.upper()
        if "FALSE" in v_upper:
            normalized_verdict = "FALSE"
        elif "TRUE" in v_upper:
            normalized_verdict = "TRUE"
        elif "MISLEADING" in v_upper:
            normalized_verdict = "MISLEADING"
        else:
            normalized_verdict = "UNVERIFIABLE"
            
        return {
            "verdict": normalized_verdict,
            "explanation": explanation or "Unable to parse explanation.",
            "corrected_info": correction or "Unable to determine correct information."
        }
    except Exception as e:
        print("[Gemini No-Sources Error]", e)
        return {
            "verdict": "UNVERIFIABLE",
            "explanation": "Failed to analyze claim due to API error.",
            "corrected_info": "Could not connect to Gemini reasoning engine."
        }

async def hybrid_truth_engine(claim: str) -> dict:
    results = await fetch_web_evidence(claim)
    filtered, confidence = filter_trusted(results)

    if not results:
        gemini_out = await run_gemini_no_sources(claim)
        return {**gemini_out, "confidence": "low", "sources": []}

    out = await run_gemini(claim, filtered[:5])
    # Return up to 4 top sources with title and url
    sources = [{"title": r["title"], "url": r["url"]} for r in filtered[:4] if r.get("title") and r.get("url")]
    return {**out, "confidence": confidence, "sources": sources}
