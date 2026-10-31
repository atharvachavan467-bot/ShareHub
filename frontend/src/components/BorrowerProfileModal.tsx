import React, { useEffect, useState } from "react";
import api, { extractData } from "@/lib/api";
import { BorrowerInspectionData, BookingStatus } from "@/types";
import { TrustScoreBadge } from "./TrustScoreBadge";
import { BookingStatusBadge, QualificationStatusBadge } from "./StatusBadge";
import { format } from "date-fns";
import {
  X,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  Award,
  History,
  Calendar,
  CheckCircle,
  FileText,
  DollarSign,
  AlertOctagon,
  Sparkles,
  ExternalLink,
  Eye,
  Download,
  ShieldCheck,
  Layers,
  Image as ImageIcon,
  ChevronRight,
  Maximize2,
} from "lucide-react";

interface BorrowerProfileModalProps {
  borrowerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BorrowerProfileModal: React.FC<BorrowerProfileModalProps> = ({
  borrowerId,
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<BorrowerInspectionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState<"overview" | "qualifications" | "history" | "penalties">("overview");

  // Document Preview State
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string; isPdf?: boolean } | null>(null);

  useEffect(() => {
    if (!isOpen || !borrowerId) {
      setData(null);
      setError(null);
      setActiveTab("overview");
      setPreviewDoc(null);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/users/inspect/${borrowerId}`);
        const result = extractData<BorrowerInspectionData>(res);
        if (result && result.user) {
          setData(result);
        } else {
          setError("Failed to retrieve profile inspection details.");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load borrower profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen, borrowerId]);

  if (!isOpen) return null;

  const handleOpenDoc = (url: string, title: string) => {
    const isPdf = url.toLowerCase().includes(".pdf") || url.toLowerCase().includes("proofdocument");
    setPreviewDoc({ url, title, isPdf });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl glass-modal rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-surface-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-brand-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-glow-brand">
              <UserCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <span>Borrower Dossier & Document Inspection</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  VERIFIED AUDIT
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Institutional credentials, verified certificates, reservation history & penalties
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
              <p className="mt-4 text-xs font-mono text-slate-400">Retrieving borrower dossier & documents...</p>
            </div>
          ) : error || !data ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <AlertOctagon className="w-9 h-9 text-rose-500 mx-auto" />
              <p className="text-sm font-semibold text-white">Inspection Failed</p>
              <p className="text-xs">{error || "Could not load user records."}</p>
            </div>
          ) : (
            <>
              {/* Profile Overview Banner */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-5 bg-gradient-to-br from-slate-900/90 to-surface-950/80">
                <div className="relative group shrink-0">
                  <img
                    src={
                      data.user.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${data.user.username}`
                    }
                    alt={data.user.fullname}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-purple-500/50 shadow-lg cursor-pointer"
                    onClick={() => data.user.avatar && handleOpenDoc(data.user.avatar, `${data.user.fullname} - Profile Photo`)}
                    title="Click to view full photo"
                  />
                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 shadow">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{data.user.fullname}</h3>
                    <TrustScoreBadge score={data.user.trustScore ?? 100} size="md" />
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/30">
                      {data.user.role}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-mono">
                    @{data.user.username} • <span className="text-slate-300">{data.user.email}</span>
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5 font-mono bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ID #{data.user.IdentityNumber || "881023"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Institutional Identity Verified</span>
                    </div>

                    {data.user.createdAt && (
                      <span className="flex items-center gap-1.5 font-mono text-slate-400 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Member since {format(new Date(data.user.createdAt), "MMM yyyy")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2">
                {[
                  { id: "overview", label: "Overview & Metrics", icon: Layers, count: null },
                  { id: "qualifications", label: "Qualification Documents", icon: Award, count: data.qualifications.length },
                  { id: "history", label: "Booking History & Equipment Photos", icon: History, count: data.bookings?.length || 0 },
                  { id: "penalties", label: "Penalties & Infractions", icon: ShieldAlert, count: data.penalties.length },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                        isActive
                          ? "bg-purple-600 text-white shadow-glow-brand"
                          : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                      {t.count !== null && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                          isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                        }`}>
                          {t.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: OVERVIEW & METRICS */}
              {activeTab === "overview" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                      <p className="text-slate-400 text-xs font-medium">Total Reservations</p>
                      <p className="text-2xl font-extrabold text-white mt-1 font-mono">{data.stats.totalBookings}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                      <p className="text-slate-400 text-xs font-medium">Returned On-Time</p>
                      <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
                        {data.stats.completedBookings}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                      <p className="text-slate-400 text-xs font-medium">Active Loans</p>
                      <p className="text-2xl font-extrabold text-cyan-400 mt-1 font-mono">{data.stats.activeBookings}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                      <p className="text-slate-400 text-xs font-medium">Overdue Returns</p>
                      <p className={`text-2xl font-extrabold mt-1 font-mono ${data.stats.overdueBookings > 0 ? "text-rose-400" : "text-slate-400"}`}>
                        {data.stats.overdueBookings}
                      </p>
                    </div>
                  </div>

                  {/* Highlights Summary Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Qualification Status Quick Card */}
                    <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                          <Award className="w-4 h-4 text-purple-400" />
                          <span>Safety Certifications ({data.qualifications.length})</span>
                        </div>
                        <button
                          onClick={() => setActiveTab("qualifications")}
                          className="text-[11px] font-mono text-purple-400 hover:text-purple-300 underline"
                        >
                          View Documents →
                        </button>
                      </div>
                      {data.qualifications.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No certificates submitted.</p>
                      ) : (
                        <div className="space-y-2">
                          {data.qualifications.slice(0, 3).map((q) => (
                            <div
                              key={q._id}
                              className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                                <span className="text-xs font-mono font-semibold text-purple-200 truncate">
                                  {q.qualificationName}
                                </span>
                              </div>
                              {q.proofDocument && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenDoc(q.proofDocument, `${q.qualificationName} Certificate`)}
                                  className="px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-mono flex items-center gap-1 shrink-0 transition-colors"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>View Doc</span>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Trust & Infraction Status Card */}
                    <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                          <span>Infraction Audit</span>
                        </div>
                        <button
                          onClick={() => setActiveTab("penalties")}
                          className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline"
                        >
                          Full Audit ({data.penalties.length}) →
                        </button>
                      </div>

                      {data.penalties.length === 0 ? (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div className="text-xs text-slate-300">
                            <strong className="text-emerald-300">Clean Standing:</strong> No damages, safety violations, or late return penalties.
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1 text-xs">
                          <p className="font-bold text-rose-300 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                            {data.penalties.length} Infraction(s) Recorded
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            Total Financial Fines Levied: <strong className="text-rose-400">${data.stats.totalPenaltyAmount}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: QUALIFICATIONS & PROOF DOCUMENTS */}
              {activeTab === "qualifications" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-400" />
                        <span>Submitted Qualification Certificates & Proof Documents</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Inspect official SOP certificates and PDF/image uploads submitted by this borrower.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      {data.qualifications.length} Document{data.qualifications.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {data.qualifications.length === 0 ? (
                    <div className="p-8 text-center glass-card rounded-2xl border border-slate-800 space-y-2">
                      <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-xs font-semibold text-slate-300">No Qualification Documents On File</p>
                      <p className="text-[11px] text-slate-500">
                        This borrower has not submitted any safety qualification proofs or certificates yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.qualifications.map((q) => {
                        const hasDoc = !!q.proofDocument;
                        const isPdf = q.proofDocument?.toLowerCase().includes(".pdf") || q.proofDocument?.toLowerCase().includes("proofdocument");

                        return (
                          <div
                            key={q._id}
                            className="p-5 rounded-2xl glass-card border border-purple-500/30 bg-surface-950/70 space-y-3 hover:border-purple-500/50 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h5 className="font-bold text-white text-sm sm:text-base font-mono">
                                    {q.qualificationName}
                                  </h5>
                                  <QualificationStatusBadge status={q.status} />
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                                  {q.certificateNumber && (
                                    <span>Cert / License #: <strong className="text-purple-300">{q.certificateNumber}</strong></span>
                                  )}
                                  {q.createdAt && (
                                    <span>Uploaded: {format(new Date(q.createdAt), "MMM dd, yyyy")}</span>
                                  )}
                                </div>
                              </div>

                              {/* Document Action Buttons */}
                              {hasDoc && (
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDoc(q.proofDocument!, `${q.qualificationName} - Certificate Document`)}
                                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-glow-brand flex items-center gap-1.5 transition-all"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Inspect Document</span>
                                  </button>

                                  <a
                                    href={q.proofDocument}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 rounded-xl text-slate-300 hover:text-white glass-card border-slate-700 hover:border-slate-600 transition-colors"
                                    title="Open document in new browser tab"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Document Inline Viewer Preview Box */}
                            {hasDoc && (
                              <div className="pt-2 border-t border-slate-800">
                                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-mono font-semibold text-slate-200 truncate max-w-xs sm:max-w-md">
                                        {q.proofDocument?.split("/").pop() || "Official_Certificate_Proof.pdf"}
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-mono">
                                        {isPdf ? "PDF Document • Inline Preview Ready" : "Document Image • Ready"}
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenDoc(q.proofDocument!, `${q.qualificationName} - Certificate`)}
                                    className="text-xs text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1"
                                  >
                                    <span>Preview Here</span>
                                    <Maximize2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: RESERVATION HISTORY & EQUIPMENT PHOTOS */}
              {activeTab === "history" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <History className="w-4 h-4 text-brand-400" />
                        <span>Borrower Reservation Record & Condition Audit Photos</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Inspect how this borrower documented equipment during pickup and return.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-brand-500/15 text-brand-300 border border-brand-500/30">
                      {data.bookings?.length || 0} Booking{data.bookings?.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {!data.bookings || data.bookings.length === 0 ? (
                    <div className="p-8 text-center glass-card rounded-2xl border border-slate-800 space-y-2">
                      <Layers className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-xs font-semibold text-slate-300">No Prior Bookings Recorded</p>
                      <p className="text-[11px] text-slate-500">
                        This borrower is requesting their initial reservations on the platform.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.bookings.map((booking) => {
                        const res = typeof booking.resouceId === "object" ? booking.resouceId : null;
                        const resTitle = res ? (res as any).title : "Equipment Asset";
                        const hasBeforePhotos = booking.beforePhotoURI && booking.beforePhotoURI.length > 0;
                        const hasAfterPhotos = booking.afterPhotoURI && booking.afterPhotoURI.length > 0;

                        return (
                          <div
                            key={booking._id}
                            className="p-4 sm:p-5 rounded-2xl glass-card border border-slate-800 space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h5 className="font-bold text-white text-sm">{resTitle}</h5>
                                  <BookingStatusBadge status={booking.status} size="sm" />
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                                  <span>
                                    {format(new Date(booking.startDate), "MMM dd")} → {format(new Date(booking.endDate), "MMM dd, yyyy")}
                                  </span>
                                  {booking.conditionRating && (
                                    <span className="text-slate-300">Condition: <strong>{booking.conditionRating}</strong></span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {booking.purpose && (
                              <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                                Purpose: "{booking.purpose}"
                              </p>
                            )}

                            {/* Inspection Photos Gallery */}
                            {(hasBeforePhotos || hasAfterPhotos) && (
                              <div className="pt-2 border-t border-slate-800 space-y-2">
                                <p className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                                  Equipment Condition Evidence Photos:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {booking.beforePhotoURI?.map((photo, idx) => (
                                    <button
                                      key={`before-${idx}`}
                                      type="button"
                                      onClick={() => handleOpenDoc(photo, `${resTitle} - Check-in Photo #${idx + 1}`)}
                                      className="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-700 hover:border-brand-400 transition-all shrink-0"
                                    >
                                      <img src={photo} alt="Check-in Photo" className="w-full h-full object-cover" />
                                      <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-mono">
                                        In #{idx + 1}
                                      </span>
                                    </button>
                                  ))}
                                  {booking.afterPhotoURI?.map((photo, idx) => (
                                    <button
                                      key={`after-${idx}`}
                                      type="button"
                                      onClick={() => handleOpenDoc(photo, `${resTitle} - Return Photo #${idx + 1}`)}
                                      className="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-700 hover:border-purple-400 transition-all shrink-0"
                                    >
                                      <img src={photo} alt="Return Photo" className="w-full h-full object-cover" />
                                      <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-mono">
                                        Out #{idx + 1}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PENALTIES & INFRACTIONS RECORD */}
              {activeTab === "penalties" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>Disciplinary Records, Fines & Damage Reports</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Official penalties and safety incidents charged against this borrower.
                      </p>
                    </div>
                    {data.penalties.length > 0 && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {data.penalties.length} Infraction{data.penalties.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {data.penalties.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-emerald-300">Pristine Institutional Compliance</p>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          This borrower has zero damage reports, safety SOP violations, or unpaid financial penalties on their academic record.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.penalties.map((penalty) => {
                        const resTitle =
                          typeof penalty.resourceId === "object"
                            ? (penalty.resourceId as any).title
                            : "Equipment Asset";

                        return (
                          <div
                            key={penalty._id}
                            className="p-5 rounded-2xl bg-rose-950/25 border border-rose-500/30 space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-rose-500/25 text-rose-300 border border-rose-500/40">
                                  {penalty.type}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                  {penalty.severity} SEVERITY
                                </span>
                                <span className="text-xs font-mono text-slate-400">
                                  Status: <strong className="text-slate-200">{penalty.status}</strong>
                                </span>
                              </div>

                              {penalty.penaltyAmount ? (
                                <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 self-start sm:self-auto">
                                  <DollarSign className="w-3.5 h-3.5" />
                                  <span>Penalty Fee: ${penalty.penaltyAmount}</span>
                                </span>
                              ) : null}
                            </div>

                            <p className="text-xs text-slate-200">
                              <strong>Resource:</strong> {resTitle}
                            </p>

                            <p className="text-xs text-slate-300 italic bg-black/40 p-2.5 rounded-xl border border-slate-800">
                              "{penalty.description}"
                            </p>

                            {/* Evidence Photos */}
                            {penalty.image && penalty.image.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <p className="text-[11px] font-mono text-slate-400">Infraction Evidence Photos:</p>
                                <div className="flex gap-2">
                                  {penalty.image.map((imgUrl, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => handleOpenDoc(imgUrl, `Damage Evidence Photo #${i + 1}`)}
                                      className="w-14 h-14 rounded-xl overflow-hidden border border-rose-500/40 hover:scale-105 transition-all"
                                    >
                                      <img src={imgUrl} alt="Evidence" className="w-full h-full object-cover" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {penalty.resolutionNote && (
                              <p className="text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                                <span className="text-purple-300 font-semibold">Resolution Note:</span> {penalty.resolutionNote}
                              </p>
                            )}

                            <div className="text-[10px] font-mono text-slate-500 text-right">
                              Logged: {format(new Date(penalty.createdAt), "MMM dd, yyyy HH:mm")}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-surface-950/90 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5 hidden sm:flex">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Institutional Security Clearance Certified</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>

      {/* FULL DOCUMENT PREVIEW LIGHTBOX / VIEWER */}
      {previewDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200">
          <div className="w-full max-w-4xl h-[85vh] glass-modal rounded-3xl overflow-hidden border border-purple-500/40 shadow-2xl flex flex-col">
            {/* Document Viewer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-surface-950/95">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-bold text-white truncate font-mono">{previewDoc.title}</h3>
                  <p className="text-[10px] text-purple-300 font-mono truncate">{previewDoc.url}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold glass-card text-slate-300 hover:text-white border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Tab</span>
                </a>
                <a
                  href={previewDoc.url}
                  download
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition-colors shadow-glow-brand"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Viewer Canvas */}
            <div className="flex-1 bg-slate-950/80 p-2 sm:p-4 overflow-hidden flex items-center justify-center">
              {previewDoc.isPdf ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.title}
                  className="w-full h-full rounded-2xl border border-slate-800 bg-white"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center overflow-auto">
                  <img
                    src={previewDoc.url}
                    alt={previewDoc.title}
                    className="max-w-full max-h-full object-contain rounded-2xl border border-slate-800 shadow-2xl"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
