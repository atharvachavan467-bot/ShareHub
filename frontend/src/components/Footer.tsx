import React from "react";
import { Link } from "react-router-dom";
import { Layers, ShieldCheck, Cpu, Award, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-surface-950/80 backdrop-blur-md pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-600 p-0.5 shadow-glow-brand flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white">
                Share<span className="text-brand-400">Hub</span> Labs
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Institutional equipment, high-precision laboratory resources, and cleanroom sharing network with algorithmic trust verification and collision-aware scheduling.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 pt-2 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                API Core Online (v1)
              </span>
              <span>•</span>
              <span>Port 8000 Proxy Connected</span>
            </div>
          </div>

          {/* Nav Quick Links */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[11px]">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/" className="hover:text-brand-300 transition-colors">
                  Explore Equipment Catalog
                </Link>
              </li>
              <li>
                <Link to="/dashboard/borrower" className="hover:text-brand-300 transition-colors">
                  Borrower Lifecycle Center
                </Link>
              </li>
              <li>
                <Link to="/dashboard/owner" className="hover:text-brand-300 transition-colors">
                  Owner Equipment Studio
                </Link>
              </li>
              <li>
                <Link to="/qualifications" className="hover:text-brand-300 transition-colors">
                  Safety Qualification Center
                </Link>
              </li>
              <li>
                <Link to="/incidents" className="hover:text-brand-300 transition-colors">
                  Dispute & Incident Records
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards & Reputation */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[11px]">
              Trust Safeguards
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Automated reputation algorithm actively updates member scores (+2 on-time return; -15 condition damages). All check-ins require multi-angle photographic evidence.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <span className="text-brand-400 font-semibold font-mono">Zero Collision Policy:</span> 100% collision-checked calendar reservation locks.
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ShareHub Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered for Academic Research & Institutional Equipment Efficiency
          </p>
        </div>
      </div>
    </footer>
  );
};
