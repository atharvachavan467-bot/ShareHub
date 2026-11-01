import React, { useState } from "react";
import api from "@/lib/api";
import { Resource, ResourceCategory, PricingType } from "@/types";
import { ImageDropzone } from "./ImageDropzone";
import { toast } from "sonner";
import { X, Cpu, FileText } from "lucide-react";

interface CreateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Resource | null;
}

export const CreateResourceModal: React.FC<CreateResourceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState<ResourceCategory>(initialData?.category || "PRODUCT");
  const [pricingType, setPricingType] = useState<PricingType>(initialData?.pricingType || "PER_DAY");
  const [pricePerUnit, setPricePerUnit] = useState(initialData?.pricePerUnit?.toString() || "25");
  const [securityDeposit, setSecurityDeposit] = useState(initialData?.securityDeposit?.toString() || "100");
  const [termsAndCondition, setTermsAndCondition] = useState(
    initialData?.termsAndCondition || "Standard lab safety protocol adherence required. Must clean work area post-use."
  );
  const [maxBookingDays, setMaxBookingDays] = useState(initialData?.maxBookingDays?.toString() || "7");
  const [requireSupervision, setRequireSupervision] = useState(initialData?.requireSupervision || false);

  // Location fields
  const [firstLine, setFirstLine] = useState(initialData?.location?.firstLine || "");
  const [secondLine, setSecondLine] = useState(initialData?.location?.secondLine || "");
  const [state, setState] = useState(initialData?.location?.state || "");
  const [country, setCountry] = useState(initialData?.location?.country || "");

  // Required qualifications array
  const [qualifications, setQualifications] = useState<string[]>(
    initialData?.requiredQualification || ["LASER_SAFETY_LEVEL_1"]
  );
  const [newQualInput, setNewQualInput] = useState("");

  // Files
  const [images, setImages] = useState<File[]>([]);
  const [termsDocFile, setTermsDocFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddQual = () => {
    if (!newQualInput.trim()) return;
    const formatted = newQualInput.trim().toUpperCase().replace(/\s+/g, "_");
    if (!qualifications.includes(formatted)) {
      setQualifications([...qualifications, formatted]);
    }
    setNewQualInput("");
  };

  const handleRemoveQual = (q: string) => {
    setQualifications(qualifications.filter((item) => item !== q));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("pricingType", pricingType);
      formData.append("pricePerUnit", pricePerUnit || "0");
      formData.append("securityDeposit", securityDeposit || "0");
      formData.append("termsAndCondition", termsAndCondition.trim() || "Standard laboratory rules apply.");
      formData.append("maxBookingDays", maxBookingDays || "7");
      formData.append("requireSupervision", String(requireSupervision));

      // CRITICAL BACKEND SERIALIZATION: Must be stringified JSON
      formData.append(
        "location",
        JSON.stringify({
          firstLine: firstLine.trim() || "Main Campus Facility",
          secondLine: secondLine.trim() || "",
          state: state.trim() || "Main Campus",
          country: country.trim() || "Institutional",
        })
      );

      formData.append("requiredQualification", JSON.stringify(qualifications));

      images.forEach((img) => {
        formData.append("images", img);
      });

      if (termsDocFile) {
        formData.append("termsDocs", termsDocFile);
      }

      if (initialData) {
        await api.patch(`/resources/update/${initialData._id}`, formData);
        toast.success("Resource successfully updated!");
      } else {
        await api.post("/resources/create", formData);
        toast.success("New equipment successfully published to catalog!");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      // Handled by global interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl glass-modal rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-surface-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">
                {initialData ? "Update Equipment Asset" : "List New Lab Resource"}
              </h2>
              <p className="text-xs text-slate-400">Owner Inventory Studio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Resource Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Formlabs Form 4 SLA 3D Printer"
                required
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs text-white bg-slate-900"
              >
                <option value="PRODUCT">PRODUCT (Hardware)</option>
                <option value="SERVICE">SERVICE (Lab Test)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Detailed Description & Capabilities
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact machine specs, laser power, bed dimensions, optical precision, etc."
              rows={3}
              required
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* Pricing & Deposit */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Pricing Type
              </label>
              <select
                value={pricingType}
                onChange={(e) => setPricingType(e.target.value as PricingType)}
                className="w-full px-2.5 py-2 rounded-xl glass-input text-xs text-white bg-slate-900"
              >
                <option value="PER_DAY">PER_DAY</option>
                <option value="PER_HOUR">PER_HOUR</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Price / Unit ($)
              </label>
              <input
                type="number"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Security Deposit ($)
              </label>
              <input
                type="number"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Max Days
              </label>
              <input
                type="number"
                value={maxBookingDays}
                onChange={(e) => setMaxBookingDays(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Location fields */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Location
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={firstLine}
                onChange={(e) => setFirstLine(e.target.value)}
                placeholder="Lab / Building / Room Location (e.g. Quantum Lab 301)"
                required
                className="w-full sm:col-span-2 px-3 py-2 rounded-xl glass-input text-xs text-white"
              />
              <input
                type="text"
                value={secondLine}
                onChange={(e) => setSecondLine(e.target.value)}
                placeholder="Floor / Area / Bench # (Optional)"
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
              />
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Department / Division (Optional)"
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
              />
            </div>
          </div>

          {/* Safety Qualification Tags */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Required Safety Qualifications (SOP Gating)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newQualInput}
                onChange={(e) => setNewQualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddQual();
                  }
                }}
                placeholder="e.g. 3D_PRINTER_SOP, LASER_SAFETY"
                className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
              />
              <button
                type="button"
                onClick={handleAddQual}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Add SOP
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {qualifications.map((q) => (
                <span
                  key={q}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5"
                >
                  <span>{q}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQual(q)}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Supervision Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="requireSupervision"
              checked={requireSupervision}
              onChange={(e) => setRequireSupervision(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-0"
            />
            <label htmlFor="requireSupervision" className="text-xs text-slate-300">
              Mandate certified lab technician supervision during all operational hours
            </label>
          </div>

          {/* Images Upload */}
          <ImageDropzone
            images={images}
            onChange={setImages}
            minImages={initialData ? 0 : 1}
            maxImages={5}
            label="Equipment Photos (1–5 Files)"
            description="High-resolution photos showcasing the unit, manufacturer plate, and lab environment."
          />

          {/* PDF Terms Upload */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Safety Manual / SOP Document (Optional PDF)
            </label>
            <label className="cursor-pointer py-2.5 px-4 rounded-xl glass-input text-xs text-slate-300 hover:text-white flex items-center gap-2 border-dashed border-slate-700">
              <FileText className="w-4 h-4 text-purple-400" />
              <span className="truncate">{termsDocFile ? termsDocFile.name : "Select SOP PDF Document"}</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => e.target.files && setTermsDocFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          {/* Terms & Conditions Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Operating Protocols & Terms
            </label>
            <textarea
              value={termsAndCondition}
              onChange={(e) => setTermsAndCondition(e.target.value)}
              rows={2}
              required
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/40 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSubmitting ? "Uploading Resource Dossier..." : initialData ? "Save Modifications" : "Register Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
