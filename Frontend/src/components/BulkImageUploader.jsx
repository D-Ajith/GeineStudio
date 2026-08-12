import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image as ImageIcon, UploadCloud, X, CheckCircle, AlertCircle, Loader,
  Copy, RotateCcw, Trash2, Files, ArrowRight, Minimize2, Check,
} from "lucide-react";

import { IMAGE_SPEC, validateImageFile, formatBytes } from "../lib/imageSpec";
import { compressToLimit, needsCompression, COMPRESSION_FAILED } from "../lib/imageCompression";
import { uploadImage, copyToClipboard } from "../lib/imageApi";
import ImageSpecsTable from "./ImageSpecsTable";

/** How many uploads may be in flight at once — keeps browser and server calm. */
const CONCURRENCY = 4;

/* ── Status vocabulary ─────────────────────────────────────────────────────
   validating → [compressing] → ready → uploading → success
                                              ↘ error (retryable)
   invalid   — bad format, or still over 5 MB after every compression attempt
   duplicate — same name+size already in the queue or the library

   Only files ABOVE 5 MB enter `compressing`; everything else is uploaded
   exactly as picked so no quality is lost for no reason.
────────────────────────────────────────────────────────────────────────── */

let seq = 0;
const nextId = () => `f${++seq}`;

/** Same name AND same byte size is treated as the same image. */
const sameImage = (a, b) => a.name === b.name && a.size === b.size;

