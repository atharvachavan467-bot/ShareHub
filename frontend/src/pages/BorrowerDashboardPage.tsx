import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { extractData } from "@/lib/api";
import { Booking, BookingStatus } from "@/types";
import { BookingStatusBadge, ConditionRatingBadge } from "@/components/StatusBadge";
import { CheckInModal } from "@/components/CheckInModal";
import { CheckOutModal } from "@/components/CheckOutModal";
import { TimelineDrawer } from "@/components/TimelineDrawer";
import { ReportIncidentModal } from "@/components/ReportIncidentModal";
import { format } from "date-fns";
import {
  CalendarCheck2,
  PackageCheck,
  RotateCcw,
  History,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";

export const BorrowerDashboardPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal State Handlers
  const [selectedBookingForCheckIn, setSelectedBookingForCheckIn] = useState<string | null>(null);
  const [selectedBookingForCheckOut, setSelectedBookingForCheckOut] = useState<string | null>(null);
  const [selectedBookingForTimeline, setSelectedBookingForTimeline] = useState<string | null>(null);
  const [selectedBookingForIncident, setSelectedBookingForIncident] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      const res = await api.get("/bookings/my-bookings", { params });
      const data = extractData<Booking[]>(res);
      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Failed to load user bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const tabs = [
    { label: "All Bookings", value: "ALL" },
    { label: "Waiting List", value: "WAITLISTED" },
    { label: "Pending", value: "PENDING_APPROVAL" },
    { label: "Approved / Ready", value: "APPROVED" },
    { label: "Active In-Use", value: "CHECKED_IN" },
    { label: "Returned", value: "RETURNED" },
    { label: "Overdue", value: "OVERDUE" },
    { label: "Rejected", value: "REJECTED" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-500/30 bg-brand-500/10 text-xs font-semibold text-brand-300 mb-2">
            <CalendarCheck2 className="w-3.5 h-3.5 text-brand-400" />
            <span>Borrower Resource Operations</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">My Active Bookings & History</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track equipment pickup, returns, before/after photo audits, and timeline logs.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors shadow-glow-brand self-start sm:self-auto"
        >
          <span>Reserve New Equipment</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all ${
              statusFilter === tab.value
                ? "bg-brand-500 text-white shadow-glow-brand"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
          <p className="mt-3 text-xs font-mono text-slate-400 uppercase tracking-widest">
            Synchronizing Booking Records...
          </p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400">
            {statusFilter === "ALL"
              ? "You haven't requested any equipment or lab resources yet."
              : `No bookings found with status '${statusFilter}'.`}
          </p>
          <Link
            to="/"
            className="inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const resource = typeof booking.resouceId === "object" ? booking.resouceId : null;
            const resTitle = resource ? (resource as any).title : "Lab Resource";
            const resImage =
              resource && (resource as any).image && (resource as any).image[0]
                ? (resource as any).image[0]
                : "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80";

            return (
              <div
                key={booking._id}
                className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left: Thumbnail + Title + Dates */}
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={resImage}
                    alt={resTitle}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-950 border border-slate-700 shrink-0"
                  />
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base sm:text-lg text-white">{resTitle}</h3>
                      <BookingStatusBadge status={booking.status} size="sm" />
                      {booking.isWaitlisted && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Waiting List #{booking.waitlistPosition || 1}
                        </span>
                      )}
                      {booking.status === "RETURNED" && !booking.rejectionReason && (
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          ✨ On-Time Bonus Awarded
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                      <span>Start: {format(new Date(booking.startDate), "MMM dd, yyyy")}</span>
                      <span>End: {format(new Date(booking.endDate), "MMM dd, yyyy")}</span>
                      {booking.totalPrice !== undefined && (
                        <span className="text-brand-300 font-semibold">Total: ${booking.totalPrice}</span>
                      )}
                    </div>

                    {booking.isWaitlisted && (
                      <p className="text-xs text-amber-300/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/25 font-mono">
                        ⏳ Queued on Waiting List (Position #{booking.waitlistPosition || 1}): Scheduled to begin automatically on {format(new Date(booking.startDate), "MMM dd, yyyy")} right after the current borrower completes.
                      </p>
                    )}

                    {booking.purpose && (
                      <p className="text-xs text-slate-400 italic line-clamp-1">
                        Purpose: "{booking.purpose}"
                      </p>
                    )}

                    {booking.rejectionReason && (
                      <p className="text-xs text-rose-400 font-medium">
                        Rejection Note: {booking.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Action CTAs depending on state */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-end lg:self-center">
                  {/* Timeline Audit Button (Always available) */}
                  <button
                    onClick={() => setSelectedBookingForTimeline(booking._id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold glass-card text-slate-300 hover:text-white border-slate-700 hover:border-slate-600 flex items-center gap-1.5 transition-all"
                  >
                    <History className="w-3.5 h-3.5 text-brand-400" />
                    <span>Audit Log</span>
                  </button>

                  {/* Report Incident Button */}
                  <button
                    onClick={() => setSelectedBookingForIncident(booking._id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1.5 transition-all"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Report Issue</span>
                  </button>

                  {/* Check-In / Pickup Action (Only for APPROVED) */}
                  {booking.status === "APPROVED" && (
                    <button
                      onClick={() => setSelectedBookingForCheckIn(booking._id)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-900/40 flex items-center gap-1.5 transition-all animate-pulse"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Check-In / Pickup</span>
                    </button>
                  )}

                  {/* Checkout / Return Action (For CHECKED_IN or OVERDUE) */}
                  {(booking.status === "CHECKED_IN" || booking.status === "OVERDUE") && (
                    <button
                      onClick={() => setSelectedBookingForCheckOut(booking._id)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/40 flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Checkout / Return</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedBookingForCheckIn && (
        <CheckInModal
          bookingId={selectedBookingForCheckIn}
          isOpen={!!selectedBookingForCheckIn}
          onClose={() => setSelectedBookingForCheckIn(null)}
          onSuccess={fetchBookings}
        />
      )}

      {selectedBookingForCheckOut && (
        <CheckOutModal
          bookingId={selectedBookingForCheckOut}
          isOpen={!!selectedBookingForCheckOut}
          onClose={() => setSelectedBookingForCheckOut(null)}
          onSuccess={fetchBookings}
        />
      )}

      {selectedBookingForTimeline && (
        <TimelineDrawer
          bookingId={selectedBookingForTimeline}
          onClose={() => setSelectedBookingForTimeline(null)}
        />
      )}

      {selectedBookingForIncident && (
        <ReportIncidentModal
          bookingId={selectedBookingForIncident}
          isOpen={!!selectedBookingForIncident}
          onClose={() => setSelectedBookingForIncident(null)}
          onSuccess={fetchBookings}
        />
      )}
    </div>
  );
};
