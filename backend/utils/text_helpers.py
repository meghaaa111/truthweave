import re

def clean_text(text: str) -> str:
    # simple text cleaner
    text = text.strip()
    text = re.sub(r'\s+', ' ', text)
    return text
