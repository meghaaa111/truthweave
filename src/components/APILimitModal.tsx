import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, X } from "lucide-react";

interface APILimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  retryAfter?: number;
}

const APILimitModal = ({ isOpen, onClose, retryAfter = 3600 }: APILimitModalProps) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="neuro-card max-w-md w-full p-8 relative">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 neuro-btn w-8 h-8 flex items-center justify-center !rounded-full !p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Icon */}
              <div className="neuro-icon-raised w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-orange-500">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>

              {/* Content */}
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                  API Limit Reached
                </h2>
                
                <p className="text-muted-foreground leading-relaxed">
                  We've reached our daily API quota limit. This helps us manage costs and ensure fair usage for all users.
                </p>

                <div className="neuro-inset p-4 rounded-xl">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Try again in approximately {formatTime(retryAfter)}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={onClose}
                    className="neuro-btn-blue w-full py-3 font-semibold text-base rounded-xl"
                  >
                    Got it
                  </button>
                  
                  <p className="text-xs text-muted-foreground">
                    Thank you for your understanding. We're working to increase our capacity.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default APILimitModal;