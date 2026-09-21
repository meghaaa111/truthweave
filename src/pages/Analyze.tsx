import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Type, Image, Upload, X, ArrowRight, AlertCircle } from "lucide-react";
import HeroBackground from "@/components/HeroBackground";

interface AnalyzePageProps {
  onAnalyze: (input: { text: string | null; file: File | null }) => void;
}

const Analyze = ({ onAnalyze }: AnalyzePageProps) => {
  const [mode, setMode] = useState<"text" | "image">("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (f: File | null) => {
    setError("");
    if (!f) { setFile(null); setPreview(null); return; }
    if (f.size > 10 * 1024 * 1024) { setError("File must be under 10MB"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) { setError("Only JPG, PNG, or WebP accepted"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = () => {
    setError("");
    if (mode === "text") {
      if (text.trim().length < 10) { setError("Please enter at least 10 characters"); return; }
      onAnalyze({ text: text.trim(), file: null });
    } else {
      if (!file) { setError("Please upload an image"); return; }
      onAnalyze({ text: null, file });
    }
    navigate("/results");
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center py-12 pt-24 bg-neuro-bg">
      <HeroBackground />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Analyze a Claim
            </h1>
            <p className="text-muted-foreground">
              Enter text or upload an image containing a claim to fact-check.
            </p>
          </div>

          {/* Mode selector */}
          <div className="neuro-glass flex gap-2 p-1.5 mb-8 max-w-xs mx-auto !rounded-xl">
            {(["text", "image"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === m ? "neuro-btn-blue !rounded-lg" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "text" ? <Type className="h-4 w-4" /> : <Image className="h-4 w-4" />}
                {m === "text" ? "Text" : "Image"}
              </button>
            ))}
          </div>

          {/* Input area */}
          <div className="neuro-glass p-6">
            {mode === "text" ? (
              <div className="neuro-input p-4 !rounded-xl">
                <textarea
                  value={text}
                  onChange={(e) => { setText(e.target.value); setError(""); }}
                  placeholder="e.g., Drinking hot water cures COVID instantly..."
                  rows={6}
                  className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-base leading-relaxed"
                />
              </div>
            ) : (
              <div>
                {preview ? (
                  <div className="relative neuro-inset p-4 !rounded-xl">
                    <img src={preview} alt="Preview" className="w-full max-h-64 object-contain rounded-xl" />
                    <button
                      onClick={() => handleFileChange(null)}
                      className="absolute top-6 right-6 neuro-btn w-8 h-8 !rounded-full flex items-center justify-center !p-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full py-16 neuro-inset !rounded-xl flex flex-col items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <div className="neuro-icon-raised w-14 h-14">
                      <Upload className="h-7 w-7" />
                    </div>
                    <span className="text-sm font-medium">Click to upload or drag & drop</span>
                    <span className="text-xs">JPG, PNG, WebP — Max 10MB</span>
                  </button>
                )}
                <input ref={fileRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 mt-4 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              {mode === "text" && (
                <span className="text-xs text-muted-foreground">{text.length} characters</span>
              )}
              <div className={mode === "image" ? "w-full" : "ml-auto"}>
                <button
                  className={`neuro-btn-blue px-8 py-3 font-semibold text-base inline-flex items-center gap-2 rounded-xl ${mode === "image" ? "w-full justify-center" : ""}`}
                  onClick={handleSubmit}
                >
                  Analyze Claim
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analyze;
