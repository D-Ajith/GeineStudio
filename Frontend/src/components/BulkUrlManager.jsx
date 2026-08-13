import React, { useMemo, useRef, useState } from "react";
import {
  ClipboardPaste, Eye, Loader, CheckCircle, AlertCircle, X, Copy, Trash2,
  Pencil, ArrowUp, ArrowDown, RefreshCw, Save, ExternalLink, Images, LayoutGrid,
} from "lucide-react";
import { bestVariantUrl } from "../lib/imageManifest";

/**
 * Bulk image-URL manager — paste many URLs, preview them, then save.
 *
 * Shared by the Portfolio manager and the Dome Gallery manager so both behave
 * identically: same duplicate detection, same preview, same edit/delete/reorder
 * controls. The parent owns `items` and supplies the API calls; this component
 * owns only the transient UI state (textarea contents, dialogs, pending order).
 */

const isValidUrl = (u) => /^https?:\/\/\S+$/i.test(String(u || "").trim());

/** Classifies every pasted line so the admin sees what will happen before saving. */
function parseUrls(text, existingUrls = []) {
  const seen = new Set();
  const already = new Set(existingUrls);
  const rows = [];

  String(text || "").split(/\r?\n/).forEach((line) => {
    const url = line.trim();
    if (!url) return;
    let status = "new";
    if (!isValidUrl(url)) status = "invalid";
    else if (seen.has(url)) status = "repeat";      // duplicated within the paste
    else if (already.has(url)) status = "existing"; // already saved
    if (isValidUrl(url)) seen.add(url);
    rows.push({ url, status });
  });

  return rows;
}

const STATUS_STYLE = {
  new:      { dot: "bg-green-500", text: "text-gray-700",  label: "New" },
  existing: { dot: "bg-amber-500", text: "text-amber-700", label: "Already saved — will be skipped" },
  repeat:   { dot: "bg-amber-500", text: "text-amber-700", label: "Repeated in this list — will be skipped" },
  invalid:  { dot: "bg-red-500",   text: "text-red-600",   label: "Not a valid http(s) URL" },
};

