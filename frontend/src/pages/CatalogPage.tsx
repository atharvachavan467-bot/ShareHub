import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api, { extractData } from "@/lib/api";
import { Resource, ResourceCategory, PaginatedResources } from "@/types";
import { HeroSection } from "@/components/HeroSection";
import { ResourceStatusBadge } from "@/components/StatusBadge";
import {
  Search,
  Filter,
  Layers,
  MapPin,
  Calendar,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export const CatalogPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("AVAILABLE");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const catalogRef = useRef<HTMLDivElement>(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 9 };
      if (search.trim()) params.search = search.trim();
      if (category !== "ALL") params.category = category;
      if (status !== "ALL") params.status = status;

      const res = await api.get("/resources", { params });
      const data = extractData<PaginatedResources>(res);

      if (data && data.resources) {
        setResources(data.resources);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || data.resources.length);
        }
      } else if (Array.isArray(data)) {
        setResources(data);
        setTotalPages(1);
        setTotalCount(data.length);
      }
    } catch (err) {
      console.error("Failed to fetch resources", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResources();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category, status, page]);

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* 3D Interactive Hero */}
      <HeroSection onExploreClick={scrollToCatalog} />

      {/* Main Catalog Section */}
      <div ref={catalogRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Filter Controls Bar */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search resources, optics, 3D printers, lasers..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-500"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {["ALL", "PRODUCT", "SERVICE"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all ${
                    category === cat
                      ? "bg-brand-500 text-white shadow-glow-brand"
                      : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  {cat === "ALL" ? "All Categories" : cat === "PRODUCT" ? "Equipment / Hardware" : "Lab Services"}
                </button>
              ))}
            </div>

            {/* Status Filter Toggle */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <span className="text-xs text-slate-400 font-medium">Status:</span>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-900 text-slate-200 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-brand-500"
              >
                <option value="AVAILABLE">Available Only</option>
                <option value="ALL">All Statuses</option>
                <option value="IN_USE">In Use</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Results count label */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
            <span>
              Showing <strong className="text-white">{resources.length}</strong> of <strong className="text-white">{totalCount}</strong> verified resource assets
            </span>
            <span>Page {page} of {totalPages}</span>
          </div>
        </div>

        {/* Resources Cards Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
            <p className="mt-3 text-xs font-mono text-slate-400 uppercase tracking-widest">
              Querying Institutional Inventory...
            </p>
          </div>
        ) : resources.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 border border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No Equipment Found</h3>
            <p className="text-xs text-slate-400">
              No active equipment or services match the current filter criteria. Try adjusting your search query or reset filters.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("ALL");
                setStatus("AVAILABLE");
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resItem) => {
              const primaryImage =
                resItem.image && resItem.image.length > 0
                  ? resItem.image[0]
                  : "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80";

              return (
                <div
                  key={resItem._id}
                  className="glass-card rounded-2xl overflow-hidden border border-slate-800/90 flex flex-col group"
                >
                  {/* Card Image Banner */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                    <img
                      src={primaryImage}
                      alt={resItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

                    {/* Status Pill */}
                    <div className="absolute top-3 left-3">
                      <ResourceStatusBadge status={resItem.status} />
                    </div>

                    {/* Category Tag */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-mono font-semibold uppercase text-brand-300 border border-brand-500/30">
                      {resItem.category}
                    </div>

                    {/* Pricing Badge */}
                    <div className="absolute bottom-3 left-3 text-white">
                      <span className="text-xl font-extrabold font-mono tracking-tight">
                        ${resItem.pricePerUnit}
                      </span>
                      <span className="text-xs text-slate-300 font-mono">
                        {" "}/ {resItem.pricingType === "PER_DAY" ? "day" : "hr"}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                        {resItem.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {resItem.description}
                      </p>
                    </div>

                    {/* Location & Safety Metadata */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                      {resItem.location && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                          <span className="truncate">
                            {resItem.location.firstLine}, {resItem.location.state}
                          </span>
                        </div>
                      )}

                      {/* Required Qualification warning pill */}
                      {resItem.requiredQualification && resItem.requiredQualification.length > 0 && (
                        <div className="flex items-center gap-1.5 text-amber-300 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 text-[11px]">
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            Requires: {resItem.requiredQualification.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Footer CTAs */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="text-[11px] text-slate-400">
                        Deposit: <strong className="text-slate-200 font-mono">${resItem.securityDeposit}</strong>
                      </div>

                      <Link
                        to={`/resources/${resItem._id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-500/20 text-brand-300 hover:bg-brand-500 hover:text-white border border-brand-500/30 transition-all group-hover:shadow-glow-brand"
                      >
                        <span>View & Reserve</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 rounded-xl glass-card text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl font-mono text-xs font-semibold transition-all ${
                  page === p
                    ? "bg-brand-500 text-white shadow-glow-brand"
                    : "glass-card text-slate-400 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 rounded-xl glass-card text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
