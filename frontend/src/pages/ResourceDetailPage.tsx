import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api, { extractData } from "@/lib/api";
import { Resource, ActiveBooking, Qualification } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { ResourceStatusBadge } from "@/components/StatusBadge";
import { CollisionCalendar } from "@/components/CollisionCalendar";
import { toast } from "sonner";
import {
  MapPin,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Download,
  DollarSign,
  User as UserIcon,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const ResourceDetailPage: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [resource, setResource] = useState<Resource | null>(null);
  const [activeBookings, setActiveBookings] = useState<ActiveBooking[]>([]);
  const [userQualifications, setUserQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Reservation Form State
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [purpose, setPurpose] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!resourceId) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/resources/${resourceId}`);
        const data = extractData<{ resource: Resource; activeBookings: ActiveBooking[] }>(res);
        if (data && data.resource) {
          setResource(data.resource);
          setActiveBookings(data.activeBookings || []);
          if (data.resource.image && data.resource.image.length > 0) {
            setSelectedImage(data.resource.image[0]);
          }
        }
      } catch (err) {
        toast.error("Could not load equipment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [resourceId]);

  // Fetch logged in user qualifications to check eligibility
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUserQuals = async () => {
      try {
        const res = await api.get("/qualifications/my");
        const list = extractData<Qualification[]>(res);
        if (Array.isArray(list)) {
          setUserQualifications(list);
        }
      } catch (err) {
        // Non-blocking
      }
    };
    fetchUserQuals();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
        <p className="mt-3 text-xs font-mono text-slate-400 uppercase tracking-widest">
          Loading Resource Dossier...
        </p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-card rounded-2xl text-center">
        <h2 className="text-lg font-bold text-white">Resource Not Found</h2>
        <p className="text-xs text-slate-400 mt-2">The requested resource could not be found or has been decommissioned.</p>
        <Link to="/" className="inline-block mt-4 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-semibold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Cross-check required safety qualifications
  const approvedQualNames = userQualifications
    .filter((q) => q.status === "APPROVED")
    .map((q) => q.qualificationName.toUpperCase());

  const missingQualifications = (resource.requiredQualification || []).filter(
    (reqQ) => !approvedQualNames.includes(reqQ.toUpperCase())
  );

  const hasAllQualifications = missingQualifications.length === 0;

  // Calculate estimated total price
  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    if (resource.pricingType === "PER_DAY") {
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays * resource.pricePerUnit;
    } else {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      return Math.max(diffHours, 1) * resource.pricePerUnit;
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in to request equipment reservations.");
      navigate("/login", { state: { from: `/resources/${resourceId}` } });
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select a valid start and end reservation date on the calendar.");
      return;
    }

    if (!purpose.trim()) {
      toast.error("Please state the research or educational purpose for this reservation.");
      return;
    }

    setIsSubmitting(true);
    try {
      // CRITICAL PAYLOAD: Backend expects 'resouceId' (exact spelling!)
      const payload = {
        resouceId: resource._id,
        purpose: purpose.trim(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const res = await api.post("/bookings/request", payload);
      const resData = extractData<any>(res);
      if (resData?.isWaitlisted || resData?.status === "WAITLISTED") {
        toast.info(res.data?.normalizedMessage || res.data?.message || "Overlapping dates detected. You have been placed on the Waiting List!");
      } else {
        toast.success("Reservation request dispatched to owner for approval!");
      }
      navigate("/dashboard/borrower");
    } catch (err: any) {
      // Handled by global interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Gallery, Specs & SOPs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Hero Image */}
          <div className="rounded-2xl overflow-hidden glass-card border border-slate-800 bg-slate-950 aspect-[16/10] relative">
            <img
              src={selectedImage || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"}
              alt={resource.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <ResourceStatusBadge status={resource.status} />
            </div>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-xs font-mono font-semibold uppercase text-brand-300 border border-brand-500/30">
              {resource.category}
            </div>
          </div>

          {/* Thumbnails Gallery */}
          {resource.image && resource.image.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {resource.image.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === imgUrl
                      ? "border-brand-500 ring-2 ring-brand-500/30"
                      : "border-slate-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={imgUrl} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Title & Core Overview */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{resource.title}</h1>
              {resource.location && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                  <MapPin className="w-4 h-4 text-brand-400" />
                  <span>
                    {resource.location.firstLine}
                    {resource.location.secondLine ? `, ${resource.location.secondLine}` : ""},{" "}
                    {resource.location.state}, {resource.location.country}
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {resource.description}
            </p>

            {/* Terms and Downloadable SOP Document */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-400" />
                Terms of Use & Standard Operating Procedures
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {resource.termsAndCondition}
              </p>

              {resource.termsDocs && (
                <a
                  href={resource.termsDocs}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-brand-300 border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Lab Safety Manual (PDF)</span>
                </a>
              )}
            </div>
          </div>

          {/* Safety Qualification Warnings */}
          {resource.requiredQualification && resource.requiredQualification.length > 0 && (
            <div className={`p-5 rounded-2xl border ${hasAllQualifications ? "glass-card border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30"} space-y-3`}>
              <div className="flex items-center gap-2">
                {hasAllQualifications ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                )}
                <h3 className="text-sm font-bold text-white">
                  {hasAllQualifications ? "Safety Qualifications Verified" : "Mandatory SOP Qualification Gating"}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {resource.requiredQualification.map((qual) => {
                  const isUserCertified = approvedQualNames.includes(qual.toUpperCase());
                  return (
                    <span
                      key={qual}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 ${
                        isUserCertified
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      {isUserCertified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                      <span>{qual}</span>
                    </span>
                  );
                })}
              </div>

              {!hasAllQualifications && (
                <div className="text-xs text-amber-200/90 pt-1 flex items-center justify-between">
                  <span>
                    You are missing approved certificates for: <strong>{missingQualifications.join(", ")}</strong>.
                  </span>
                  <Link
                    to="/qualifications"
                    className="underline font-semibold hover:text-white shrink-0 ml-2"
                  >
                    Upload SOP Certificate →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Pricing, Collision Calendar & Booking Request */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
            {/* Price Header */}
            <div className="flex items-baseline justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-3xl font-extrabold font-mono text-white">
                  ${resource.pricePerUnit}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {" "}/ {resource.pricingType === "PER_DAY" ? "day" : "hour"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Security Deposit:</span>
                <p className="text-sm font-mono font-semibold text-slate-200">${resource.securityDeposit}</p>
              </div>
            </div>

            {/* Rules pills */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                <span>Max {resource.maxBookingDays} Days</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-accent-400" />
                <span>{resource.requireSupervision ? "Supervision Req." : "Autonomous"}</span>
              </div>
            </div>

            {/* Interactive Availability Calendar */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Reservation Window (Collision-Aware)
              </label>
              <CollisionCalendar
                activeBookings={activeBookings}
                startDate={startDate}
                endDate={endDate}
                maxBookingDays={resource.maxBookingDays}
                onSelectRange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
              />
            </div>

            {/* Booking Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Research Purpose / Project Description
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="State the academic course, project name, or experiment objectives..."
                  rows={2}
                  required
                  className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white placeholder-slate-500"
                />
              </div>

              {/* Live Cost Calculation breakdown */}
              {startDate && endDate && (
                <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span>Usage Estimation:</span>
                    <span className="font-mono font-semibold">${calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Security Deposit (refundable):</span>
                    <span className="font-mono">${resource.securityDeposit}</span>
                  </div>
                  <div className="pt-1.5 border-t border-brand-500/20 flex justify-between font-bold text-white">
                    <span>Estimated Total:</span>
                    <span className="font-mono text-brand-300">${calculateTotal() + resource.securityDeposit}</span>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || resource.status !== "AVAILABLE"}
                className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 shadow-glow-brand disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? "Dispatching Booking Request..."
                    : resource.status !== "AVAILABLE"
                    ? "Resource Currently Unavailable"
                    : startDate && endDate && activeBookings.some((b) => {
                        const bStart = new Date(b.startDate);
                        const bEnd = new Date(b.endDate);
                        return bStart < endDate && bEnd > startDate;
                      })
                    ? "Join Waiting List (Scheduled Sequentially)"
                    : "Request Booking Approval"}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
