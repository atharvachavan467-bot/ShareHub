import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading, activeRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-accent-500/20 border-b-accent-500 animate-spin" />
        </div>
        <p className="mt-4 text-xs font-mono text-slate-400 uppercase tracking-widest">
          Authenticating Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role gating if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(activeRole) || (user?.role && allowedRoles.includes(user.role));
    if (!hasRole) {
      return (
        <div className="max-w-md mx-auto my-20 p-8 glass-card rounded-2xl text-center border-rose-500/30">
          <h2 className="text-xl font-bold text-rose-400">Restricted Access</h2>
          <p className="text-sm text-slate-300 mt-2">
            This module requires one of the following roles: <strong className="font-mono">{allowedRoles.join(", ")}</strong>.
          </p>
          <p className="text-xs text-slate-400 mt-3">
            Use the Role Switcher in the top navbar to simulate or preview this portal with an elevated role.
          </p>
        </div>
      );
    }
  }

  return <>{children}</>;
};
