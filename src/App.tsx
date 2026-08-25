import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Landing from "@/pages/Landing";
import Analyze from "@/pages/Analyze";
import Results from "@/pages/Results";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

interface AnalysisInput {
  text: string | null;
  file: File | null;
}

const App = () => {
  const [analysisInput, setAnalysisInput] = useState<AnalysisInput | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/analyze" element={<Analyze onAnalyze={setAnalysisInput} />} />
            <Route path="/results" element={<Results inputData={analysisInput} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
