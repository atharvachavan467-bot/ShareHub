import React, { useEffect, useState } from "react";
import api, { extractData } from "@/lib/api";
import { Resource, Booking, ResourceStatus, UserSummary } from "@/types";
import { ResourceStatusBadge, BookingStatusBadge } from "@/components/StatusBadge";
import { TrustScoreBadge } from "@/components/TrustScoreBadge";
import { CreateResourceModal } from "@/components/CreateResourceModal";
import { TimelineDrawer } from "@/components/TimelineDrawer";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Cpu,
  Layers,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  History,
  Power,
  MapPin,
  Inbox,
  UserCheck,
} from "lucide-react";
import { BorrowerProfileModal } from "@/components/BorrowerProfileModal";

export const OwnerStudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"resources" | "requests">("resources");

  // Resources tab state
  const [myResources, setMyResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Incoming Requests tab state
  const [incomingBookings, setIncomingBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [requestFilter, setRequestFilter] = useState<string>("PENDING_APPROVAL");

  // Confirm / Reject action modal state
  const [actionBooking, setActionBooking] = useState<Booking | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [rejectionReason, setRejectionReason] = useState("");
  const [totalPriceInput, setTotalPriceInput] = useState<string>("50");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Timeline drawer state
  const [timelineBookingId, setTimelineBookingId] = useState<string | null>(null);

  // Borrower profile inspection modal
  const [inspectingBorrowerId, setInspectingBorrowerId] = useState<string | null>(null);

  const fetchMyResources = async () => {
    setLoadingResources(true);
    try {
      const res = await api.get("/resources/my-resources");
      const data = extractData<Resource[]>(res);
      if (Array.isArray(data)) {
        setMyResources(data);
      } else {
        setMyResources([]);
      }
    } catch (err) {
      console.error("Failed to load owner resources", err);
    } finally {
      setLoadingResources(false);
    }
  };

  const fetchIncomingBookings = async () => {
    setLoadingBookings(true);
    try {
      const params: any = {};
      if (requestFilter !== "ALL") {
        params.status = requestFilter;
      }
      const res = await api.get("/bookings/owner-bookings", { params });
      const data = extractData<Booking[]>(res);
      if (Array.isArray(data)) {
        setIncomingBookings(data);
      } else {
        setIncomingBookings([]);
      }
    } catch (err) {
      console.error("Failed to load incoming requests", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (activeTab === "resources") {
      fetchMyResources();
    } else {
      fetchIncomingBookings();
    }
  }, [activeTab, requestFilter]);

  // Toggle status AVAILABLE <-> MAINTENANCE
  const handleToggleStatus = async (resourceId: string, currentStatus: ResourceStatus) => {
    const nextStatus = currentStatus === "AVAILABLE" ? "MAINTENANCE" : "AVAILABLE";
    try {
      await api.patch(`/resources/status/${resourceId}`, { status: nextStatus });
      toast.success(`Resource status updated to ${nextStatus}`);
      fetchMyResources();
    } catch (err: any) {
      // Handled
    }
  };

  // Delete resource
  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm("Are you sure you want to remove this equipment from the institutional catalog?")) {
      return;
    }
    try {
      await api.delete(`/resources/delete/${resourceId}`);
      toast.success("Equipment successfully deleted.");
      fetchMyResources();
    } catch (err: any) {
      // Backend blocks deletion if active bookings exist, handled cleanly
    }
  };

  // Confirm or Reject Booking
  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionBooking) return;

    const resouceId =
      typeof actionBooking.resouceId === "object"
        ? (actionBooking.resouceId as any)._id
        : actionBooking.resouceId;

    setIsSubmittingAction(true);
    try {
      // CRITICAL TYPO IN BACKEND PAYLOAD:
      // Must send 'resouceId' (spelled resouceId!)
      if (actionType === "APPROVE") {
        await api.post("/bookings/confirm", {
          bookingId: actionBooking._id,
          resouceId: resouceId,
          status: "APPROVED",
          totalPrice: Number(totalPriceInput),
        });
        toast.success("Reservation APPROVED! Borrower can now proceed to pickup check-in.");
      } else {
        if (!rejectionReason.trim()) {
          toast.error("Please provide a factual reason for rejecting the booking request.");
          return;
        }
        await api.post("/bookings/confirm", {
          bookingId: actionBooking._id,
          resouceId: resouceId,
          status: "REJECTED",
          rejectionReason: rejectionReason.trim(),
        });
        toast.info("Booking request REJECTED with feedback.");
      }

      setActionBooking(null);
      fetchIncomingBookings();
    } catch (err: any) {
      // Handled
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-semibold text-purple-300 mb-2">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>Equipment Custodian & Lab Studio</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Owner Management Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your hardware assets, inspect borrower trust scores, and approve reservations.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingResource(null);
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Equipment</span>
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("resources")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "resources"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Listed Equipment ({myResources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "requests"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Incoming Requests</span>
        </button>
      </div>

      {/* Tab 1: My Listed Resources */}
      {activeTab === "resources" && (
        <div className="space-y-4">
          {loadingResources ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
              <p className="mt-3 text-xs font-mono text-slate-400">Loading listed assets...</p>
            </div>
          ) : myResources.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 border border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No Equipment Listed</h3>
              <p className="text-xs text-slate-400">
                You haven't listed any equipment or lab services under your custodian account yet.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-colors"
              >
                List First Resource
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myResources.map((resItem) => {
                const img =
                  resItem.image && resItem.image.length > 0
                    ? resItem.image[0]
                    : "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";

                return (
                  <div
                    key={resItem._id}
                    className="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Thumbnail */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
                        <img
                          src={img}
                          alt={resItem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <ResourceStatusBadge status={resItem.status} />
                        </div>
                        <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/70 text-xs font-mono font-bold text-white">
                          ${resItem.pricePerUnit} / {resItem.pricingType === "PER_DAY" ? "day" : "hr"}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <h3 className="font-bold text-base text-white line-clamp-1">{resItem.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {resItem.description}
                        </p>
                        {resItem.location && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                            <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="truncate">
                              {resItem.location.firstLine}, {resItem.location.state}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="p-4 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      {/* Toggle Maintenance Switch */}
                      <button
                        onClick={() => handleToggleStatus(resItem._id, resItem.status)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 border transition-all ${
                          resItem.status === "AVAILABLE"
                            ? "bg-purple-500/15 border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
                            : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30"
                        }`}
                        title="Toggle between Available and Maintenance"
                      >
                        <Power className="w-3 h-3" />
                        <span>{resItem.status === "AVAILABLE" ? "Maintenance" : "Set Available"}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingResource(resItem);
                            setIsCreateModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg glass-card text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                          title="Edit Resource"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteResource(resItem._id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                          title="Delete Resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Incoming Booking Requests */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {/* Sub-filter tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { label: "Pending Approval", val: "PENDING_APPROVAL" },
              { label: "Waiting List", val: "WAITLISTED" },
              { label: "All Requests", val: "ALL" },
              { label: "Approved", val: "APPROVED" },
              { label: "Active In-Use", val: "CHECKED_IN" },
              { label: "Rejected", val: "REJECTED" },
            ].map((f) => (
              <button
                key={f.val}
                onClick={() => setRequestFilter(f.val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                  requestFilter === f.val
                    ? "bg-purple-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loadingBookings ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
              <p className="mt-3 text-xs font-mono text-slate-400">Loading incoming requests...</p>
            </div>
          ) : incomingBookings.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 border border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No Requests Pending</h3>
              <p className="text-xs text-slate-400">
                There are no reservation requests matching filter '{requestFilter}'.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingBookings.map((booking) => {
                const borrower = typeof booking.owner === "object" ? (booking.owner as UserSummary) : null;
                const resource = typeof booking.resouceId === "object" ? booking.resouceId : null;
                const resTitle = resource ? (resource as any).title : "Equipment Asset";

                return (
                  <div
                    key={booking._id}
                    className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    {/* Left: Borrower Persona & Trust Score */}
                    <div className="flex items-start gap-4">
                      <button
                        type="button"
                        onClick={() => borrower?._id && setInspectingBorrowerId(borrower._id)}
                        className="relative group shrink-0 text-left focus:outline-none"
                        title="Click to inspect verified borrower dossier & penalties"
                      >
                        <img
                          src={borrower?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${borrower?.username || "user"}`}
                          alt={borrower?.fullname || "Borrower"}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/40 group-hover:ring-purple-400 group-hover:scale-105 transition-all"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-900 border border-purple-500/50 flex items-center justify-center text-[10px] text-purple-300 shadow">
                          <UserCheck className="w-3 h-3" />
                        </div>
                      </button>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => borrower?._id && setInspectingBorrowerId(borrower._id)}
                            className="font-bold text-white text-base hover:text-purple-300 transition-colors text-left flex items-center gap-1.5 group cursor-pointer"
                          >
                            <span>{borrower?.fullname || "Verified Student / Researcher"}</span>
                            <span className="text-[11px] font-mono text-purple-400 font-normal underline decoration-purple-500/40 opacity-80 group-hover:opacity-100">
                              (Inspect Profile)
                            </span>
                          </button>
                          {borrower?.trustScore !== undefined && (
                            <TrustScoreBadge score={borrower.trustScore} size="sm" />
                          )}
                          <BookingStatusBadge status={booking.status} size="sm" />
                          {booking.isWaitlisted && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Waitlist #{booking.waitlistPosition || 1}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300">
                          Requested Resource: <strong className="text-purple-300 font-semibold">{resTitle}</strong>
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400">
                          <span>Dates: {format(new Date(booking.startDate), "MMM dd")} → {format(new Date(booking.endDate), "MMM dd, yyyy")}</span>
                        </div>

                        {booking.isWaitlisted && (
                          <p className="text-xs text-amber-300/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 font-mono">
                            ⏳ Waitlisted Reservation: Scheduled to begin automatically right after prior borrower completes.
                          </p>
                        )}

                        {booking.purpose && (
                          <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                            Research Purpose: "{booking.purpose}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                      <button
                        onClick={() => borrower?._id && setInspectingBorrowerId(borrower._id)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>Inspect Dossier</span>
                      </button>

                      <button
                        onClick={() => setTimelineBookingId(booking._id)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold glass-card text-slate-300 hover:text-white border-slate-700 flex items-center gap-1.5"
                      >
                        <History className="w-3.5 h-3.5 text-purple-400" />
                        <span>Audit Timeline</span>
                      </button>

                      {booking.status === "PENDING_APPROVAL" && (
                        <>
                          <button
                            onClick={() => {
                              setActionBooking(booking);
                              setActionType("APPROVE");
                              setTotalPriceInput("50");
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-900/30 flex items-center gap-1.5 transition-all"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve Request</span>
                          </button>

                          <button
                            onClick={() => {
                              setActionBooking(booking);
                              setActionType("REJECT");
                              setRejectionReason("");
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1.5 transition-all"
                          >
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Resource Modal */}
      {isCreateModalOpen && (
        <CreateResourceModal
          isOpen={isCreateModalOpen}
          initialData={editingResource}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingResource(null);
          }}
          onSuccess={fetchMyResources}
        />
      )}

      {/* Confirmation & Rejection Action Modal */}
      {actionBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-modal rounded-2xl overflow-hidden border border-slate-700 shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">
              {actionType === "APPROVE" ? "Authorize Booking Reservation" : "Reject Reservation Request"}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {actionType === "APPROVE"
                ? "Confirming this reservation locks the schedule and notifies the borrower to proceed with check-in condition documentation."
                : "Please state the reason for rejecting this booking (e.g. lab undergoing calibration)."}
            </p>

            <form onSubmit={handleConfirmAction} className="space-y-4">
              {actionType === "APPROVE" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Final Approved Total Price ($)
                  </label>
                  <input
                    type="number"
                    value={totalPriceInput}
                    onChange={(e) => setTotalPriceInput(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white font-mono"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Rejection Reason (Required)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide specific feedback to borrower..."
                    required
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActionBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-md disabled:opacity-50 transition-all ${
                    actionType === "APPROVE"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-rose-600 hover:bg-rose-500"
                  }`}
                >
                  {isSubmittingAction
                    ? "Dispatching..."
                    : actionType === "APPROVE"
                    ? "Confirm Approval"
                    : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline Drawer */}
      {timelineBookingId && (
        <TimelineDrawer
          bookingId={timelineBookingId}
          onClose={() => setTimelineBookingId(null)}
        />
      )}

      {/* Borrower Profile Inspection Modal */}
      <BorrowerProfileModal
        borrowerId={inspectingBorrowerId}
        isOpen={!!inspectingBorrowerId}
        onClose={() => setInspectingBorrowerId(null)}
      />
    </div>
  );
};
