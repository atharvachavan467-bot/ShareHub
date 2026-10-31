import React, { useState } from "react";
import api from "@/lib/api";
import { ConditionRating } from "@/types";
import { ImageDropzone } from "./ImageDropzone";
import { toast } from "sonner";
import { X, PackageCheck, AlertCircle } from "lucide-react";

interface CheckInModalProps {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  bookingId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [conditionRating, setConditionRating] = useState<ConditionRating>("GOOD");
  const [conditionNote, setConditionNote] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("Please upload at least 1 photo verifying the item condition before pickup.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("bookingId", bookingId);
      formData.append("conditionRating", conditionRating);
      if (conditionNote) formData.append("conditionNote", conditionNote);
      formData.append("actualCheckInDate", new Date().toISOString());

      images.forEach((img) => {
        formData.append("images", img);
      });

      await api.post("/bookings/pickup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Equipment checked in successfully! Status is now IN_USE.");
      onSuccess();
      onClose();
    } catch (err: any) {
      // Error handled by interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-modal rounded-2xl overflow-hidden border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-surface-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Check-In / Equipment Pickup</h3>
              <p className="text-xs text-slate-400 font-mono">Verify baseline condition</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Condition Rating Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Initial Condition Rating
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["GOOD", "FAIR", "DAMAGED"] as ConditionRating[]).map((rating) => (
                <button
                  type="button"
                  key={rating}
                  onClick={() => setConditionRating(rating)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold font-mono border transition-all ${
                    conditionRating === rating
                      ? rating === "GOOD"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm"
                        : rating === "FAIR"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                        : "bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Condition Notes / Pre-existing Wear
            </label>
            <textarea
              value={conditionNote}
              onChange={(e) => setConditionNote(e.target.value)}
              placeholder="e.g. Minor scuff on left casing, all optical cables and adaptors present."
              rows={2}
              className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* Image Upload Dropzone */}
          <ImageDropzone
            images={images}
            onChange={setImages}
            minImages={1}
            maxImages={5}
            label="Baseline Condition Photos (1–5 Required)"
            description="Take clear photos of serial tags, display screens, and current physical condition."
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
              disabled={isSubmitting || images.length === 0}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 shadow-glow-brand disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSubmitting ? "Uploading Audit Photos..." : "Confirm Pickup & Activate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
