import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, RotateCcw, Clock, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";
import VerdictBadge from "@/components/VerdictBadge";
import SourceCard from "@/components/SourceCard";
import SkeletonLoader from "@/components/SkeletonLoader";
import ApiLimitAlert from "@/components/ApiLimitAlert";
import { analyzeText, analyzeImage } from "@/lib/api";

interface AnalysisInput {
  text: string | null;
  file: File | null;
}

interface TruthEngine {
  verdict: "TRUE" | "FALSE" | "MISLEADING" | "UNVERIFIABLE";
  corrected_info: string;
  explanation: string;
  confidence: "high" | "medium" | "low";
  sources: { title: string; url: string }[];
}

interface AnalysisResult {
  main_claim: string;
  truth_engine: TruthEngine;
  processing_time_ms: number;
}

const Results = ({ inputData }: { inputData: AnalysisInput | null }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showApiLimitAlert, setShowApiLimitAlert] = useState(false);
  const navigate = useNavigate();

  const analyzeData = async () => {
    if (!inputData) {
      navigate("/analyze");
      return;
    }

    setLoading(true);
    setError(null);
    setShowApiLimitAlert(false);

    try {
      let result;
      if (inputData.text) {
        result = await analyzeText(inputData.text);
      } else if (inputData.file) {
        result = await analyzeImage(inputData.file);
      } else {
        throw new Error("No input provided");
      }

      setData(result);
    } catch (err: unknown) {
      console.error("Analysis error:", err);
      const errorMessage = err instanceof Error ? err.message : "Analysis failed. Please try again.";
      
      // Check if it's a rate limit error
      if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("rate limit")) {
        setShowApiLimitAlert(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeData();
  }, [inputData, navigate]);

  useEffect(() => {
    if (data && data.truth_engine.verdict === "TRUE" && data.truth_engine.confidence === "high") {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [data]);

  const handleDownload = () => {
    if (!data) return;
    const s = data.truth_engine;
    const report = `TruthWeave Analysis Report\n${"=".repeat(40)}\n\nClaim: ${data.main_claim}\nVerdict: ${s.verdict}\nConfidence: ${s.confidence}\n\nExplanation:\n${s.explanation}\n\nCorrected Info:\n${s.corrected_info}\n\nSources:\n${s.sources.map((src) => `- ${src.title}: ${src.url}`).join("\n")}\n\nProcessing Time: ${data.processing_time_ms}ms`;
    const blob = new Blob([report], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "truthweave-report.txt";
    a.click();
  };

  const handleShare = async () => {
    if (!data) return;
    const text = `TruthWeave Verdict: ${data.truth_engine.verdict}\nClaim: ${data.main_claim}`;
    if (navigator.share) {
      await navigator.share({ title: "TruthWeave Report", text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  if (showApiLimitAlert) {
    return (
      <AnimatePresence>
        <ApiLimitAlert
          onRetry={analyzeData}
          onClose={() => navigate("/analyze")}
        />
      </AnimatePresence>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 pt-24 bg-neuro-bg">
        <SkeletonLoader />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 pt-24 bg-neuro-bg">
        <div className="text-center max-w-md mx-auto px-4 neuro-card p-10">
          <h2 className="text-2xl font-bold text-foreground mb-4">Analysis Failed</h2>
          <p className="text-muted-foreground mb-6">{error || "Unable to analyze the content. Please try again."}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="neuro-btn-blue px-6 py-3 font-semibold" onClick={analyzeData}>
              Try Again
            </button>
            <button className="neuro-btn px-6 py-3 font-semibold text-foreground" onClick={() => navigate("/analyze")}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 pt-24 bg-neuro-bg">
      <div className="container mx-auto px-4 max-w-4xl">
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                <div className="neuro-icon-raised w-16 h-16 mx-auto">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
              </motion.div>
              <h1 className="text-3xl font-bold text-foreground">Analysis Complete</h1>
              <div className="neuro-badge-inset inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Processed in {(data.processing_time_ms / 1000).toFixed(1)}s
              </div>
            </div>

            {/* Claim card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="neuro-card p-6"
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Claim Analyzed</p>
              <p className="text-lg font-medium text-foreground leading-relaxed">"{data.main_claim}"</p>
              <div className="mt-4">
                <VerdictBadge verdict={data.truth_engine.verdict} size="lg" />
              </div>
            </motion.div>

            {/* Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="neuro-card p-6 space-y-5"
            >
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">Explanation</h3>
                <p className="text-muted-foreground leading-relaxed">{data.truth_engine.explanation}</p>
              </div>
              <div className="neuro-divider" />
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">Corrected Information</h3>
                <p className="text-muted-foreground leading-relaxed">{data.truth_engine.corrected_info}</p>
              </div>
            </motion.div>

            {/* Sources */}
            {data.truth_engine.sources.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="neuro-card p-6"
              >
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                  Sources ({data.truth_engine.sources.length})
                </h3>
                <div className="space-y-3">
                  {data.truth_engine.sources.map((src, i) => (
                    <SourceCard key={i} source={src} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-3 justify-center"
            >
              <button className="neuro-btn px-8 py-3 font-semibold text-foreground inline-flex items-center gap-2 rounded-xl" onClick={handleDownload}>
                <Download className="h-4 w-4" /> Download Report
              </button>
              <button className="neuro-btn px-8 py-3 font-semibold text-foreground inline-flex items-center gap-2 rounded-xl" onClick={handleShare}>
                <Share2 className="h-4 w-4" /> Share
              </button>
              <button className="neuro-btn-blue px-8 py-3 font-semibold inline-flex items-center gap-2 rounded-xl" onClick={() => navigate("/analyze")}>
                <RotateCcw className="h-4 w-4" /> New Analysis
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Results;