import React, { useState } from "react";
import api from "@/lib/api";
import { IncidentType, IncidentSeverity } from "@/types";
import { ImageDropzone } from "./ImageDropzone";
import { toast } from "sonner";
import { X, AlertOctagon, ShieldAlert } from "lucide-react";

interface ReportIncidentModalProps {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  bookingId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [type, setType] = useState<IncidentType>("DAMAGE");
  const [severity, setSeverity] = useState<IncidentSeverity>("MEDIUM");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error("Please provide a detailed factual description of the incident.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("bookingId", bookingId);
      formData.append("type", type);
      formData.append("severity", severity);
      formData.append("description", description);

      images.forEach((img) => {
        formData.append("images", img);
      });

      await api.post("/incidents/create", formData);

      toast.success("Incident filed. Logged to immutable audit trail.");
      onSuccess();
      onClose();
    } catch (err: any) {
      // Handled by global interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-modal rounded-2xl overflow-hidden border border-rose-500/40 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-surface-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Report Incident or Safety Violation</h3>
              <p className="text-xs text-slate-400 font-mono">Formal institutional documentation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Incident Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Incident Classification
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["DAMAGE", "LATE_RETURN", "MISSING_PARTS", "SAFETY_VIOLATION"] as IncidentType[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-lg text-xs font-mono font-medium border text-left transition-all ${
                    type === t
                      ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {t.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Severity Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as IncidentSeverity[]).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold border text-center transition-all ${
                    severity === s
                      ? s === "CRITICAL"
                        ? "bg-rose-600 border-rose-400 text-white animate-pulse"
                        : "bg-amber-500/25 border-amber-400 text-amber-200"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Factual Incident Description (Required)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State exactly what occurred, symptoms, missing accessories, or safety protocols breached."
              rows={3}
              required
              className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* Evidence Photos */}
          <ImageDropzone
            images={images}
            onChange={setImages}
            minImages={0}
            maxImages={5}
            label="Supporting Evidence Photos (Optional)"
            description="Damage photos, serial tags, error logs, or environment screenshots."
          />

          {/* Action CTAs */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/40 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSubmitting ? "Filing Report..." : "Submit Incident Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
