import os
import httpx
from fastapi import HTTPException

from dotenv import load_dotenv

def get_hf_token():
    """Get HF token at runtime after dotenv is loaded"""
    load_dotenv(override=True)
    return os.getenv("HUGGING_FACE_TOKEN", "").strip()

# Model definitions
FAKE_NEWS_MODEL = "mrm8488/bert-mini-finetuned-fake-news"
AI_DETECT_MODEL = "roberta-base-openai-detector"
TEXT_GEN_MODEL = "HuggingFaceH4/zephyr-7b-beta"
OCR_MODEL = "microsoft/trocr-base-printed"
ZERO_SHOT_MODEL = "facebook/bart-large-mnli"

async def query_hf_api(model_id: str, payload: dict) -> dict:
    headers = {"Authorization": f"Bearer {get_hf_token()}"}
    api_url = f"https://api-inference.huggingface.co/models/{model_id}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(api_url, headers=headers, json=payload, timeout=15.0)
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 503:
                # Model is loading
                raise HTTPException(status_code=503, detail=f"Model {model_id} is currently loading on Hugging Face. Try again in 20 seconds.")
            else:
                return {"error": response.text, "status_code": response.status_code}
        except HTTPException:
            raise  # Let HTTPException propagate
        except Exception as e:
            return {"error": str(e)}

async def query_hf_api_binary(model_id: str, file_data: bytes) -> dict:
    headers = {"Authorization": f"Bearer {get_hf_token()}"}
    api_url = f"https://api-inference.huggingface.co/models/{model_id}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(api_url, headers=headers, content=file_data, timeout=20.0)
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 503:
                raise HTTPException(status_code=503, detail=f"Model {model_id} is currently loading. Try again.")
            else:
                return {"error": response.text, "status_code": response.status_code}
        except HTTPException:
            raise  # Let HTTPException propagate
        except Exception as e:
            return {"error": str(e)}
