import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { TrustScoreBadge } from "./TrustScoreBadge";
import { UserRole } from "@/types";
import {
  Layers,
  Compass,
  CalendarCheck2,
  Cpu,
  Award,
  AlertTriangle,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Shield,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, activeRole, setActiveRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Explore Catalog", path: "/", icon: Compass },
    { label: "Borrower Hub", path: "/dashboard/borrower", icon: CalendarCheck2, auth: true },
    { label: "Owner Studio", path: "/dashboard/owner", icon: Cpu, auth: true },
    { label: "Qualifications", path: "/qualifications", icon: Award, auth: true },
    { label: "Disputes & Incidents", path: "/incidents", icon: AlertTriangle, auth: true },
  ];

  const handleRoleChange = (newRole: UserRole) => {
    setActiveRole(newRole);
    setIsUserMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-500 p-0.5 shadow-glow-brand transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-surface-950 rounded-[10px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-brand-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-brand-300 transition-colors">
                Share<span className="text-brand-400">Hub</span>
              </span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 bg-brand-500/20 text-brand-300 rounded border border-brand-500/30">
                LABS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider -mt-1 hidden sm:block">
              Institutional Equipment & Resources
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            if (link.auth && !isAuthenticated) return null;
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-400" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Trust Meter + User or Auth CTAs */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user && (
            <div className="flex items-center gap-2">
              {/* Trust Score Badge in Navbar */}
              <Link to="/profile" className="hover:opacity-90 transition-opacity">
                <TrustScoreBadge score={user.trustScore ?? 100} size="sm" />
              </Link>

              {/* Role Indicator / Switcher Pill */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full glass-card hover:border-slate-600 transition-all text-xs text-slate-200"
                  aria-label="User profile and role menu"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                    alt={user.fullname}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/40"
                  />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="font-semibold text-xs leading-none text-white max-w-[100px] truncate">
                      {user.fullname}
                    </span>
                    <span className="text-[10px] text-brand-400 font-mono tracking-wider font-semibold">
                      {activeRole}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 glass-modal rounded-xl py-2 z-50 border border-slate-700/80 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <p className="text-sm font-semibold text-white truncate">{user.fullname}</p>
                      <p className="text-xs text-slate-400 font-mono">@{user.username}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300 bg-slate-900/60 p-1.5 rounded">
                        <span>Identity #:</span>
                        <span className="font-mono text-brand-300 font-medium">
                          {user.IdentityNumber || "Unverified"}
                        </span>
                      </div>
                    </div>

                    {/* Role Switcher Section */}
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-brand-400" /> Switch View Mode
                      </p>
                      <div className="grid grid-cols-3 gap-1">
                        {(["USER", "OWNER", "ADMIN"] as UserRole[]).map((r) => (
                          <button
                            key={r}
                            onClick={() => handleRoleChange(r)}
                            className={`px-2 py-1 rounded text-xs font-mono font-medium transition-all ${
                              activeRole === r
                                ? "bg-brand-500 text-white shadow-sm"
                                : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Profile & Security Settings</span>
                      </Link>
                      <Link
                        to="/dashboard/borrower"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                      >
                        <CalendarCheck2 className="w-4 h-4 text-slate-400" />
                        <span>My Booking Lifecycles</span>
                      </Link>
                      <Link
                        to="/dashboard/owner"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                      >
                        <Cpu className="w-4 h-4 text-slate-400" />
                        <span>Owner Equipment Studio</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 rounded-lg shadow-glow-brand transition-all transform hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Register</span>
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-modal border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            if (link.auth && !isAuthenticated) return null;
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          {isAuthenticated && (
            <div className="pt-3 border-t border-slate-800">
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                <UserIcon className="w-4 h-4" />
                <span>Profile & Settings</span>
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
