import React, { useEffect, useState } from "react";
import { X, Images, AlertCircle, RefreshCw } from "lucide-react";

import { fetchImages } from "../lib/imageApi";
import ImageLibraryGrid from "./ImageLibraryGrid";

/**
 * "Select From Library" picker for the Blog Editor.
 *
 * Picking an image here reuses an already-hosted Hostinger URL — nothing is
 * re-uploaded, so the same file can back any number of blogs.
 */
export default function ImageLibraryModal({ open, onClose, onSelect, selectedUrl = "" }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setImages(await fetchImages());
    } catch (err) {
      setError(err?.message || "Could not load the image library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-3 sm:p-6"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="bg-[#F7F6F3] rounded-2xl w-full max-w-4xl max-h-[88vh] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-scaleIn">
        <div className="px-4 sm:px-6 py-4 bg-white border-b border-gray-100 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#6B4A2D" }}>
            <Images size={18} color="#fff" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-extrabold text-gray-900">Select From Library</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              Reuse an image already uploaded to Hostinger — no re-upload needed
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition shrink-0"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto">
          {error ? (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-red-700">{error}</p>
            </div>
          ) : (
            <ImageLibraryGrid
              images={images}
              loading={loading}
              selectedUrl={selectedUrl}
              onSelect={(image) => { onSelect?.(image); onClose?.(); }}
              emptyHint="Upload one from the Images page, or use “Upload New Image” above."
              columnsClass="grid-cols-2 sm:grid-cols-3"
            />
          )}
        </div>
      </div>
    </div>
  );
}