/* ── Edit dialog ───────────────────────────────────────────────────────── */
function EditModal({ item, fields, thumbAspect, onConfirm, onCancel, loading }) {
  const [url, setUrl] = useState(item.image_url || "");
  const [extra, setExtra] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.key, item[f.key] || ""]))
  );

  const valid = isValidUrl(url);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 animate-scaleIn max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-12 bg-[#6B4A2D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Pencil size={20} style={{ color: "#6B4A2D" }} />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-4">Edit Image</h3>

        <div className="rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 w-full mb-4 mx-auto"
          style={{ aspectRatio: thumbAspect, maxHeight: 220, maxWidth: 200 }}>
          <img src={bestVariantUrl(url, 400)} alt="" className="w-full h-full object-cover"
            onError={(e) => { e.target.style.opacity = "0.25"; }} />
        </div>

        <label className="text-xs font-semibold text-gray-600 block mb-1.5">Image URL</label>
        <input
          type="text" value={url} onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:border-[#6B4A2D] focus:ring-4 focus:ring-[#6B4A2D]/10 outline-none transition"
        />
        {!valid && url.trim() && (
          <p className="text-[11px] font-semibold text-red-600 mt-1">Must start with http:// or https://</p>
        )}

        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5 mt-4">
              {f.label}{" "}
              {f.hint && <span className="text-gray-400 font-normal">({f.hint})</span>}
            </label>
            {f.multiline ? (
              <textarea
                rows={3} value={extra[f.key]} placeholder="Optional"
                onChange={(e) => setExtra((p) => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#6B4A2D] focus:ring-4 focus:ring-[#6B4A2D]/10 outline-none transition resize-none"
              />
            ) : (
              <input
                type="text" value={extra[f.key]} maxLength={255} placeholder="Optional"
                onChange={(e) => setExtra((p) => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#6B4A2D] focus:ring-4 focus:ring-[#6B4A2D]/10 outline-none transition"
              />
            )}
          </div>
        ))}

        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition">
            Cancel
          </button>
          <button
            onClick={() => onConfirm({
              image_url: url.trim(),
              ...Object.fromEntries(fields.map((f) => [f.key, extra[f.key].trim()])),
            })}
            disabled={loading || !valid}
            className="flex-1 py-2.5 sm:py-3 text-white rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: "#6B4A2D" }}
          >
            {loading ? <Loader size={15} className="animate-spin" /> : <Save size={14} />}
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Confirm dialog ────────────────────────────────────────────────────── */
function ConfirmModal({ open, title, body, confirmLabel, onConfirm, onCancel, loading, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border animate-scaleIn ${danger ? "border-red-100" : "border-amber-100"}`}>
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? "bg-red-100" : "bg-amber-100"}`}>
          {danger ? <Trash2 size={22} className="text-red-600" /> : <AlertCircle size={22} className="text-amber-600" />}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{body}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition">
            Cancel
          </button>
          <button
            onClick={onConfirm} disabled={loading}
            className={`flex-1 py-2.5 sm:py-3 text-white rounded-xl font-bold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2 ${danger ? "bg-red-500 hover:bg-red-600" : "bg-amber-500 hover:bg-amber-600"}`}
          >
            {loading && <Loader size={15} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── One saved image ───────────────────────────────────────────────────── */
function UrlRow({ item, index, total, labelKey, thumbAspect, onEdit, onDelete, onMove }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.image_url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = item.image_url;
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl border-2 border-gray-200 bg-white">
      <span className="text-[10px] font-bold text-gray-400 w-5 text-center shrink-0">{index + 1}</span>

      <div className="w-14 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200" style={{ aspectRatio: thumbAspect }}>
        <img src={bestVariantUrl(item.image_url, 400)} alt={item[labelKey] || ""} loading="lazy" className="w-full h-full object-cover"
          onError={(e) => { e.target.style.opacity = "0.25"; }} />
      </div>

      <div className="flex-1 min-w-0">
        {item[labelKey] && <p className="text-xs font-bold text-gray-800 truncate">{item[labelKey]}</p>}
        <p className="text-[10px] text-gray-500 font-mono truncate" title={item.image_url}>{item.image_url}</p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <div className="flex flex-col">
          <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} title="Move up"
            className="px-1.5 py-0.5 rounded text-gray-500 hover:text-[#6B4A2D] hover:bg-gray-100 disabled:opacity-25 disabled:cursor-not-allowed transition">
            <ArrowUp size={12} />
          </button>
          <button type="button" onClick={() => onMove(index, 1)} disabled={index === total - 1} title="Move down"
            className="px-1.5 py-0.5 rounded text-gray-500 hover:text-[#6B4A2D] hover:bg-gray-100 disabled:opacity-25 disabled:cursor-not-allowed transition">
            <ArrowDown size={12} />
          </button>
        </div>
        <button type="button" onClick={copy} title="Copy URL"
          className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition ${copied ? "bg-green-100 text-green-700" : "bg-blue-50 hover:bg-blue-100 text-blue-700"}`}>
          {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
        </button>
        <a href={item.image_url} target="_blank" rel="noreferrer" title="Open image"
          className="px-2.5 py-2 rounded-lg text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
          <ExternalLink size={12} />
        </a>
        <button type="button" onClick={() => onEdit(item)} title="Edit"
          className="px-2.5 py-2 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 transition">
          <Pencil size={12} />
        </button>
        <button type="button" onClick={() => onDelete(item)} title="Delete"
          className="px-2.5 py-2 rounded-lg text-xs bg-red-50 hover:bg-red-100 text-red-600 transition">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function BulkUrlManager({
  items = [],
  onItemsChange,
  loading = false,
  error = "",
  onReload,
  onBulkSave,      // (urls, mode) => Promise<{ items, added, skipped, message }>
  onEditSave,      // (item, fields) => Promise<item>
  onDelete,        // (item) => Promise
  onReorder,       // (ids)  => Promise
  onToast,
  labels = {},
  extraFields = [],
  labelKey = "title",
  thumbAspect = "3/4",
  children,        // extra controls above the paste box (e.g. category picker)
}) {
  const L = {
    cardTitle: "Bulk Image URLs",
    cardSubtitle: "One URL per line — preview, then update",
    placeholder: "https://geniestudio.in/uploads/image1.jpg\nhttps://geniestudio.in/uploads/image2.webp",
    updateButton: "Update",
    replaceButton: "Replace All",
    replaceTitle: "Replace everything?",
    listTitle: "Saved Images",
    emptyTitle: "Nothing here yet",
    emptyBody: "Paste URLs above and save.",
    deleteBody: "This image will be removed from the public site.",
    tipNote: "",
    ...labels,
  };

  const [urlText, setUrlText] = useState("");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);

  const orderRef = useRef([]);
  orderRef.current = items.map((i) => i.id);

  const existingUrls = useMemo(() => items.map((i) => i.image_url), [items]);
  const parsed = useMemo(() => parseUrls(urlText, existingUrls), [urlText, existingUrls]);
  const newCount = parsed.filter((p) => p.status === "new").length;
  const badCount = parsed.filter((p) => p.status === "invalid").length;
  const dupCount = parsed.filter((p) => p.status === "repeat" || p.status === "existing").length;

  const save = async (mode) => {
    if (parsed.length === 0) return;
    setSaving(true);
    try {
      const res = await onBulkSave(parsed.map((p) => p.url), mode);
      onItemsChange(res.items || []);
      setUrlText("");
      setOrderDirty(false);
      onToast?.(
        mode === "replace"
          ? `✅ Replaced — ${res.added} image${res.added === 1 ? "" : "s"} now live.`
          : `✅ ${res.message} — live on the site.`
      );
    } catch (err) {
      onToast?.(err?.message || "Could not save.", "error");
    } finally {
      setSaving(false);
      setReplaceOpen(false);
    }
  };

  const handleEdit = async (fields) => {
    if (!editTarget) return;
    setBusy(true);
    try {
      const updated = await onEditSave(editTarget, fields);
      onItemsChange(items.map((i) => (i.id === updated.id ? updated : i)));
      setEditTarget(null);
      onToast?.("Image updated.");
    } catch (err) {
      onToast?.(err?.message || "Could not update the image.", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await onDelete(deleteTarget);
      onItemsChange(items.filter((i) => i.id !== deleteTarget.id));
      setDeleteTarget(null);
      onToast?.("Image removed.");
    } catch (err) {
      onToast?.(err?.message || "Could not delete the image.", "error");
    } finally {
      setBusy(false);
    }
  };

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onItemsChange(next);
    setOrderDirty(true);
  };

  const saveOrder = async () => {
    setBusy(true);
    try {
      await onReorder(orderRef.current);
      setOrderDirty(false);
      onToast?.("New order saved — the public page will use it.");
    } catch (err) {
      onToast?.(err?.message || "Could not save the order.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {editTarget && (
        <EditModal
          key={editTarget.id} item={editTarget} fields={extraFields}
          thumbAspect={thumbAspect} loading={busy}
          onConfirm={handleEdit} onCancel={() => setEditTarget(null)}
        />
      )}
      <ConfirmModal
        open={Boolean(deleteTarget)} danger loading={busy}
        title="Remove Image?" body={L.deleteBody} confirmLabel="Yes, Remove"
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmModal
        open={replaceOpen} loading={saving}
        title={L.replaceTitle}
        body={`All ${items.length} existing image${items.length === 1 ? "" : "s"} will be deleted and replaced by the ${newCount} pasted URL${newCount === 1 ? "" : "s"}. This cannot be undone.`}
        confirmLabel="Replace All"
        onConfirm={() => save("replace")} onCancel={() => setReplaceOpen(false)}
      />

      {/* ── Paste card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-gray-100 flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#6B4A2D" }}>
            <ClipboardPaste size={18} color="#fff" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">{L.cardTitle}</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{L.cardSubtitle}</p>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 space-y-5">
          {children}

          <div>
            <label className="flex items-center justify-between gap-2 text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-1.5">
                <ClipboardPaste size={14} style={{ color: "#6B4A2D" }} /> Image URLs
              </span>
              <span className="text-[11px] font-normal text-gray-400">one per line</span>
            </label>
            <textarea
              rows={7} value={urlText} onChange={(e) => setUrlText(e.target.value)}
              placeholder={L.placeholder}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-xs font-mono text-gray-900 placeholder-gray-300 focus:border-[#6B4A2D] focus:ring-4 focus:ring-[#6B4A2D]/10 outline-none transition resize-y"
            />
            <p className="text-xs text-gray-400 pl-1 mt-1.5">
              Tip: upload files on the <strong>Images</strong> page, then paste the copied URLs here.
            </p>
          </div>

          {/* Preview */}
          {parsed.length > 0 && (
            <div className="rounded-2xl border-2 border-gray-200 bg-[#F7F6F3] overflow-hidden">
              <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-2 flex-wrap">
                <Eye size={14} style={{ color: "#6B4A2D" }} />
                <p className="text-xs sm:text-sm font-bold text-gray-800">
                  Preview — {parsed.length} line{parsed.length === 1 ? "" : "s"}
                </p>
                <span className="text-[11px] font-semibold text-green-600">{newCount} new</span>
                {dupCount > 0 && <span className="text-[11px] font-semibold text-amber-600">· {dupCount} duplicate</span>}
                {badCount > 0 && <span className="text-[11px] font-semibold text-red-600">· {badCount} invalid</span>}
              </div>

              <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[320px] overflow-y-auto">
                {parsed.map((p, i) => {
                  const s = STATUS_STYLE[p.status];
                  return (
                    <div key={`${p.url}-${i}`} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                      <div className="bg-gray-100 relative" style={{ aspectRatio: thumbAspect }}>
                        {p.status !== "invalid" ? (
                          <img src={bestVariantUrl(p.url, 400)} alt="" loading="lazy" className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.opacity = "0.2"; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <AlertCircle size={18} className="text-red-400" />
                          </div>
                        )}
                        <span className={`absolute top-1.5 left-1.5 w-2 h-2 rounded-full ${s.dot}`} />
                      </div>
                      <div className="p-2">
                        <p className="text-[9px] font-mono text-gray-500 truncate" title={p.url}>{p.url}</p>
                        <p className={`text-[9px] font-semibold mt-0.5 ${s.text}`}>{s.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button type="button" onClick={() => setUrlText("")} disabled={!urlText}
              className="sm:w-32 py-3 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition disabled:opacity-40 flex items-center justify-center gap-2">
              <X size={14} /> Clear
            </button>
            <button type="button" onClick={() => setReplaceOpen(true)} disabled={saving || newCount === 0}
              className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-800 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <RefreshCw size={14} /> {L.replaceButton}
            </button>
            <button type="button" onClick={() => save("append")} disabled={saving || newCount === 0}
              className="flex-1 py-3 rounded-xl font-extrabold text-sm text-white transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "#6B4A2D" }}>
              {saving
                ? <><Loader size={15} className="animate-spin" /> Updating…</>
                : <><CheckCircle size={15} /> {L.updateButton}{newCount > 0 ? ` (${newCount})` : ""}</>}
            </button>
          </div>
        </div>
      </div>

      {/* ── Saved list ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Images size={17} style={{ color: "#6B4A2D" }} />
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900">{L.listTitle}</h2>
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#6B4A2D", color: "#fff" }}>
              {items.length}
            </span>
          </div>
          <div className="flex gap-2">
            {orderDirty && (
              <button type="button" onClick={saveOrder} disabled={busy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition shadow disabled:opacity-50"
                style={{ background: "#6B4A2D" }}>
                {busy ? <Loader size={13} className="animate-spin" /> : <Save size={13} />} Save Order
              </button>
            )}
            <button type="button" onClick={onReload}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-white border-2 border-gray-200 hover:border-[#6B4A2D] hover:text-[#6B4A2D] transition">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {orderDirty && (
          <div className="mb-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
            <AlertCircle size={13} className="text-amber-600 shrink-0" />
            <p className="text-xs font-semibold text-amber-700">
              Order changed — click <strong>Save Order</strong> to apply it to the public page.
            </p>
          </div>
        )}

        {error ? (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-red-700">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Loader size={30} className="animate-spin" style={{ color: "#6B4A2D" }} />
            <p className="text-sm font-medium">Loading images…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center px-4">
            <LayoutGrid size={40} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-base font-bold text-gray-600 mb-2">{L.emptyTitle}</h3>
            <p className="text-xs sm:text-sm text-gray-400">{L.emptyBody}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <UrlRow
                key={item.id} item={item} index={index} total={items.length}
                labelKey={labelKey} thumbAspect={thumbAspect}
                onEdit={setEditTarget} onDelete={setDeleteTarget} onMove={move}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
