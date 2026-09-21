import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import CountUp from "react-countup";

const getColor = (value: number) => {
  if (value >= 70) return "hsl(var(--tw-emerald))";
  if (value >= 40) return "hsl(var(--tw-amber))";
  return "hsl(var(--tw-rose))";
};

const ScoreRing = ({ value, label, size = 120 }: { value: number; label: string; size?: number }) => {
  const color = getColor(value);

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{ width: size, height: size }}>
        <CircularProgressbar
          value={value}
          text=""
          styles={buildStyles({
            pathColor: color,
            trailColor: "hsl(var(--border))",
            pathTransitionDuration: 1.5,
          })}
          strokeWidth={8}
        />
        <div className="relative -mt-[70%] flex items-center justify-center" style={{ height: "40%" }}>
          <span className="text-2xl font-bold text-foreground">
            <CountUp end={value} duration={1.5} />
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
};

export default ScoreRing;
