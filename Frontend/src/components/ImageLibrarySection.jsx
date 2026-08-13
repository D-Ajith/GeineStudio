import React, { useState } from "react";
import { Images, RefreshCw, Search, X, AlertCircle, Loader, Trash2, Pencil } from "lucide-react";

import ImageLibraryGrid from "./ImageLibraryGrid";
import { bestVariantUrl } from "../lib/imageManifest";

/**
 * "Uploaded Images" section — the identical block rendered on /admin/images and
 * /admin/blogs. It owns nothing: state comes from the shared useImageLibrary
 * hook, so both pages mutate through one code path and can never disagree.
 */

// Mounted with key={image.id}, so the initial state below is correct for each
// image and no effect is needed to resync it.
function RenameImageModal({ image, onConfirm, onCancel, loading }) {
  const [name, setName] = useState(image.original_name || image.filename || "");

  const trimmed = name.trim();
  const unchanged = trimmed === (image.original_name || image.filename);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-amber-100 animate-scaleIn">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Pencil size={20} className="text-amber-600" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-2">Rename Image</h3>
        <p className="text-sm text-gray-500 text-center mb-4">
          Changes the display name only — the file and its URL stay exactly as they are.
        </p>

        <div className="rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 w-full mb-4" style={{ aspectRatio: "16/9" }}>
          <img
            src={bestVariantUrl(image.file_url || image.url, 400)}
            alt={image.original_name || image.filename}
            className="w-full h-full object-cover"
          />
        </div>

        <label className="text-xs font-semibold text-gray-600 block mb-1.5">Display name</label>
        <input
          type="text"
          value={name}
          autoFocus
          maxLength={255}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && trimmed && !unchanged) onConfirm(trimmed);
            if (e.key === "Escape") onCancel();
          }}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-[#6B4A2D] focus:ring-4 focus:ring-[#6B4A2D]/10 outline-none transition font-medium"
          placeholder="e.g. Corporate shoot hero banner"
        />

        <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1">
            Unchanged URL
          </p>
          <p className="text-[11px] font-mono text-gray-600 break-all">
            {image.file_url || image.url}
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(trimmed)}
            disabled={loading || !trimmed || unchanged}
            className="flex-1 py-2.5 sm:py-3 text-white rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: "#6B4A2D" }}
          >
            {loading ? <Loader size={15} className="animate-spin" /> : <Pencil size={14} />}
            {loading ? "Saving…" : "Save Name"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteImageModal({ image, onConfirm, onCancel, loading }) {
  if (!image) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-red-100 animate-scaleIn">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-red-600" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-2">Remove Image?</h3>
        <p className="text-sm text-gray-500 text-center mb-1">Removing from the library:</p>
        <p className="text-sm font-semibold text-gray-800 text-center mb-4 line-clamp-2 px-2 break-all">
          {image.original_name || image.filename}
        </p>
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center mb-6">
          Blogs already using this URL will keep working — the file stays on Hostinger.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition">
            Keep It
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader size={15} className="animate-spin" /> : <Trash2 size={15} />}
            {loading ? "Removing…" : "Yes, Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ImageLibrarySection({
  library,          // the useImageLibrary() result
  onToast,
  title = "Uploaded Images",
  subtitle,
  onSelect,         // optional "Use" action
  selectedUrl = "",
  columnsClass,
}) {
  const { images, loading, error, reload, rename, remove } = library;

  const [searchTerm, setSearchTerm] = useState("");
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const filtered = searchTerm
    ? images.filter((img) =>
        `${img.original_name || ""} ${img.filename || ""} ${img.file_url || ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : images;

  const handleRename = async (name) => {
    if (!renameTarget) return;
    setBusy(true);
    try {
      await rename(renameTarget.id, name);
      setRenameTarget(null);
      onToast?.("Display name updated — the image URL is unchanged.");
    } catch (err) {
      onToast?.(err?.message || "Could not rename the image.", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await remove(deleteTarget.id);
      setDeleteTarget(null);
      onToast?.("Image removed from library.");
    } catch (err) {
      onToast?.(err?.message || "Could not delete the image.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {renameTarget && (
        <RenameImageModal
          key={renameTarget.id}
          image={renameTarget}
          onConfirm={handleRename}
          onCancel={() => setRenameTarget(null)}
          loading={busy}
        />
      )}
      <DeleteImageModal
        image={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={busy}
      />

      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <Images size={17} style={{ color: "#6B4A2D" }} />
          <h2 className="text-base sm:text-lg font-extrabold text-gray-900">{title}</h2>
          <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#6B4A2D", color: "#fff" }}>
            {images.length}
          </span>
        </div>
        <button
          type="button"
          onClick={reload}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-white border-2 border-gray-200 hover:border-[#6B4A2D] hover:text-[#6B4A2D] transition"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {subtitle && <p className="text-xs text-gray-400 mb-4">{subtitle}</p>}

      <div className="relative mb-4 mt-3">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search images by name or URL…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-10 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#6B4A2D] focus:ring-4 focus:ring-[#6B4A2D]/10 outline-none transition bg-white"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {searchTerm && (
        <p className="text-xs sm:text-sm text-gray-500 mb-4 font-medium">
          Showing <strong className="text-gray-800">{filtered.length}</strong> of{" "}
          <strong className="text-gray-800">{images.length}</strong> images
        </p>
      )}

      {error ? (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-red-700">{error}</p>
        </div>
      ) : (
        <ImageLibraryGrid
          images={filtered}
          loading={loading}
          onSelect={onSelect}
          onRename={(image) => setRenameTarget(image)}
          onDelete={(image) => setDeleteTarget(image)}
          selectedUrl={selectedUrl}
          columnsClass={columnsClass}
          emptyHint={
            searchTerm
              ? "No images match that search."
              : "Upload one from the Images page to see it here."
          }
        />
      )}
    </div>
  );
}
