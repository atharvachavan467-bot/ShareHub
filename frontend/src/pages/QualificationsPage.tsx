import React, { useEffect, useState } from "react";
import api, { extractData } from "@/lib/api";
import { Qualification, QualificationStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { QualificationStatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Award,
  UploadCloud,
  FileText,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ExternalLink,
  Plus,
} from "lucide-react";

export const QualificationsPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit Modal
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [qualName, setQualName] = useState("3D_PRINTER_SOP");
  const [customQualName, setCustomQualName] = useState("");
  const [certNumber, setCertNumber] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin / Owner Verify Action State
  const [verifyTarget, setVerifyTarget] = useState<Qualification | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchQualifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/qualifications/my");
      const data = extractData<Qualification[]>(res);
      if (Array.isArray(data)) {
        setQualifications(data);
      } else {
        setQualifications([]);
      }
    } catch (err) {
      console.error("Failed to load user qualifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualifications();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = qualName === "OTHER" ? customQualName.trim().toUpperCase().replace(/\s+/g, "_") : qualName;
    if (!finalName) {
      toast.error("Please enter a qualification standard name.");
      return;
    }

    if (!proofFile) {
      toast.error("Proof document (PDF or certificate image) is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("qualificationName", finalName);
      if (certNumber.trim()) {
        formData.append("certificateNumber", certNumber.trim());
      }
      formData.append("proofDocument", proofFile);

      await api.post("/qualifications/submit", formData);

      toast.success("Qualification submitted! Forwarded to lab coordinators for review.");
      setIsSubmitOpen(false);
      setCustomQualName("");
      setCertNumber("");
      setProofFile(null);
      fetchQualifications();
    } catch (err: any) {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyQualification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyTarget) return;

    setIsVerifying(true);
    try {
      const payload: any = { status: verifyStatus };
      if (verifyStatus === "REJECTED") {
        if (!rejectionReason.trim()) {
          toast.error("Please provide a rejection note explaining why the document was denied.");
          return;
        }
        payload.rejectionReason = rejectionReason.trim();
      }

      await api.patch(`/qualifications/verify/${verifyTarget._id}`, payload);
      toast.success(`Qualification status updated to ${verifyStatus}!`);
      setVerifyTarget(null);
      fetchQualifications();
    } catch (err: any) {
      // Handled
    } finally {
      setIsVerifying(false);
    }
  };

  const standardPresets = [
    "3D_PRINTER_SOP",
    "LASER_SAFETY_LEVEL_1",
    "CLEANROOM_CLASS_100_SOP",
    "CNC_MILLING_SAFETY",
    "BIO_SAFETY_LEVEL_2",
    "OTHER",
  ];

  const canVerify = activeRole === "OWNER" || activeRole === "ADMIN" || user?.role === "OWNER" || user?.role === "ADMIN";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-500/30 bg-brand-500/10 text-xs font-semibold text-brand-300 mb-2">
            <Award className="w-3.5 h-3.5 text-brand-400" />
            <span>Safety Qualification Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Institutional Safety Certifications</h1>
          <p className="text-xs text-slate-400 mt-1">
            Submit and verify lab SOP credentials required to unlock precision equipment and hazardous zones.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 shadow-glow-brand transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Certificate</span>
        </button>
      </div>

      {/* Qualifications List */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="font-bold text-white text-base">Your Certified Credentials</h3>
          <span className="text-xs font-mono text-slate-400">{qualifications.length} submitted</span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
            <p className="mt-3 text-xs font-mono text-slate-400">Loading safety credentials...</p>
          </div>
        ) : qualifications.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center text-slate-500">
              <Award className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-white">No Safety Qualifications Filed</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Some restricted equipment requires completed SOP training. Upload your completion certificate to bypass booking gating.
            </p>
            <button
              onClick={() => setIsSubmitOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors"
            >
              Upload First Certificate
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {qualifications.map((q) => (
              <div
                key={q._id}
                className="glass-card p-4 rounded-2xl border border-slate-800/90 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white font-mono tracking-wide">
                      {q.qualificationName}
                    </span>
                    <QualificationStatusBadge status={q.status} />
                  </div>

                  {q.certificateNumber && (
                    <p className="text-xs text-slate-400 font-mono">
                      Cert #: <strong className="text-slate-300">{q.certificateNumber}</strong>
                    </p>
                  )}

                  <p className="text-[11px] text-slate-500 font-mono">
                    Submitted: {format(new Date(q.createdAt), "MMM dd, yyyy")}
                  </p>

                  {q.rejectionReason && (
                    <p className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                      Rejection Reason: {q.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  {q.proofDocument ? (
                    <a
                      href={q.proofDocument}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-brand-300 hover:text-brand-200 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Proof Document</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500">No document attached</span>
                  )}

                  {/* Owner/Admin Verify action button */}
                  {canVerify && (
                    <button
                      onClick={() => {
                        setVerifyTarget(q);
                        setVerifyStatus("APPROVED");
                        setRejectionReason("");
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      Audit / Verify
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Qualification Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-modal rounded-3xl overflow-hidden border border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-400" />
                <h3 className="font-bold text-white text-base">Submit Safety Qualification</h3>
              </div>
              <button
                onClick={() => setIsSubmitOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Qualification Preset
                </label>
                <select
                  value={qualName}
                  onChange={(e) => setQualName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs text-white bg-slate-900"
                >
                  {standardPresets.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </select>
              </div>

              {qualName === "OTHER" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Custom Qualification Title
                  </label>
                  <input
                    type="text"
                    value={customQualName}
                    onChange={(e) => setCustomQualName(e.target.value)}
                    placeholder="e.g. TRANSMISSION_ELECTRON_MICROSCOPY_SOP"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Certificate / Badge Number (Optional)
                </label>
                <input
                  type="text"
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value)}
                  placeholder="e.g. LAB-CERT-99812"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Certificate Document (PDF or Image, Required)
                </label>
                <label className="cursor-pointer py-4 px-4 rounded-xl glass-input text-xs text-slate-300 hover:text-white flex flex-col items-center justify-center gap-1.5 border-dashed border-slate-700 text-center">
                  <UploadCloud className="w-6 h-6 text-brand-400" />
                  <span className="font-semibold text-white">
                    {proofFile ? proofFile.name : "Select or drag proof document"}
                  </span>
                  <span className="text-[11px] text-slate-500">PDF, PNG, JPG up to 10MB</span>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => e.target.files && setProofFile(e.target.files[0])}
                    className="hidden"
                    required
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !proofFile}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-glow-brand disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? "Uploading Document..." : "Submit Qualification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin/Owner Verify Modal */}
      {verifyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-modal rounded-3xl overflow-hidden border border-slate-700 shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">
              Verify Qualification: {verifyTarget.qualificationName}
            </h3>

            <form onSubmit={handleVerifyQualification} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVerifyStatus("APPROVED")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                    verifyStatus === "APPROVED"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                      : "bg-slate-900 border-slate-700 text-slate-400"
                  }`}
                >
                  Approve Certificate
                </button>
                <button
                  type="button"
                  onClick={() => setVerifyStatus("REJECTED")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                    verifyStatus === "REJECTED"
                      ? "bg-rose-500/20 border-rose-500 text-rose-300"
                      : "bg-slate-900 border-slate-700 text-slate-400"
                  }`}
                >
                  Reject Certificate
                </button>
              </div>

              {verifyStatus === "REJECTED" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Rejection Feedback (Required)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Illegible document or expired certification."
                    rows={2}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setVerifyTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all ${
                    verifyStatus === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
                  }`}
                >
                  {isVerifying ? "Verifying..." : "Save Determination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
