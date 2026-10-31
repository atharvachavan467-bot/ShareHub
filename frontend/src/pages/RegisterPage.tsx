import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Layers,
  User,
  Mail,
  Lock,
  Hash,
  Upload,
  ArrowRight,
  ShieldCheck,
  Image as ImageIcon,
} from "lucide-react";

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullname: "",
    password: "",
    IdentityNumber: "",
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!avatar) {
      toast.error("An avatar photograph is required to verify institutional identity.");
      return;
    }

    if (!formData.IdentityNumber) {
      toast.error("Institutional Identity Number is required.");
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("username", formData.username.trim().toLowerCase());
      data.append("email", formData.email.trim());
      data.append("fullname", formData.fullname.trim());
      data.append("password", formData.password);
      // Note exact capital I and N required by backend
      data.append("IdentityNumber", formData.IdentityNumber.trim());
      data.append("avatar", avatar);
      if (coverImage) {
        data.append("coverImage", coverImage);
      }

      await register(data);
      navigate("/login");
    } catch (err: any) {
      // Handled by global interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />

      <div className="w-full max-w-xl relative z-10 glass-modal p-8 rounded-3xl border border-slate-700/80 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-600 p-0.5 shadow-glow-brand mb-2">
            <div className="w-full h-full bg-surface-950 rounded-[14px] flex items-center justify-center">
              <Layers className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Institutional Profile</h1>
          <p className="text-xs text-slate-400">Join the verified equipment sharing consortium</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                  placeholder="Dr. Jane Doe"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">@</span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="janedoe"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jane.doe@university.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Identity Number (Student/Staff ID)
              </label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={formData.IdentityNumber}
                  onChange={(e) => setFormData({ ...formData, IdentityNumber: e.target.value })}
                  placeholder="20268841"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Avatar and Cover Image Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Profile Avatar Photo (Required)
              </label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-900 border border-slate-700 shrink-0 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <label className="flex-1 cursor-pointer py-2 px-3 rounded-xl glass-input text-xs text-slate-300 hover:text-white flex items-center justify-center gap-1.5 border-dashed border-slate-700">
                  <Upload className="w-3.5 h-3.5 text-brand-400" />
                  <span className="truncate">{avatar ? avatar.name : "Choose File"}</span>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" required />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Lab Cover Image (Optional)
              </label>
              <label className="cursor-pointer h-12 rounded-xl glass-input text-xs text-slate-300 hover:text-white flex items-center justify-center gap-1.5 border-dashed border-slate-700">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{coverImage ? coverImage.name : "Optional Cover Photo"}</span>
                <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 hover:from-brand-500 hover:to-accent-500 shadow-glow-brand disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm mt-4"
          >
            {isLoading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          <span>Already registered? </span>
          <Link to="/login" className="text-brand-400 font-semibold hover:underline">
            Sign In to your account
          </Link>
        </div>
      </div>
    </div>
  );
};
