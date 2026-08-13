import React, { useId, useRef, useState } from "react";
import { Image as ImageIcon, X, CheckCircle, AlertCircle, Loader } from "lucide-react";

import { IMAGE_SPEC, IMAGE_MESSAGES, validateImageFile } from "../lib/imageSpec";
import { uploadImage } from "../lib/imageApi";
import ImageSpecsTable from "./ImageSpecsTable";
import { bestVariantUrl } from "../lib/imageManifest";

/**
 * The ONE image uploader in the app.
 *
 * Extracted verbatim from the Blog Editor's "Featured Image" block — same
 * dashed drop box, same blue "Required Image Specifications" table, same 16:9
 * preview with the remove button — so both places look and behave identically.
 *
 * Two modes:
 *   autoUpload={false}  (Blog Editor) → the picked File is handed back via
 *                        onSelect and travels with the blog's FormData, exactly
 *                        as it always has.
 *   autoUpload={true}   (/admin/images) → the file is pushed to the same
 *                        upload pipeline right away and onUpload receives the
 *                        stored image record.
 *
 * @param {string}   value          preview src (blob: URL or hosted HTTPS URL)
 * @param {string}   statusText     headline inside the drop box
 * @param {node}     previewCaption caption above the preview
 * @param {function} onSelect       (file, meta) — deferred mode
 * @param {function} onUpload       (image)      — autoUpload mode
 * @param {function} onRemove       clear the current image
 * @param {function} onError        surface an error to the parent (toast etc.)
 */
export default function ImageUploader({
  value = "",
  statusText,
  previewCaption,
  onSelect,
  onUpload,
  onRemove,
  onError,
  autoUpload = false,
  showSpecs = true,
  showPreview = true,
  disabled = false,
  inputId,
}) {
  const generatedId = useId();
  const fieldId = inputId || `image-upload-${generatedId}`;
  const inputRef = useRef(null);

  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [pickedName, setPickedName] = useState("");

  const reset = () => {
    setError("");
    setWarnings([]);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    // Allow re-picking the same file straight after an error
    e.target.value = "";
    if (!file) return;

    reset();
    setPickedName(file.name);

    const check = await validateImageFile(file);
    if (!check.ok) {
      setPickedName("");
      setError(check.error);
      onError?.(check.error);
      return;
    }
    setWarnings(check.warnings);

    const meta = { width: check.width, height: check.height, size: file.size };

    if (!autoUpload) {
      onSelect?.(file, meta);
      return;
    }

    setUploading(true);
    try {
      const image = await uploadImage(file, meta);
      onUpload?.(image, meta);
    } catch (err) {
      const msg = err?.message || IMAGE_MESSAGES.uploadFailed;
      setPickedName("");
      setError(msg);
      onError?.(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    reset();
    setPickedName("");
    if (inputRef.current) inputRef.current.value = "";
    onRemove?.();
  };

  const boxText =
    statusText || (pickedName && !error ? pickedName : "Click to upload image");

  return (
    <div>
      {/* ── Drop / click box ─────────────────────────────────────────────── */}
      <label
        htmlFor={fieldId}
        className={`flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-6 px-4 transition group ${
          disabled || uploading
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : "border-gray-300 cursor-pointer hover:border-[#6B4A2D] hover:bg-[#6B4A2D]/5"
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#6B4A2D]/10 flex items-center justify-center transition">
          {uploading ? (
            <Loader size={18} className="animate-spin" style={{ color: "#6B4A2D" }} />
          ) : (
            <ImageIcon size={18} className="text-gray-400 group-hover:text-[#6B4A2D] transition" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-600 group-hover:text-[#6B4A2D] transition">
            {uploading ? "Uploading image…" : boxText}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            JPG, PNG, WebP · max 5MB · recommended 1200×675px
          </p>
        </div>
        <input
          ref={inputRef}
          id={fieldId}
          type="file"
          accept={IMAGE_SPEC.acceptAttr}
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="hidden"
        />
      </label>

      {/* ── Validation error ─────────────────────────────────────────────── */}
      {error && (
        <div className="mt-2.5 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
          <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-red-700">{error}</p>
        </div>
      )}

      {/* ── Non-blocking warnings (dimensions / weight) ──────────────────── */}
      {!error && warnings.length > 0 && (
        <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 space-y-1">
          {warnings.map((w) => (
            <p key={w} className="text-xs font-semibold text-amber-700 flex items-start gap-2">
              <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
              {w}
            </p>
          ))}
        </div>
      )}

      {/* ── Required Image Specifications ────────────────────────────────── */}
      {showSpecs && <ImageSpecsTable className="mt-2.5" />}

      {/* ── 16:9 preview ─────────────────────────────────────────────────── */}
      {showPreview && value && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
            {previewCaption || (
              <>
                <CheckCircle size={11} className="text-green-500" /> Image selected — 16:9 preview
              </>
            )}
          </p>
          <div
            className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 w-full"
            style={{ aspectRatio: "16/9" }}
          >
            <img
              src={bestVariantUrl(value, 400)}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            {onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition"
                title="Remove image"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
