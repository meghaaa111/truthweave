import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Response types
export interface SourceDetail {
  title: string;
  url: string;
}

export interface TruthEngineResult {
  verdict: string;
  corrected_info: string;
  explanation: string;
  confidence: string;
  sources: SourceDetail[];
}

export interface AnalysisResponse {
  main_claim: string;
  truth_engine: TruthEngineResult;
  processing_time_ms: number;
}

// API functions
export const analyzeText = async (text: string): Promise<AnalysisResponse> => {
  try {
    const response = await apiClient.post<AnalysisResponse>('/analyze/text', { text });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to analyze text');
    }
    throw error;
  }
};

export const analyzeImage = async (file: File): Promise<AnalysisResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<AnalysisResponse>('/analyze/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to analyze image');
    }
    throw error;
  }
};

// Test endpoint
export const testConnection = async (): Promise<boolean> => {
  try {
    await apiClient.get('/');
    return true;
  } catch {
    return false;
  }
};
