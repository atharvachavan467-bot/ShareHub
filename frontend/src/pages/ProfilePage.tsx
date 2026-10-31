import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { TrustScoreGauge } from "@/components/TrustScoreBadge";
import { toast } from "sonner";
import {
  User,
  Shield,
  Key,
  Camera,
  Hash,
  Mail,
  CheckCircle,
  AlertTriangle,
  Upload,
} from "lucide-react";

export const ProfilePage: React.FC = () => {
  const { user, refreshUser, updateAvatar } = useAuth();

  // Change Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Avatar state
  const [avatarLoading, setAvatarLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post("/users/change-password", { oldPassword, newPassword });
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      // Handled by global interceptor
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarLoading(true);
      try {
        await updateAvatar(file);
      } catch (err) {
        // Handled
      } finally {
        setAvatarLoading(false);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Profile & Reputation Center</h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor your institutional trust score, credentials, and security configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Trust Score Gauge & Rules */}
        <div className="lg:col-span-5 space-y-6">
          <TrustScoreGauge score={user.trustScore ?? 100} />

          {/* Quick ID Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400">
              Institutional Identity
            </h3>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                  alt={user.fullname}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/40"
                />
                <label className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={avatarLoading}
                  />
                </label>
              </div>

              <div>
                <h4 className="font-bold text-white text-base">{user.fullname}</h4>
                <p className="text-xs text-brand-400 font-mono">@{user.username}</p>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-mono">
                  <span>Role: {user.role}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Hash className="w-3.5 h-3.5" /> ID Number:
                </span>
                <span className="font-mono text-white font-semibold">{user.IdentityNumber}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Mail className="w-3.5 h-3.5" /> Email:
                </span>
                <span className="font-mono text-slate-200">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security & Settings */}
        <div className="lg:col-span-7 space-y-6">
          {/* Change Password Form */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Change Password</h3>
                <p className="text-xs text-slate-400">Update your access credentials</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="py-2.5 px-5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-glow-brand disabled:opacity-50 transition-all"
              >
                {passwordLoading ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Guidelines Callout */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              Reputation & Privilege Safeguards
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              ShareHub employs an algorithmic trust model. Users maintaining a Trust Score above <strong>80 PTS</strong> gain immediate booking approvals for Class II and Class III laser and fabrication systems without secondary faculty authorization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
