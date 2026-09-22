import os
import time
import re
import asyncio
import json
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load env variables first
load_dotenv(override=True)

# Import models after dotenv is loaded
from models.claim_extractor import extract_main_claim
from models.truth_engine import hybrid_truth_engine
from utils.ocr import extract_text_from_image
from utils.text_helpers import clean_text

app = FastAPI(title="TruthWeave API", description="AI-powered misinformation detection system.")

# Enable CORS for frontend and Chrome extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    has_key = bool(os.getenv("GEMINI_API_KEY"))
    return {
        "status": "ok",
        "message": "TruthWeave API is running",
        "gemini_key_set": has_key
    }

class TextRequest(BaseModel):
    text: str

class SourceDetail(BaseModel):
    title: str
    url: str

class TruthEngineResult(BaseModel):
    verdict: str
    corrected_info: str
    explanation: str
    confidence: str
    sources: list[SourceDetail]

    class Config:
        extra = "ignore"

class AnalysisResponse(BaseModel):
    main_claim: str
    truth_engine: TruthEngineResult
    processing_time_ms: int

def validate_text(text: str):
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Empty input provided")
    if len(text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Input too short to analyze")
    return text.strip()

@app.post("/analyze/text", response_model=AnalysisResponse)
async def analyze_text(request: TextRequest):
    start_time = time.time()
    text = validate_text(request.text)
    text = clean_text(text)

    # Extract main claim and run truth engine
    main_claim = extract_main_claim(text)
    truth_result = await hybrid_truth_engine(main_claim)

    filtered_truth_result = TruthEngineResult(
        verdict=truth_result.get("verdict", "UNVERIFIABLE"),
        corrected_info=truth_result.get("corrected_info", ""),
        explanation=truth_result.get("explanation", ""),
        confidence=truth_result.get("confidence", "low"),
        sources=truth_result.get("sources", [])
    )

    calc_time = int((time.time() - start_time) * 1000)

    return AnalysisResponse(
        main_claim=main_claim,
        truth_engine=filtered_truth_result,
        processing_time_ms=calc_time
    )


@app.post("/analyze/image", response_model=AnalysisResponse)
async def analyze_image(file: UploadFile = File(...)):
    content = await file.read()

    text = await extract_text_from_image(content)

    if not text or not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not detect or extract readable text from the uploaded image. Please ensure the image contains clear text."
        )

    request = TextRequest(text=text)
    return await analyze_text(request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
