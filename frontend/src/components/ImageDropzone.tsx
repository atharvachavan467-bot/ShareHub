import React, { useRef } from "react";
import { UploadCloud, X, Image as ImageIcon, AlertCircle } from "lucide-react";

interface ImageDropzoneProps {
  images: File[];
  onChange: (files: File[]) => void;
  minImages?: number;
  maxImages?: number;
  label?: string;
  description?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  images,
  onChange,
  minImages = 1,
  maxImages = 5,
  label = "Upload Condition & Verification Photos",
  description = "Upload 1 to 5 high-resolution condition photos for audit proof.",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const validFiles: File[] = [];
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      if (file.type.startsWith("image/")) {
        validFiles.push(file);
      }
    }

    const combined = [...images, ...validFiles].slice(0, maxImages);
    onChange(combined);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
          {label}
        </label>
        <span
          className={`text-xs font-mono font-medium ${
            images.length < minImages ? "text-amber-400" : "text-emerald-400"
          }`}
        >
          {images.length} / {maxImages} uploaded (min {minImages})
        </span>
      </div>

      {description && <p className="text-xs text-slate-400">{description}</p>}

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
          images.length >= maxImages
            ? "border-slate-800 bg-slate-900/40 pointer-events-none opacity-60"
            : "border-slate-700/80 hover:border-brand-500 bg-slate-900/30 hover:bg-brand-500/5"
        }`}
      >
        <UploadCloud className="w-8 h-8 text-brand-400 mb-2 animate-bounce" />
        <p className="text-sm font-medium text-slate-200">
          Click to upload or drag & drop photos
        </p>
        <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP up to 10MB each</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Thumbnails Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
          {images.map((file, idx) => {
            const previewUrl = URL.createObjectURL(file);
            return (
              <div
                key={idx}
                className="relative group aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-950"
              >
                <img
                  src={previewUrl}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(idx);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-rose-600/90 text-white opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow-md"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
                  #{idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {images.length < minImages && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400 pt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>At least {minImages} photo is required for compliance audit.</span>
        </div>
      )}
    </div>
  );
};
