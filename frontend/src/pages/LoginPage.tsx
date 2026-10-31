import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Layers, Lock, Mail, ArrowRight, Sparkles, UserCheck, Eye, EyeOff } from "lucide-react";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = identifier.trim();
    if (!trimmed || !password) return;

    setIsLoading(true);
    try {
      await login({
        email: trimmed,
        username: trimmed,
        password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      // Toast displayed by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setIsLoading(true);
    try {
      await login({
        email: demoEmail,
        username: demoEmail,
        password: demoPass,
      });
      navigate(from, { replace: true });
    } catch (err) {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute w-[600px] h-[600px] bg-brand-500/8 rounded-full blur-[80px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-glow" />
      <div className="absolute w-[350px] h-[350px] bg-accent-500/8 rounded-full blur-[60px] pointer-events-none -bottom-20 -right-10" />
      <div className="absolute w-[250px] h-[250px] bg-brand-400/5 rounded-full blur-[40px] pointer-events-none -top-10 -left-10 animate-float-slow" />

      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-brand-400/40 pointer-events-none"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `float ${4 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}

      <div className="w-full max-w-md relative z-10 animate-fade-in-scale">
        {/* Card */}
        <div className="glass-modal p-8 rounded-3xl border border-slate-700/60 shadow-2xl">
          {/* Top Decorative Bar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-brand-500 to-accent-500 rounded-full" />

          {/* Brand Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-600 p-0.5 shadow-glow-brand mb-3">
              <div className="w-full h-full bg-surface-950 rounded-[14px] flex items-center justify-center">
                <Layers className="w-7 h-7 text-brand-400" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Sign In to ShareHub</h1>
            <p className="text-xs text-slate-400">Institutional equipment & lab resource management</p>
          </div>

          {/* Demo Quick-Login Bar */}
          <div className="p-4 mb-6 rounded-2xl bg-gradient-to-br from-brand-500/10 to-accent-500/5 border border-brand-500/20 space-y-2.5">
            <p className="text-[11px] font-mono font-semibold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-brand-400" />
              <span>Quick Demo Access:</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("atharva", "Atharva@123")}
                disabled={isLoading}
                className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-brand-600/20 text-[11px] font-mono text-slate-200 border border-slate-700 hover:border-brand-500/40 text-left transition-all disabled:opacity-50"
              >
                🎓 <span className="text-brand-300">Borrower (USER)</span>
                <br />
                <span className="text-slate-500 text-[10px]">atharva / Atharva@123</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("dr_smith", "Password123!")}
                disabled={isLoading}
                className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-purple-600/20 text-[11px] font-mono text-purple-200 border border-slate-700 hover:border-purple-500/40 text-left transition-all disabled:opacity-50"
              >
                🔬 <span className="text-purple-300">Faculty (OWNER)</span>
                <br />
                <span className="text-slate-500 text-[10px]">dr_smith / Password123!</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="divider-gradient" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-[rgba(11,17,32,0.92)] text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              or enter credentials
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email/Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email or Username
              </label>
              <div className={`relative transition-all duration-200 ${focusedField === "identifier" ? "scale-[1.01]" : ""}`}>
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === "identifier" ? "text-brand-400" : "text-slate-400"}`} />
                <input
                  id="login-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onFocus={() => setFocusedField("identifier")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="email@institution.edu or username"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className={`relative transition-all duration-200 ${focusedField === "password" ? "scale-[1.01]" : ""}`}>
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === "password" ? "text-brand-400" : "text-slate-400"}`} />
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 hover:from-brand-500 hover:to-accent-500 shadow-glow-brand disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2 text-sm mt-2 transform hover:-translate-y-0.5 active:translate-y-0 shine-effect"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
            <span>Don't have an institutional account? </span>
            <Link to="/register" className="text-brand-400 font-bold hover:text-brand-300 transition-colors">
              Register now →
            </Link>
          </div>
        </div>

        {/* Bottom trust indicators */}
        <div className="flex items-center justify-center gap-6 mt-5 text-[10px] text-slate-600 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Encrypted Auth
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            JWT + HttpOnly Cookie
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
            Trust Verified
          </span>
        </div>
      </div>
    </div>
  );
};