function QueueRow({ item, onRemove, onRetry, onUploadAnyway }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = item.image?.url || item.image?.file_url;
    if (!url) return;
    if (!(await copyToClipboard(url))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tone = {
    success:     { border: "border-green-200",    bg: "bg-green-50" },
    error:       { border: "border-red-200",      bg: "bg-red-50"   },
    invalid:     { border: "border-red-200",      bg: "bg-red-50"   },
    duplicate:   { border: "border-amber-200",    bg: "bg-amber-50" },
    uploading:   { border: "border-[#6B4A2D]/30", bg: "bg-white"    },
    compressing: { border: "border-indigo-200",   bg: "bg-indigo-50" },
  }[item.status] || { border: "border-gray-200", bg: "bg-white" };

  const busy =
    item.status === "uploading" ||
    item.status === "validating" ||
    item.status === "compressing";

  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-xl border-2 ${tone.border} ${tone.bg} transition-colors`}>
      {/* Thumbnail */}
      <div className="relative w-16 sm:w-20 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200" style={{ aspectRatio: "16/9" }}>
        {item.previewUrl ? (
          <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={14} className="text-gray-300" />
          </div>
        )}
      </div>

      {/* Name + meta + progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {item.status === "success"   && <CheckCircle size={12} className="text-green-600 shrink-0" />}
          {(item.status === "error" || item.status === "invalid") && <AlertCircle size={12} className="text-red-500 shrink-0" />}
          {item.status === "duplicate" && <AlertCircle size={12} className="text-amber-500 shrink-0" />}
          {item.status === "compressing" && <Minimize2 size={12} className="text-indigo-600 shrink-0 animate-pulse" />}
          {(item.status === "uploading" || item.status === "validating") && (
            <Loader size={12} className="animate-spin shrink-0" style={{ color: "#6B4A2D" }} />
          )}
          <p className="text-xs font-bold text-gray-800 truncate" title={item.name}>{item.name}</p>
        </div>

        {/* Size story: original → compressed, or "no compression required" */}
        <div className="text-[10px] font-mono mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {item.width && item.height && (
            <span className="text-gray-400">{item.width}×{item.height}</span>
          )}
          {item.compressed ? (
            <>
              <span className="text-gray-400">·</span>
              <span className="text-gray-400 line-through">{formatBytes(item.size)}</span>
              <ArrowRight size={9} className="text-indigo-500" />
              <span className="font-bold text-indigo-700">{formatBytes(item.finalSize)}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-sans font-bold text-[9px]">
                Quality: {item.quality}
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-sans font-bold text-[9px]">
                −{Math.round((1 - item.finalSize / item.size) * 100)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-gray-400">·</span>
              <span className="text-gray-400">{formatBytes(item.size)}</span>
              {item.status !== "validating" && item.status !== "invalid" && (
                <span className="text-gray-400 font-sans">· no compression required</span>
              )}
            </>
          )}
        </div>

        {item.status === "compressing" && (
          <>
            <p className="text-[10px] font-semibold text-indigo-700 mt-1">
              Compressing… {item.quality && `(quality: ${item.quality})`}
            </p>
            <div className="mt-1 h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-200"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </>
        )}

        {item.status === "ready" && (
          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold text-[9px]">
            <Check size={9} /> Ready to upload
          </span>
        )}

        {item.resized && item.status !== "invalid" && (
          <p className="text-[10px] font-semibold text-amber-600 mt-1">
            Needed a resize to fit under 5 MB — longest edge reduced to 2560px.
          </p>
        )}

        {item.status === "uploading" && (
          <div className="mt-1.5 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{ width: `${item.progress}%`, background: "#6B4A2D" }}
            />
          </div>
        )}

        {item.error && (
          <p className="text-[10px] font-semibold text-red-600 mt-1 leading-snug">{item.error}</p>
        )}
        {item.status === "duplicate" && !item.error && (
          <p className="text-[10px] font-semibold text-amber-700 mt-1">
            Already uploaded — skipped to avoid a duplicate.
          </p>
        )}
        {item.warnings?.length > 0 && item.status !== "invalid" && (
          <p className="text-[10px] font-semibold text-amber-600 mt-1 leading-snug">{item.warnings[0]}</p>
        )}
        {item.status === "success" && (
          <p className="text-[10px] text-gray-500 font-mono mt-1 truncate" title={item.image?.url}>
            {item.image?.url}
          </p>
        )}
      </div>

      {/* Per-row actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {item.status === "uploading" && (
          <span className="text-[10px] font-bold text-[#6B4A2D] w-9 text-right">{item.progress}%</span>
        )}
        {item.status === "success" && (
          <button
            type="button"
            onClick={handleCopy}
            title="Copy URL"
            className={`flex items-center justify-center px-2.5 py-2 rounded-lg text-xs font-semibold transition ${
              copied ? "bg-green-100 text-green-700" : "bg-blue-50 hover:bg-blue-100 text-blue-700"
            }`}
          >
            {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
          </button>
        )}
        {item.status === "error" && (
          <button
            type="button"
            onClick={() => onRetry(item.id)}
            title="Retry this upload"
            className="flex items-center justify-center px-2.5 py-2 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 transition"
          >
            <RotateCcw size={12} />
          </button>
        )}
        {item.status === "duplicate" && (
          <button
            type="button"
            onClick={() => onUploadAnyway(item.id)}
            className="px-2.5 py-2 rounded-lg text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 transition whitespace-nowrap"
          >
            Upload anyway
          </button>
        )}
        {!busy && (
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            title="Remove from queue"
            className="flex items-center justify-center px-2.5 py-2 rounded-lg text-xs bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Bulk upload for /admin/images.
 *
 * Every file still goes through the SAME validateImageFile() rules and the SAME
 * uploadImage() call as the single-file uploader — this component only adds a
 * queue, previews and a concurrency-limited runner on top.
 */
export default function BulkImageUploader({ existingImages = [], onUploaded, onToast }) {
  const [queue, setQueue] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  // Latest queue for cleanup on unmount, without re-running the effect
  const queueRef = useRef(queue);
  queueRef.current = queue;

  useEffect(() => () => {
    queueRef.current.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));
    abortRef.current?.abort();
  }, []);

  const patch = useCallback((id, changes) => {
    setQueue((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  }, []);

  /* ── Adding files ─────────────────────────────────────────────────────── */
  const addFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    // Duplicate checks run against the library AND what is already queued
    const seen = [...queueRef.current.map((i) => ({ name: i.name, size: i.size }))];
    const inLibrary = existingImages.map((img) => ({
      name: img.original_name || img.filename,
      size: img.file_size,
    }));

    const fresh = files.map((file) => {
      const candidate = { name: file.name, size: file.size };
      const dupe =
        seen.some((s) => sameImage(s, candidate)) ||
        inLibrary.some((s) => sameImage(s, candidate));
      seen.push(candidate);

      return {
        id: nextId(),
        file,                       // what the admin picked
        uploadFile: file,           // what actually gets sent (compressed if needed)
        name: file.name,
        size: file.size,            // original size
        finalSize: file.size,       // size after any compression
        compressed: false,
        quality: "",
        resized: false,
        previewUrl: URL.createObjectURL(file),
        width: null,
        height: null,
        status: dupe ? "duplicate" : "validating",
        progress: 0,
        error: "",
        warnings: [],
        image: null,
      };
    });

    setQueue((prev) => [...prev, ...fresh]);

    // Sequential on purpose: 50 files must not spawn 50 decoders / compressors
    // at once.
    for (const item of fresh) {
      if (item.status === "duplicate") continue;

      // Pass 1 — format and dimensions. The size limit is deliberately NOT
      // enforced here: an oversized file gets a chance to be compressed first.
      const check = await validateImageFile(item.file, { enforceMaxSize: false });
      if (!check.ok) {
        patch(item.id, { status: "invalid", error: check.error });
        continue;
      }
      patch(item.id, { width: check.width, height: check.height, warnings: check.warnings });

      if (!needsCompression(item.file)) {
        patch(item.id, { status: "ready" }); // already within the limit — untouched
        continue;
      }

      // Pass 2 — compress until it fits
      patch(item.id, { status: "compressing", progress: 0 });
      try {
        const result = await compressToLimit(item.file, {
          onProgress: (percent, quality) => patch(item.id, { progress: percent, quality }),
        });

        // Pass 3 — re-validate the compressed file, size check back ON
        const recheck = await validateImageFile(result.file);
        if (!recheck.ok) {
          patch(item.id, { status: "invalid", error: recheck.error });
          continue;
        }

        patch(item.id, {
          status: "ready",
          uploadFile: result.file,
          finalSize: result.file.size,
          compressed: true,
          quality: result.quality,
          resized: result.resized,
          progress: 0,
          warnings: recheck.warnings,
        });
      } catch (err) {
        patch(item.id, { status: "invalid", error: err?.message || COMPRESSION_FAILED });
      }
    }
  }, [existingImages, patch]);

  const handleInputChange = (e) => {
    addFiles(e.target.files);
    e.target.value = ""; // let the same file be picked again after removal
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (!uploading) addFiles(e.dataTransfer.files);
  };

  /* ── Queue management ─────────────────────────────────────────────────── */
  const removeItem = (id) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearAll = () => {
    abortRef.current?.abort();
    queueRef.current.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));
    setQueue([]);
    setUploading(false);
  };

  /* ── Uploading ────────────────────────────────────────────────────────── */
  const uploadOne = useCallback(async (item, signal) => {
    patch(item.id, { status: "uploading", progress: 0, error: "" });
    try {
      const image = await uploadImage(
        item.uploadFile, // compressed version when one was produced
        { width: item.width, height: item.height },
        { signal, onProgress: (p) => patch(item.id, { progress: p }) }
      );
      patch(item.id, { status: "success", progress: 100, image });
      onUploaded?.(image);
      return true;
    } catch (err) {
      patch(item.id, { status: "error", error: err?.message || "Image upload failed. Please try again." });
      return false;
    }
  }, [onUploaded, patch]);

  /** Runs `worker` over `items`, at most CONCURRENCY at a time. */
  const runPool = async (items, worker) => {
    let cursor = 0;
    const runners = Array.from(
      { length: Math.min(CONCURRENCY, items.length) },
      async () => {
        while (cursor < items.length) {
          await worker(items[cursor++]);
        }
      }
    );
    await Promise.all(runners);
  };

  const startUpload = async (items) => {
    if (items.length === 0 || uploading) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setUploading(true);

    let ok = 0;
    await runPool(items, async (item) => {
      if (controller.signal.aborted) return;
      if (await uploadOne(item, controller.signal)) ok += 1;
    });

    setUploading(false);
    abortRef.current = null;

    const failed = items.length - ok;
    if (!controller.signal.aborted) {
      if (failed === 0) onToast?.(`🎉 ${ok} image${ok === 1 ? "" : "s"} uploaded to Hostinger!`);
      else if (ok === 0) onToast?.(`All ${failed} upload${failed === 1 ? "" : "s"} failed — use Retry.`, "error");
      else onToast?.(`${ok} uploaded · ${failed} failed — use Retry on the failed rows.`, "error");
    }
  };

  const uploadAll = () => startUpload(queue.filter((i) => i.status === "ready"));
  const retryFailed = () => startUpload(queue.filter((i) => i.status === "error"));

  const retryOne = async (id) => {
    const item = queueRef.current.find((i) => i.id === id);
    if (item) await startUpload([item]);
  };

  const uploadAnyway = (id) => patch(id, { status: "ready", error: "" });

  const cancelUpload = () => {
    abortRef.current?.abort();
    onToast?.("Upload cancelled — images already finished are kept.");
  };

  /* ── Derived counters ─────────────────────────────────────────────────── */
  const counts = queue.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {});
  const readyCount = counts.ready || 0;
  const failedCount = counts.error || 0;
  const successCount = counts.success || 0;
  // Still being validated or compressed — Upload All must wait for these
  const preparingCount = (counts.validating || 0) + (counts.compressing || 0);

  // How much the compressor saved across the batch
  const compressedItems = queue.filter((i) => i.compressed);
  const savedBytes = compressedItems.reduce((sum, i) => sum + (i.size - i.finalSize), 0);

  // Overall progress across everything that has been or is being uploaded
  const tracked = queue.filter((i) => ["uploading", "success", "error"].includes(i.status));
  const overall = tracked.length
    ? Math.round(tracked.reduce((sum, i) => sum + (i.status === "success" ? 100 : i.progress), 0) / tracked.length)
    : 0;

  return (
    <div>
      {/* ── Drop zone ────────────────────────────────────────────────────── */}
      <label
        htmlFor="bulk-image-upload"
        onDragOver={(e) => { e.preventDefault(); if (!uploading) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-8 px-4 transition group ${
          uploading
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : dragging
              ? "border-[#6B4A2D] bg-[#6B4A2D]/10 cursor-pointer"
              : "border-gray-300 cursor-pointer hover:border-[#6B4A2D] hover:bg-[#6B4A2D]/5"
        }`}
      >
        <div className="w-11 h-11 rounded-xl bg-gray-100 group-hover:bg-[#6B4A2D]/10 flex items-center justify-center transition">
          <UploadCloud size={20} className={dragging ? "text-[#6B4A2D]" : "text-gray-400 group-hover:text-[#6B4A2D] transition"} />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-600 group-hover:text-[#6B4A2D] transition">
            {dragging ? "Drop the images here" : "Drag & drop images here"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            or click to choose multiple images · JPG, PNG, WebP
          </p>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1 flex items-center justify-center gap-1">
            <Minimize2 size={11} /> Over 5MB? Compressed automatically — dimensions and quality kept
          </p>
        </div>
        <span
          className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition"
          style={{ background: "#6B4A2D" }}
        >
          <Files size={13} /> Choose Multiple Images
        </span>
        <input
          ref={inputRef}
          id="bulk-image-upload"
          type="file"
          multiple
          accept={IMAGE_SPEC.acceptAttr}
          onChange={handleInputChange}
          disabled={uploading}
          className="hidden"
        />
      </label>

      <ImageSpecsTable className="mt-2.5" />

      {/* ── Queue ────────────────────────────────────────────────────────── */}
      {queue.length > 0 && (
        <div className="mt-4 rounded-2xl border-2 border-gray-200 bg-[#F7F6F3] overflow-hidden">
          <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                {queue.length} image{queue.length === 1 ? "" : "s"} selected
                {successCount > 0 && <span className="text-green-600 font-semibold"> · {successCount} uploaded</span>}
                {failedCount > 0 && <span className="text-red-600 font-semibold"> · {failedCount} failed</span>}
                {counts.compressing > 0 && <span className="text-indigo-600 font-semibold"> · {counts.compressing} compressing</span>}
                {counts.duplicate > 0 && <span className="text-amber-600 font-semibold"> · {counts.duplicate} duplicate</span>}
                {counts.invalid > 0 && <span className="text-red-500 font-semibold"> · {counts.invalid} invalid</span>}
              </p>
              {compressedItems.length > 0 && savedBytes > 0 && (
                <p className="text-[10px] text-indigo-600 font-semibold mt-0.5 flex items-center gap-1">
                  <Minimize2 size={10} />
                  {compressedItems.length} compressed · {formatBytes(savedBytes)} saved
                </p>
              )}
            </div>
            {preparingCount > 0 ? (
              <span className="text-[11px] font-semibold text-indigo-600">
                Preparing {preparingCount}…
              </span>
            ) : readyCount > 0 && !uploading ? (
              <span className="text-[11px] font-semibold text-gray-500">{readyCount} ready to upload</span>
            ) : null}
          </div>

          {/* Overall progress */}
          {tracked.length > 0 && (
            <div className="px-4 py-3 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-bold text-gray-600">Overall progress</p>
                <p className="text-[11px] font-bold" style={{ color: "#6B4A2D" }}>{overall}%</p>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${overall}%`, background: "linear-gradient(90deg,#6B4A2D,#b07d50)" }}
                />
              </div>
            </div>
          )}

          <div className="p-3 space-y-2 max-h-[420px] overflow-y-auto">
            {queue.map((item) => (
              <QueueRow
                key={item.id}
                item={item}
                onRemove={removeItem}
                onRetry={retryOne}
                onUploadAnyway={uploadAnyway}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="px-4 py-3 bg-white border-t border-gray-200 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={uploading ? cancelUpload : clearAll}
              className="sm:w-40 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              {uploading ? <><X size={13} /> Cancel</> : <><Trash2 size={13} /> Clear All</>}
            </button>

            {failedCount > 0 && !uploading && (
              <button
                type="button"
                onClick={retryFailed}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-800"
              >
                <RotateCcw size={13} /> Retry {failedCount} Failed
              </button>
            )}

            <button
              type="button"
              onClick={uploadAll}
              disabled={uploading || readyCount === 0 || preparingCount > 0}
              className="flex-1 py-2.5 rounded-xl font-extrabold text-xs text-white transition shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "#6B4A2D" }}
            >
              {uploading
                ? <><Loader size={14} className="animate-spin" /> Uploading… {overall}%</>
                : preparingCount > 0
                  ? <><Minimize2 size={14} className="animate-pulse" /> Preparing {preparingCount}…</>
                  : <><UploadCloud size={14} /> Upload All{readyCount > 0 ? ` (${readyCount})` : ""}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
