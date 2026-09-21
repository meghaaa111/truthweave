import io
import os
import asyncio
from dotenv import load_dotenv
from PIL import Image
import google.generativeai as genai
from models.hf_api import query_hf_api_binary, OCR_MODEL, get_hf_token

async def extract_text_with_gemini(file_data: bytes) -> str:
    load_dotenv(override=True)
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return ""
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        # Load image via PIL to validate and format
        img = Image.open(io.BytesIO(file_data))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
            
        prompt = (
            "You are an OCR extraction engine. Extract and transcribe ALL text, captions, headlines, statements, or claims visible in this image accurately and completely. "
            "Return ONLY the transcribed text verbatim. If there is no readable text in the image, reply with NO_TEXT."
        )
        
        response = await asyncio.to_thread(model.generate_content, [prompt, img])
        if response and response.text:
            text = response.text.strip()
            if text and "NO_TEXT" not in text:
                return text
    except Exception as e:
        print("[Gemini OCR Error]", e)
    return ""

async def extract_text_from_image(file_data: bytes) -> str:
    # 1. Try Gemini Vision first (extremely accurate for all images, screenshots, memes, docs)
    gemini_text = await extract_text_with_gemini(file_data)
    if gemini_text:
        return gemini_text

    # 2. Fallback to Hugging Face OCR if token is available
    hf_token = get_hf_token()
    if hf_token:
        try:
            result = await query_hf_api_binary(OCR_MODEL, file_data)
            if isinstance(result, list) and len(result) > 0:
                text = result[0].get("generated_text", "").strip()
                if text:
                    return text
            elif isinstance(result, dict) and "error" in result:
                print("OCR HF API Error:", result["error"])
        except Exception as e:
            print("OCR HF parse error:", e)
        
    return ""

