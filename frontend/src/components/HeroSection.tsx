import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ThreeCanvas } from "./ThreeCanvas";
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Activity,
  CheckCircle,
  Cpu,
  Zap,
  Lock,
  BarChart3,
} from "lucide-react";

const FEATURE_CHIPS = [
  { icon: ShieldCheck, label: "Trust-Scored", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/25" },
  { icon: Lock, label: "Safety Gated", color: "text-brand-400", bg: "bg-brand-400/10 border-brand-400/25" },
  { icon: Zap, label: "Collision-Free", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/25" },
  { icon: BarChart3, label: "Fully Audited", color: "text-accent-400", bg: "bg-accent-400/10 border-accent-400/25" },
];

export const HeroSection: React.FC<{ onExploreClick?: () => void }> = ({ onExploreClick }) => {
  const beamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (beamRef.current) {
        beamRef.current.style.opacity = "0";
        setTimeout(() => {
          if (beamRef.current) beamRef.current.style.opacity = "1";
        }, 1000);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center pt-8 pb-20 lg:py-0 border-b border-slate-800/60">
      {/* ── Layered Background ── */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Large ambient orbs */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/8 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-600/8 rounded-full blur-[80px] pointer-events-none" style={{ animationDelay: "2s" }} />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />

      {/* Scanning Beam */}
      <div
        ref={beamRef}
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent pointer-events-none transition-opacity duration-1000"
        style={{ top: "35%", animation: "scanLine 8s linear infinite" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[80vh]">

          {/* ── Left: Value Proposition ── */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 backdrop-blur-md text-xs font-semibold text-brand-300 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Next-Gen Institutional Resource Sharing Platform</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
                Shared Lab
                <br />
                Resources.
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05]">
                <span className="gradient-text-vibrant">Auditable Trust.</span>
              </h1>
            </div>

            {/* Subhead */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Eliminate lab bottlenecks with real-time collision-aware scheduling,
              strict safety qualification gating, photo-verified check-ins, and
              automated{" "}
              <span className="text-emerald-400 font-semibold">reputation scoring</span>.
            </p>

            {/* Feature Chips Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
              {FEATURE_CHIPS.map(({ icon: Icon, label, color, bg }) => (
                <span
                  key={label}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${bg} ${color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <button
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 hover:from-brand-500 hover:to-accent-500 shadow-glow-brand hover:shadow-glow-brand-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 text-sm shine-effect"
              >
                <span>Explore Lab Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/dashboard/borrower"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-slate-200 glass-card hover:text-white border-slate-700/60 transition-all text-sm"
              >
                <Activity className="w-4 h-4 text-brand-400" />
                <span>My Bookings</span>
              </Link>

              <Link
                to="/dashboard/owner"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all text-sm"
              >
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>List Equipment</span>
              </Link>
            </div>

            {/* Key Metrics Grid */}
            <div className="pt-6 grid grid-cols-3 gap-5 border-t border-slate-800/80 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
              <div className="text-center lg:text-left">
                <p className="text-2xl xl:text-3xl font-black font-mono text-white tabular-nums">100%</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Collision-Free</p>
                <div className="w-8 h-0.5 bg-gradient-to-r from-brand-500 to-transparent mt-1.5 mx-auto lg:mx-0" />
              </div>
              <div className="text-center lg:text-left">
                <p className="text-2xl xl:text-3xl font-black font-mono text-emerald-400 tabular-nums">+2 / −15</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Trust Score Δ</p>
                <div className="w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent mt-1.5 mx-auto lg:mx-0" />
              </div>
              <div className="text-center lg:text-left">
                <p className="text-2xl xl:text-3xl font-black font-mono text-accent-400">6-Photo</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Condition Audit</p>
                <div className="w-8 h-0.5 bg-gradient-to-r from-accent-500 to-transparent mt-1.5 mx-auto lg:mx-0" />
              </div>
            </div>
          </div>

          {/* ── Right: 3D Canvas + Floating HUD Elements ── */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Outer ring glow */}
            <div className="absolute -inset-8 rounded-full bg-brand-500/5 blur-2xl pointer-events-none animate-pulse-glow" />

            {/* 3D Canvas Card */}
            <div className="w-full max-w-[430px] aspect-square rounded-[2rem] glass-card relative overflow-hidden border border-slate-700/60 p-2 shadow-2xl animate-fade-in-scale" style={{ animationDelay: "0.4s" }}>
              {/* Scanline overlay inside canvas */}
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-[1.8rem]">
                <div
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-400/20 to-transparent"
                  style={{ animation: "scanLine 4s linear infinite" }}
                />
              </div>

              <ThreeCanvas className="w-full h-full rounded-[1.6rem]" />

              {/* Corner decorations */}
              <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-brand-400/60 rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-brand-400/60 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-brand-400/60 rounded-bl-lg" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-brand-400/60 rounded-br-lg" />

              {/* Floating HUD: Trust Score */}
              <div className="absolute top-5 left-5 glass-modal px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-lg border border-emerald-500/30 animate-float-slow z-20">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest leading-none">
                    Trust Engine
                  </p>
                  <p className="text-sm font-black text-white mt-0.5">Score: 100</p>
                </div>
              </div>

              {/* Floating HUD: Zero Collisions */}
              <div className="absolute bottom-5 right-5 glass-modal px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-lg border border-brand-500/30 animate-float-reverse z-20">
                <div className="w-9 h-9 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest leading-none">
                    Booking Safety
                  </p>
                  <p className="text-sm font-black text-white mt-0.5">0 Conflicts</p>
                </div>
              </div>

              {/* Floating HUD: Live Activity */}
              <div className="absolute bottom-5 left-5 glass-modal px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg border border-amber-500/30 animate-float-slow z-20" style={{ animationDelay: "3s" }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
                <p className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">Live</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
