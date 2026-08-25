import { CheckCircle, XCircle, AlertTriangle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Verdict = "TRUE" | "FALSE" | "MISLEADING" | "UNVERIFIABLE";

const config: Record<Verdict, { icon: typeof CheckCircle; color: string; label: string }> = {
  TRUE: { icon: CheckCircle, color: "text-emerald", label: "Verified True" },
  FALSE: { icon: XCircle, color: "text-destructive", label: "False" },
  MISLEADING: { icon: AlertTriangle, color: "text-amber", label: "Misleading" },
  UNVERIFIABLE: { icon: HelpCircle, color: "text-muted-foreground", label: "Unverifiable" },
};

const VerdictBadge = ({ verdict, size = "md" }: { verdict: Verdict; size?: "sm" | "md" | "lg" }) => {
  const c = config[verdict] || config.UNVERIFIABLE;
  const Icon = c.icon;
  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  return (
    <span className={cn("neuro-badge-inset inline-flex items-center font-semibold !rounded-full", c.color, sizes[size])}>
      <Icon className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      {c.label}
    </span>
  );
};

export default VerdictBadge;
