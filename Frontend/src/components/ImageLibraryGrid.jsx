import React, { useState } from "react";
import { Copy, CheckCircle, Trash2, Check, ImageOff, Loader } from "lucide-react";

import { copyToClipboard } from "../lib/imageApi";
import { formatBytes } from "../lib/imageSpec";

const FALLBACK = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80";

function ImageCard({ image, onSelect, onDelete, selected }) {
  const [copied, setCopied] = useState(false);

  const url = image.file_url || image.url || "";

  const handleCopy = async () => {
    if (!url) return;
    const ok = await copyToClipboard(url);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-md border transition-all duration-300 flex flex-col group ${
        selected
          ? "border-[#6B4A2D] ring-4 ring-[#6B4A2D]/15"
          : "border-gray-100 hover:shadow-xl hover:-translate-y-0.5"
      }`}
    >
      <button
        type="button"
        onClick={onSelect ? () => onSelect(image) : undefined}
        className={`relative w-full overflow-hidden bg-gray-100 ${onSelect ? "cursor-pointer" : "cursor-default"}`}
        style={{ aspectRatio: "16/9" }}
        title={onSelect ? "Use this image" : url}
      >
        <img
          src={url || FALLBACK}
          alt={image.original_name || image.filename}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK; }}
        />
        {selected && (
          <span className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full shadow" style={{ background: "#6B4A2D", color: "#fff" }}>
            <Check size={10} /> Selected
          </span>
        )}
      </button>

      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <p className="text-xs font-bold text-gray-800 truncate" title={image.original_name || image.filename}>
          {image.original_name || image.filename}
        </p>
        <p className="text-[10px] text-gray-400 font-mono mt-1">
          {image.width && image.height ? `${image.width}×${image.height}` : "—"}
          {image.file_size ? ` · ${formatBytes(image.file_size)}` : ""}
        </p>

        <div className="flex gap-2 mt-3">
          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(image)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-xs text-white transition"
              style={{ background: "#6B4A2D" }}
            >
              <Check size={12} /> Use
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-xs transition ${
              copied ? "bg-green-100 text-green-700" : "bg-blue-50 hover:bg-blue-100 text-blue-700"
            }`}
          >
            {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy URL"}
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(image)}
              className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs transition"
              title="Delete from library"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Responsive grid of every image already uploaded to Hostinger.
 * Shared by /admin/images and the "Select From Library" modal in the Blog Editor.
 */
export default function ImageLibraryGrid({
  images = [],
  loading = false,
  onSelect,
  onDelete,
  selectedUrl = "",
  emptyHint = "Upload your first image using the box above.",
  columnsClass = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
        <Loader size={30} className="animate-spin" style={{ color: "#6B4A2D" }} />
        <p className="text-sm font-medium">Loading images…</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center px-4">
        <ImageOff size={40} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-base font-bold text-gray-600 mb-2">No images yet</h3>
        <p className="text-xs sm:text-sm text-gray-400">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${columnsClass} gap-3 sm:gap-5`}>
      {images.map((image) => (
        <ImageCard
          key={image.id ?? image.file_url}
          image={image}
          onSelect={onSelect}
          onDelete={onDelete}
          selected={Boolean(selectedUrl) && selectedUrl === (image.file_url || image.url)}
        />
      ))}
    </div>
  );
}
