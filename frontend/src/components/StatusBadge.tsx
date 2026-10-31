import React from "react";
import {
  BookingStatus,
  ResourceStatus,
  IncidentSeverity,
  IncidentStatus,
  QualificationStatus,
  ConditionRating,
} from "@/types";
import {
  Clock,
  CheckCircle2,
  PackageCheck,
  RotateCcw,
  AlertTriangle,
  XCircle,
  Ban,
  Activity,
  Wrench,
  AlertOctagon,
  ShieldAlert,
} from "lucide-react";

export const BookingStatusBadge: React.FC<{ status: BookingStatus; size?: "sm" | "md" }> = ({
  status,
  size = "md",
}) => {
  const config: Record<BookingStatus, { label: string; bg: string; text: string; icon: any }> = {
    PENDING_APPROVAL: {
      label: "Pending Approval",
      bg: "bg-amber-500/10 border-amber-500/25",
      text: "text-amber-400",
      icon: Clock,
    },
    APPROVED: {
      label: "Approved & Ready",
      bg: "bg-emerald-500/15 border-emerald-500/30",
      text: "text-emerald-400",
      icon: CheckCircle2,
    },
    CHECKED_IN: {
      label: "Active In-Use",
      bg: "bg-cyan-500/15 border-cyan-500/30",
      text: "text-cyan-400",
      icon: PackageCheck,
    },
    RETURNED: {
      label: "Returned",
      bg: "bg-blue-500/15 border-blue-500/30",
      text: "text-blue-400",
      icon: RotateCcw,
    },
    OVERDUE: {
      label: "Overdue Return",
      bg: "bg-rose-500/20 border-rose-500/40 animate-pulse",
      text: "text-rose-400 font-bold",
      icon: AlertTriangle,
    },
    REJECTED: {
      label: "Rejected",
      bg: "bg-slate-500/15 border-slate-500/30",
      text: "text-slate-400",
      icon: XCircle,
    },
    CANCELLED: {
      label: "Cancelled",
      bg: "bg-zinc-500/15 border-zinc-500/30",
      text: "text-zinc-400",
      icon: Ban,
    },
    WAITLISTED: {
      label: "Waiting List",
      bg: "bg-purple-500/20 border-purple-500/40",
      text: "text-purple-300 font-semibold",
      icon: Clock,
    },
  };

  const item = config[status] || {
    label: status,
    bg: "bg-slate-800 border-slate-700",
    text: "text-slate-300",
    icon: Clock,
  };

  const Icon = item.icon;
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-2.5 py-1 text-xs font-medium gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-sm ${item.bg} ${item.text} ${sizeClasses}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{item.label}</span>
    </span>
  );
};

export const ResourceStatusBadge: React.FC<{ status: ResourceStatus }> = ({ status }) => {
  const config: Record<ResourceStatus, { label: string; dot: string; text: string; bg: string }> = {
    AVAILABLE: {
      label: "Available",
      dot: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
      text: "text-emerald-300",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    IN_USE: {
      label: "Currently In Use",
      dot: "bg-amber-400 shadow-[0_0_8px_#fbbf24]",
      text: "text-amber-300",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    MAINTENANCE: {
      label: "Under Maintenance",
      dot: "bg-purple-400 shadow-[0_0_8px_#c084fc]",
      text: "text-purple-300",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
  };

  const item = config[status] || config.AVAILABLE;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${item.bg} ${item.text}`}>
      <span className={`w-2 h-2 rounded-full ${item.dot}`} />
      <span>{item.label}</span>
    </span>
  );
};

export const IncidentSeverityBadge: React.FC<{ severity: IncidentSeverity }> = ({ severity }) => {
  const styles: Record<IncidentSeverity, string> = {
    LOW: "bg-blue-500/15 border-blue-500/30 text-blue-400",
    MEDIUM: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    HIGH: "bg-orange-500/15 border-orange-500/30 text-orange-400 font-semibold",
    CRITICAL: "bg-rose-500/25 border-rose-500/50 text-rose-300 font-bold animate-pulse",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${styles[severity] || styles.LOW}`}>
      <AlertOctagon className="w-3 h-3" />
      <span>{severity}</span>
    </span>
  );
};

export const QualificationStatusBadge: React.FC<{ status: QualificationStatus }> = ({ status }) => {
  const styles: Record<QualificationStatus, { bg: string; text: string; icon: any }> = {
    PENDING: {
      bg: "bg-amber-500/15 border-amber-500/30",
      text: "text-amber-400",
      icon: Clock,
    },
    APPROVED: {
      bg: "bg-emerald-500/15 border-emerald-500/30",
      text: "text-emerald-400",
      icon: CheckCircle2,
    },
    REJECTED: {
      bg: "bg-rose-500/15 border-rose-500/30",
      text: "text-rose-400",
      icon: XCircle,
    },
  };

  const item = styles[status] || styles.PENDING;
  const Icon = item.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${item.bg} ${item.text}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{status}</span>
    </span>
  );
};

export const ConditionRatingBadge: React.FC<{ rating?: ConditionRating }> = ({ rating = "GOOD" }) => {
  const styles: Record<ConditionRating, { bg: string; text: string }> = {
    GOOD: { bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400" },
    FAIR: { bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-400" },
    DAMAGED: { bg: "bg-rose-500/20 border-rose-500/40", text: "text-rose-400 font-semibold" },
  };

  const item = styles[rating] || styles.GOOD;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border ${item.bg} ${item.text}`}>
      {rating}
    </span>
  );
};
