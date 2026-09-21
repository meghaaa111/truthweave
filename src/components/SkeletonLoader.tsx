import { motion } from "framer-motion";

const SkeletonLoader = () => (
  <div className="w-full max-w-3xl mx-auto space-y-6 p-4">
    {[1, 2, 3].map((i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.15 }}
        className="neuro-card p-6 space-y-4"
      >
        <div className="h-6 w-2/5 rounded-md neuro-inset !rounded-lg" />
        <div className="h-4 w-4/5 rounded-md neuro-inset !rounded-lg" />
        <div className="h-4 w-3/5 rounded-md neuro-inset !rounded-lg" />
      </motion.div>
    ))}
    <p className="text-center text-sm text-muted-foreground animate-pulse">
      Analyzing claim and gathering evidence…
    </p>
  </div>
);

export default SkeletonLoader;
