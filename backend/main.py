import os
import time
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load env variables first
load_dotenv(override=True)

def is_demo_mode() -> bool:
    return os.getenv("DEMO_MODE", "true").strip().lower() in ("true", "1", "yes")

# Import models after dotenv is loaded
from models.claim_extractor import extract_main_claim
from models.truth_engine import hybrid_truth_engine
from utils.ocr import extract_text_from_image
from utils.text_helpers import clean_text

app = FastAPI(title="TruthWeave API", description="AI-powered misinformation detection system.")

# Enable CORS for the frontend - fixed credentials issue
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "https://truthweave-k687.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "TruthWeave API is running", "demo_mode": is_demo_mode()}

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
        extra = "ignore"  # Ignore extra fields from Gemini

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

def generate_demo_results(text: str, processing_delay_ms: int = 150) -> AnalysisResponse:
    """Demo mode with hardcoded responses"""
    time.sleep(processing_delay_ms / 1000.0)
    
    if "covid" in text.lower() or "cure" in text.lower():
        return AnalysisResponse(
            main_claim="Drinking hot water cures COVID instantly.",
            truth_engine=TruthEngineResult(
                verdict="FALSE",
                corrected_info="No scientific evidence supports hot water as a COVID treatment. WHO recommends vaccination and approved antivirals.",
                explanation="This claim matches a known misinformation pattern circulated during the COVID-19 pandemic. Multiple health authorities have explicitly refuted it. The claim uses absolute language ('instantly', 'cures') which is a red flag for medical misinformation.",
                confidence="high",
                sources=[
                    SourceDetail(title="WHO: Myth busters", url="https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters"),
                    SourceDetail(title="CDC COVID-19 FAQs", url="https://www.cdc.gov/coronavirus/2019-ncov/faq.html")
                ]
            ),
            processing_time_ms=processing_delay_ms
        )
    elif "moon landing" in text.lower() and "fake" in text.lower():
        return AnalysisResponse(
            main_claim="The moon landing was faked.",
            truth_engine=TruthEngineResult(
                verdict="FALSE",
                corrected_info="Multiple space agencies and independent lunar reflections verify the Apollo missions. Physical evidence includes moon rocks, retroreflectors, and independent tracking data.",
                explanation="This conspiracy theory has been thoroughly debunked. Extensive photographic, video, and physical evidence proves humans walked on the moon. The claim contradicts established historical consensus and relies on debunked visual anomalies.",
                confidence="high",
                sources=[SourceDetail(title="NASA Apollo Missions", url="https://www.nasa.gov/")]
            ),
            processing_time_ms=processing_delay_ms
        )
    elif "water boils at 100" in text.lower():
        return AnalysisResponse(
            main_claim="Water boils at 100 degrees Celsius at sea level.",
            truth_engine=TruthEngineResult(
                verdict="TRUE",
                corrected_info="This is a scientifically accurate statement. Water boils at 100°C (212°F) at standard atmospheric pressure (sea level).",
                explanation="This is a well-established scientific fact. The boiling point of water at sea level is precisely defined and universally accepted in physics and chemistry.",
                confidence="high",
                sources=[]
            ),
            processing_time_ms=processing_delay_ms
        )
    else:
        return AnalysisResponse(
            main_claim=f"{text[:80]}..." if len(text) > 80 else text,
            truth_engine=TruthEngineResult(
                verdict="UNVERIFIABLE",
                corrected_info="This claim could not be fully verified against our database. Proceed with caution and cross-reference with trusted sources.",
                explanation="The specific details lack strong corroboration from trusted sources. Manual fact-checking is recommended before sharing this information.",
                confidence="low",
                sources=[]
            ),
            processing_time_ms=processing_delay_ms
        )

@app.post("/analyze/text", response_model=AnalysisResponse)
async def analyze_text(request: TextRequest):
    start_time = time.time()
    text = validate_text(request.text)
    
    if is_demo_mode():
        return generate_demo_results(text, processing_delay_ms=150)
    
    text = clean_text(text)
    
    # Extract main claim and run truth engine
    main_claim = extract_main_claim(text)
    truth_result = await hybrid_truth_engine(main_claim)
    
    # Filter out any extra fields that Gemini might add
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
    start_time = time.time()
    
    content = await file.read()
    
    if is_demo_mode():
        text = "Drinking hot water cures COVID instantly"
        return generate_demo_results(text, processing_delay_ms=300)
    
    text = await extract_text_from_image(content)
    
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Could not detect or extract readable text from the uploaded image. Please ensure the image contains clear text.")
        
    # Reuse the text analysis logic
    request = TextRequest(text=text)
    return await analyze_text(request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
