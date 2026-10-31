import React, { useEffect, useState } from "react";
import api, { extractData } from "@/lib/api";
import { Incident, IncidentStatus, Booking, Resource } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { IncidentSeverityBadge } from "@/components/StatusBadge";
import { ReportIncidentModal } from "@/components/ReportIncidentModal";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  CheckCircle,
  FileText,
  DollarSign,
  User,
  Plus,
  Scale,
  ExternalLink,
} from "lucide-react";

export const IncidentsPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual incident report modal
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [targetBookingId, setTargetBookingId] = useState("");

  // Resolution modal state
  const [resolveTarget, setResolveTarget] = useState<Incident | null>(null);
  const [resolveStatus, setResolveStatus] = useState<"RESOLVED" | "DISPUTED">("RESOLVED");
  const [penaltyAmount, setPenaltyAmount] = useState<string>("0");
  const [resolutionNote, setResolutionNote] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // In backend, incidents can be queried via /incidents/booking/:bookingId or /incidents/resource/:resourceId
  // To provide a central dashboard, we query user bookings & resources or user history to show all related incidents.
  const fetchIncidents = async () => {
    setLoading(true);
    try {
      // First get user bookings and user resources
      const [bookingsRes, resourcesRes] = await Promise.all([
        api.get("/bookings/my-bookings"),
        api.get("/resources/my-resources"),
      ]);

      const myBookings = extractData<Booking[]>(bookingsRes) || [];
      const myResources = extractData<Resource[]>(resourcesRes) || [];

      const incidentList: Incident[] = [];

      // Query incidents for all user bookings
      await Promise.all(
        myBookings.map(async (b) => {
          try {
            const incRes = await api.get(`/incidents/booking/${b._id}`);
            const data = extractData<Incident[]>(incRes);
            if (Array.isArray(data)) {
              incidentList.push(...data);
            }
          } catch {
            // ignore empty
          }
        })
      );

      // Query incidents for owned resources
      await Promise.all(
        myResources.map(async (r) => {
          try {
            const incRes = await api.get(`/incidents/resource/${r._id}`);
            const data = extractData<Incident[]>(incRes);
            if (Array.isArray(data)) {
              incidentList.push(...data);
            }
          } catch {
            // ignore
          }
        })
      );

      // Deduplicate by _id
      const uniqueMap = new Map<string, Incident>();
      incidentList.forEach((inc) => {
        if (inc && inc._id) {
          uniqueMap.set(inc._id, inc);
        }
      });

      setIncidents(Array.from(uniqueMap.values()));
    } catch (err) {
      console.error("Failed to load incidents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleResolveIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveTarget) return;

    setIsResolving(true);
    try {
      await api.patch(`/incidents/resolve/${resolveTarget._id}`, {
        status: resolveStatus,
        penaltyAmount: Number(penaltyAmount),
        resolutionNote: resolutionNote.trim(),
      });

      toast.success(`Incident marked as ${resolveStatus}. Audit log committed.`);
      setResolveTarget(null);
      fetchIncidents();
    } catch (err: any) {
      // Handled
    } finally {
      setIsResolving(false);
    }
  };

  const isOwnerOrAdmin = activeRole === "OWNER" || activeRole === "ADMIN" || user?.role === "OWNER" || user?.role === "ADMIN";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-xs font-semibold text-rose-300 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Institutional Incident & Dispute Resolution</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Dispute & Safety Violation Tracking</h1>
          <p className="text-xs text-slate-400 mt-1">
            Auditable damage records, late returns, penalty settlements, and reputation deductions.
          </p>
        </div>

        <button
          onClick={() => {
            const bookingPrompt = window.prompt("Enter Booking ID to file incident for:");
            if (bookingPrompt && bookingPrompt.trim()) {
              setTargetBookingId(bookingPrompt.trim());
              setIsReportOpen(true);
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report Manual Incident</span>
        </button>
      </div>

      {/* Incidents Feed */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="font-bold text-white text-base">Recorded Incidents ({incidents.length})</h3>
          <span className="text-xs font-mono text-slate-400">Institutional Ledger</span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin" />
            <p className="mt-3 text-xs font-mono text-slate-400">Querying incident logs...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-white">Clean Operational Record</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No damages, late returns, or safety violations are linked to your account or managed equipment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((inc) => (
              <div
                key={inc._id}
                className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-rose-300 uppercase px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30">
                      {inc.type.replace("_", " ")}
                    </span>
                    <IncidentSeverityBadge severity={inc.severity} />
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded ${
                        inc.status === "RESOLVED"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : inc.status === "DISPUTED"
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">{inc.description}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                    <span>Reported: {format(new Date(inc.createdAt), "MMM dd, yyyy HH:mm")}</span>
                    {inc.penaltyAmount !== undefined && inc.penaltyAmount > 0 && (
                      <span className="text-amber-400 font-bold">
                        Penalty: ${inc.penaltyAmount}
                      </span>
                    )}
                  </div>

                  {inc.resolutionNote && (
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                      <strong className="text-white">Resolution Note:</strong> {inc.resolutionNote}
                    </div>
                  )}

                  {/* Photo Evidence Gallery */}
                  {inc.image && inc.image.length > 0 && (
                    <div className="flex gap-2 pt-1">
                      {inc.image.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-14 h-14 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 block hover:scale-105 transition-transform"
                        >
                          <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Owner/Admin Resolve CTA */}
                {isOwnerOrAdmin && inc.status === "OPEN" && (
                  <button
                    onClick={() => {
                      setResolveTarget(inc);
                      setResolveStatus("RESOLVED");
                      setPenaltyAmount("25");
                      setResolutionNote("");
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 self-end md:self-center transition-colors"
                  >
                    <Scale className="w-3.5 h-3.5 text-brand-400" />
                    <span>Adjudicate / Resolve</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Report Modal */}
      {isReportOpen && targetBookingId && (
        <ReportIncidentModal
          bookingId={targetBookingId}
          isOpen={isReportOpen}
          onClose={() => {
            setIsReportOpen(false);
            setTargetBookingId("");
          }}
          onSuccess={fetchIncidents}
        />
      )}

      {/* Resolve / Dispute Modal */}
      {resolveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-modal rounded-3xl overflow-hidden border border-slate-700 shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Adjudicate Incident Report</h3>
            <p className="text-xs text-slate-300">
              Apply deposit deductions or formal resolution terms. If penalty &gt; $0 is applied, borrower trust score is automatically deducted by 5 points.
            </p>

            <form onSubmit={handleResolveIncident} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setResolveStatus("RESOLVED")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                    resolveStatus === "RESOLVED"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                      : "bg-slate-900 border-slate-700 text-slate-400"
                  }`}
                >
                  Mark RESOLVED
                </button>
                <button
                  type="button"
                  onClick={() => setResolveStatus("DISPUTED")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                    resolveStatus === "DISPUTED"
                      ? "bg-amber-500/20 border-amber-500 text-amber-300"
                      : "bg-slate-900 border-slate-700 text-slate-400"
                  }`}
                >
                  Mark DISPUTED
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Penalty / Replacement Fee ($)
                </label>
                <input
                  type="number"
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Resolution Findings & Notes
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Broken nozzle replaced using deposit. Remaining deposit released."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResolveTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResolving}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-glow-brand transition-all"
                >
                  {isResolving ? "Committing..." : "Finalize Resolution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
