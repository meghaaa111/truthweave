# TruthWeave - Full Stack Setup Guide

## Project Structure
```
truth-seeker-ai/
├── frontend (root) → React + Vite + TypeScript
├── backend/        → FastAPI + Python
└── .env            → Environment variables
```

## Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- npm or yarn

## Installation

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 3. Configure Environment Variables

#### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

#### Backend (backend/.env)
```
DEMO_MODE=true
GEMINI_API_KEY=your_gemini_api_key_here
HUGGING_FACE_TOKEN=your_huggingface_token_here
```

## Running the Application

### Option 1: Run Both Servers Together (Recommended)
```bash
npm run dev:all
```
Or simply double-click `start.bat` on Windows.

### Option 2: Run Servers Separately

#### Terminal 1 - Frontend
```bash
npm run dev
```
Frontend will run on: http://localhost:8080

#### Terminal 2 - Backend
```bash
npm run dev:backend
```
Backend will run on: http://localhost:8000

## API Endpoints

### Backend (FastAPI)
- `GET /` - Health check
- `POST /analyze/text` - Analyze text for misinformation
- `POST /analyze/image` - Extract and analyze text from images

### Frontend API Client
Located in `src/lib/api.ts` - uses axios for all API calls with proper error handling.

## Features Implemented

✅ Backend API with FastAPI
✅ CORS configuration for frontend-backend communication
✅ Axios integration for API calls
✅ Error handling in frontend
✅ Environment variables for API URL
✅ Proxy setup in Vite for development
✅ Scripts to run both servers simultaneously
✅ Demo mode for testing without API keys

## Demo Mode

The backend runs in DEMO_MODE by default, which returns hardcoded responses for testing. To use real AI models:
1. Get API keys from Google (Gemini) and Hugging Face
2. Update `backend/.env` with your keys
3. Set `DEMO_MODE=false`

## Troubleshooting

### Backend not connecting
- Ensure Python dependencies are installed
- Check if port 8000 is available
- Verify backend/.env file exists

### Frontend API errors
- Check if backend is running on port 8000
- Verify VITE_API_URL in .env
- Check browser console for CORS errors

### CORS issues
- Backend allows origins: localhost:8080, localhost:5173, localhost:3000
- Add more origins in `backend/main.py` if needed

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Axios
- TailwindCSS
- Framer Motion

### Backend
- FastAPI
- Python 3.10
- Pydantic
- Google Gemini AI
- DuckDuckGo Search
