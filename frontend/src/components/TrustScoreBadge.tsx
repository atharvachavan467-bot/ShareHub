import React from "react";
import { ShieldCheck, ShieldAlert, ShieldX, Info } from "lucide-react";

interface TrustScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const TrustScoreBadge: React.FC<TrustScoreProps> = ({
  score = 100,
  size = "md",
  showLabel = true,
}) => {
  const getTier = (s: number) => {
    if (s >= 80) return { label: "Verified Pristine", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30", icon: ShieldCheck, ring: "#10b981" };
    if (s >= 50) return { label: "Standard", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30", icon: ShieldAlert, ring: "#f59e0b" };
    return { label: "At Risk", color: "text-rose-400", bg: "bg-rose-500/15 border-rose-500/30", icon: ShieldX, ring: "#ef4444" };
  };

  const tier = getTier(score);
  const Icon = tier.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1.5",
    md: "px-3 py-1 text-sm gap-2",
    lg: "px-4 py-2 text-base gap-2.5",
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-full border backdrop-blur-md font-medium transition-all ${tier.bg} ${tier.color} ${sizeClasses}`}
      title={`Trust Score: ${score}/100 (${tier.label}). Automated algorithm: +2 for on-time undamaged return, -15 for damage/overdue.`}
    >
      <Icon className={size === "sm" ? "w-3.5 h-3.5" : size === "md" ? "w-4 h-4" : "w-5 h-5"} />
      <span className="font-semibold tracking-wide font-mono">{score}</span>
      {showLabel && (
        <span className="text-[11px] uppercase tracking-wider opacity-90 hidden sm:inline">
          {tier.label}
        </span>
      )}
    </div>
  );
};

export const TrustScoreGauge: React.FC<{ score: number }> = ({ score = 100 }) => {
  const percentage = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = 283 - (283 * percentage) / 100;

  const getColor = (s: number) => {
    if (s >= 80) return "#10b981"; // emerald
    if (s >= 50) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const strokeColor = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-card rounded-2xl relative overflow-hidden">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="8"
          />
          {/* Animated Value Arc */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="transparent"
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray="264"
            strokeDashoffset={264 - (264 * percentage) / 100}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${strokeColor}88)`,
            }}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{score}</span>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">/ 100 PTS</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-700/60 bg-slate-800/50">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: strokeColor }} />
          <span>{score >= 80 ? "Tier 1: High Trust" : score >= 50 ? "Tier 2: Standard" : "Tier 3: Gated"}</span>
        </div>
        <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
          Determines your eligibility to reserve restricted precision labs & high-value equipment without manual supervisor signoff.
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 w-full text-[11px] text-slate-400 space-y-1">
        <div className="flex justify-between items-center text-emerald-400/90">
          <span>On-Time Return</span>
          <span className="font-mono font-semibold">+2 pts</span>
        </div>
        <div className="flex justify-between items-center text-rose-400/90">
          <span>Damaged Return / Overdue</span>
          <span className="font-mono font-semibold">-15 pts</span>
        </div>
        <div className="flex justify-between items-center text-amber-400/90">
          <span>Dispute Penalty</span>
          <span className="font-mono font-semibold">-5 pts</span>
        </div>
      </div>
    </div>
  );
};
