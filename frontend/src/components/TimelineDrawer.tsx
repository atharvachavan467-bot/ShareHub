import React, { useEffect, useState } from "react";
import api, { extractData } from "@/lib/api";
import { Booking, AuditLog, Incident } from "@/types";
import { BookingStatusBadge } from "./StatusBadge";
import { format } from "date-fns";
import {
  X,
  History,
  ShieldCheck,
  AlertTriangle,
  User as UserIcon,
  Clock,
  Camera,
  ExternalLink,
} from "lucide-react";

interface TimelineDrawerProps {
  bookingId: string | null;
  onClose: () => void;
}

export const TimelineDrawer: React.FC<TimelineDrawerProps> = ({
  bookingId,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [timeline, setTimeline] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (!bookingId) return;

    const fetchTimeline = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/bookings/${bookingId}/timeline`);
        const data = extractData<{ booking: Booking; timeline: AuditLog[] }>(res);
        if (data) {
          setBooking(data.booking);
          setTimeline(data.timeline || []);
        }
      } catch (err) {
        console.error("Failed to load timeline", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [bookingId]);

  if (!bookingId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-surface-900 border-l border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-surface-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Auditable Booking Timeline</h2>
              <p className="text-xs text-slate-400 font-mono">ID: {bookingId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
              <p className="text-xs text-slate-400 mt-3 font-mono">Loading immutable audit logs...</p>
            </div>
          ) : (
            <>
              {/* Booking Summary Box */}
              {booking && (
                <div className="p-4 rounded-xl glass-card border-slate-700 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-mono tracking-wider">Resource</p>
                      <h4 className="font-bold text-white text-base">
                        {typeof booking.resouceId === "object" ? (booking.resouceId as any).title : "Lab Equipment"}
                      </h4>
                    </div>
                    <BookingStatusBadge status={booking.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-slate-400">Scheduled Start:</span>
                      <p className="font-mono text-slate-200 mt-0.5">
                        {format(new Date(booking.startDate), "MMM dd, yyyy HH:mm")}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Scheduled End:</span>
                      <p className="font-mono text-slate-200 mt-0.5">
                        {format(new Date(booking.endDate), "MMM dd, yyyy HH:mm")}
                      </p>
                    </div>
                  </div>

                  {booking.purpose && (
                    <div className="text-xs pt-2 border-t border-slate-800">
                      <span className="text-slate-400">Stated Purpose:</span>
                      <p className="text-slate-300 italic mt-0.5">"{booking.purpose}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Photo Verification Artifacts */}
              {booking && (booking.beforePhotoURI?.length || booking.afterPhotoURI?.length) ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-brand-400" />
                    Condition Audit Photos
                  </h4>

                  {booking.beforePhotoURI && booking.beforePhotoURI.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-slate-300">
                        Check-In / Pickup Condition ({booking.beforePhotoURI.length})
                      </span>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {booking.beforePhotoURI.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-950 group relative"
                          >
                            <img src={url} alt={`Pickup ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <ExternalLink className="w-4 h-4 text-white" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {booking.afterPhotoURI && booking.afterPhotoURI.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-medium text-slate-300">
                        Return / Checkout Condition ({booking.afterPhotoURI.length})
                      </span>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {booking.afterPhotoURI.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-950 group relative"
                          >
                            <img src={url} alt={`Return ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <ExternalLink className="w-4 h-4 text-white" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Audit Timeline Feed */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Chronological Audit Log
                </h4>

                {timeline.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No audit records generated yet.</p>
                ) : (
                  <div className="relative pl-6 space-y-6 border-l-2 border-slate-800">
                    {timeline.map((event, idx) => (
                      <div key={event._id || idx} className="relative group">
                        {/* Dot */}
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-surface-900 border-2 border-brand-500 group-hover:scale-125 transition-transform" />

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-mono text-brand-300 uppercase tracking-wide">
                              {event.action}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {format(new Date(event.createdAt), "MMM dd, HH:mm")}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80">
                            {event.notes}
                          </p>

                          {event.actorId && event.actorId.fullname && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                              {event.actorId.avatar ? (
                                <img
                                  src={event.actorId.avatar}
                                  alt={event.actorId.fullname}
                                  className="w-4 h-4 rounded-full object-cover"
                                />
                              ) : (
                                <UserIcon className="w-3.5 h-3.5" />
                              )}
                              <span>Actor: {event.actorId.fullname}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
