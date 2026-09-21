import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Compass } from "lucide-react";
import HeroBackground from "@/components/HeroBackground";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-neuro-bg p-4">
      <HeroBackground />
      <div className="relative z-10 text-center max-w-md w-full neuro-card p-10">
        <div className="neuro-icon-raised w-20 h-20 mx-auto mb-6">
          <Compass className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-5xl font-extrabold gradient-text mb-2">404</h1>
        <h2 className="text-xl font-bold text-foreground mb-2">Page Not Found</h2>
        <p className="text-sm text-muted-foreground mb-8">
          The verification path you were looking for doesn't exist or has moved.
        </p>
        <Link to="/">
          <button className="neuro-btn-blue px-6 py-3 font-semibold text-sm inline-flex items-center gap-2 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
            Return to Home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
