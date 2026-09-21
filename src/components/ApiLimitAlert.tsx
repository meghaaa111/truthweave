import { motion } from "framer-motion";
import { AlertTriangle, Clock, RefreshCw } from "lucide-react";

interface ApiLimitAlertProps {
  onRetry: () => void;
  onClose: () => void;
}

const ApiLimitAlert = ({ onRetry, onClose }: ApiLimitAlertProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="neuro-card p-8 max-w-md w-full mx-auto text-center space-y-6"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="neuro-icon-raised w-20 h-20 mx-auto"
        >
          <AlertTriangle className="h-10 w-10 text-amber-500" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-foreground"
        >
          API Limit Reached
        </motion.h2>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <p className="text-muted-foreground leading-relaxed">
            We've reached our API quota limit for now. This helps us maintain service quality for all users.
          </p>
          <div className="neuro-badge-inset inline-flex items-center gap-2 px-4 py-2 text-sm text-amber-600">
            <Clock className="h-4 w-4" />
            Try again in 1 hour
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 pt-4"
        >
          <button
            onClick={onRetry}
            className="neuro-btn-blue px-6 py-3 font-semibold inline-flex items-center justify-center gap-2 rounded-xl flex-1"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <button
            onClick={onClose}
            className="neuro-btn px-6 py-3 font-semibold text-foreground rounded-xl flex-1"
          >
            Close
          </button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-muted-foreground pt-2 border-t border-border/30"
        >
          Our AI fact-checking service uses advanced models that have usage limits to ensure fair access for everyone.
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ApiLimitAlert;