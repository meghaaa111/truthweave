import re

def extract_main_claim(text: str) -> str:
    # A simple fallback pattern for claim extraction using basic regex and text operations.
    # In a full production system, spaCy could be used here to extract Subject-Verb-Object triples.
    sentences = re.split(r'(?<=[.!?]) +', text.strip())
    
    if sentences:
        main_claim = sentences[0]
        if len(main_claim) > 100:
            return main_claim[:100] + "..."
        return main_claim
        
    return "Unknown Claim"
