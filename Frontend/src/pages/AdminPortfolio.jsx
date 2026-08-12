import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid, ClipboardPaste, Eye, Loader, CheckCircle, AlertCircle, X, Copy,
  Trash2, Pencil, ArrowUp, ArrowDown, RefreshCw, Save, ExternalLink, Images,
} from "lucide-react";

import AdminNav from "../components/AdminNav";
import AdminToast from "../components/AdminToast";
import BASE_URL from "../api";
import {
  PORTFOLIO_CATEGORIES, categoryName, fetchPortfolio, bulkSavePortfolio,
  updatePortfolioImage, deletePortfolioImage, reorderPortfolio,
} from "../lib/portfolioApi";

const isValidUrl = (u) => /^https?:\/\/\S+$/i.test(u);

/* ── Parse the textarea into unique, validated lines ───────────────────── */
function parseUrls(text, existingUrls = []) {
  const seen = new Set();
  const already = new Set(existingUrls);
  const rows = [];

  String(text || "").split(/\r?\n/).forEach((line) => {
    const url = line.trim();
    if (!url) return;
    let status = "new";
    if (!isValidUrl(url)) status = "invalid";
    else if (seen.has(url)) status = "repeat";     // duplicated within the paste
    else if (already.has(url)) status = "existing"; // already in this category
    if (isValidUrl(url)) seen.add(url);
    rows.push({ url, status });
  });

  return rows;
}

/* ── Edit dialog ───────────────────────────────────────────────────────── */
function EditImageModal({ item, onConfirm, onCancel, loading }) {
  const [url, setUrl] = useState(item.image_url || "");
  const [title, setTitle] = useState(item.title || "");
  const [description, setDescription] = useState(item.description || "");

  const valid = isValidUrl(url.trim());

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 animate-scaleIn max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-12 bg-[#6B4A2D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Pencil size={20} style={{ color: "#6B4A2D" }} />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-4">Edit Portfolio Image</h3>

        <div className="rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 w-full mb-4" style={{ aspectRatio: "3/4", maxHeight: 220 }}>
          <img src={url} alt={title} className="w-full h-full object-cover"
            onError={(e) => { e.target.style.opacity = "0.25"; }} />
        </div>

        <label className="text-xs font-semibold text-gray-600 block mb-1.5">Image URL</label>
        <input
          type="text" value={url} onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#6B4A2D] focus:ring-4 focus:ring-[#6B4A2D]/10 outline-none transition font-mono text-xs"
        />
        {!valid && url.trim() && (
          <p className="text-[11px] font-semibold text-red-600 mt-1">Must start with http:// or https://</p>
        )}

        <label className="text-xs font-semibold text-gray-600 block mb-1.5 mt-4">Title <span className="text-gray-400 font-normal">(shown in the lightbox)</span></label>
        <input
          type="text" value={title} maxLength={255} onChange={(e) => setTitle(e.target.value)}
          placeholder="Optional"
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#6B4A2D] focus:ring-4 focus:ring-[#6B4A2D]/10 outline-none transition"
        />

        <label className="text-xs font-semibold text-gray-600 block mb-1.5 mt-4">Description</label>
        <textarea
          rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#6B4A2D] focus:ring-4 focus:ring-[#6B4A2D]/10 outline-none transition resize-none"
        />

        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition">
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ image_url: url.trim(), title: title.trim(), description: description.trim() })}
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
            onClick={onConfirm}
            disabled={loading}
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

/* ── Row in the current-images list ────────────────────────────────────── */
function PortfolioRow({ item, index, total, onEdit, onDelete, onMove }) {
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

      <div className="w-14 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200" style={{ aspectRatio: "3/4" }}>
        <img src={item.image_url} alt={item.title || ""} loading="lazy" className="w-full h-full object-cover"
          onError={(e) => { e.target.style.opacity = "0.25"; }} />
      </div>

      <div className="flex-1 min-w-0">
        {item.title && <p className="text-xs font-bold text-gray-800 truncate">{item.title}</p>}
        <p className="text-[10px] text-gray-500 font-mono truncate" title={item.image_url}>{item.image_url}</p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <div className="flex flex-col">
          <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0}
            title="Move up"
            className="px-1.5 py-0.5 rounded text-gray-500 hover:text-[#6B4A2D] hover:bg-gray-100 disabled:opacity-25 disabled:cursor-not-allowed transition">
            <ArrowUp size={12} />
          </button>
          <button type="button" onClick={() => onMove(index, 1)} disabled={index === total - 1}
            title="Move down"
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
export default function AdminPortfolio() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [category, setCategory] = useState("corporate");
  const [urlText, setUrlText] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [counts, setCounts] = useState({ published: 0, draft: 0 });
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);

  const showToast = (msg, type = "success") => setToast({ msg, type });
  const orderRef = useRef([]);
  orderRef.current = items.map((i) => i.id);

  const load = useCallback(async (cat) => {
    setLoading(true);
    setError("");
    try {
      setItems(await fetchPortfolio(cat));
      setOrderDirty(false);
    } catch (err) {
      setError(err?.message || "Could not load the portfolio.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(category); }, [category, load]);

  // Nav badge counts only
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/blogs`, { headers: { Authorization: token } });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data)) return;
        setCounts({
          published: data.filter((b) => b.status === "published").length,
          draft: data.filter((b) => b.status === "draft").length,
        });
      } catch { /* cosmetic */ }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const existingUrls = useMemo(() => items.map((i) => i.image_url), [items]);
  const parsed = useMemo(() => parseUrls(urlText, existingUrls), [urlText, existingUrls]);
  const newCount = parsed.filter((p) => p.status === "new").length;
  const badCount = parsed.filter((p) => p.status === "invalid").length;
  const dupCount = parsed.filter((p) => p.status === "repeat" || p.status === "existing").length;

  const save = async (mode) => {
    if (parsed.length === 0) return;
    setSaving(true);
    try {
      const res = await bulkSavePortfolio({
        category,
        urls: parsed.map((p) => p.url),
        mode,
      });
      setItems(res.items || []);
      setUrlText("");
      setOrderDirty(false);
      showToast(
        mode === "replace"
          ? `✅ ${categoryName(category)} replaced — ${res.added} image${res.added === 1 ? "" : "s"} live.`
          : `✅ ${res.message} — live on the Portfolio page.`
      );
    } catch (err) {
      showToast(err?.message || "Could not update the portfolio.", "error");
    } finally {
      setSaving(false);
      setReplaceOpen(false);
    }
  };

  const handleEdit = async (fields) => {
    if (!editTarget) return;
    setBusy(true);
    try {
      const updated = await updatePortfolioImage(editTarget.id, fields);
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setEditTarget(null);
      showToast("Portfolio image updated.");
    } catch (err) {
      showToast(err?.message || "Could not update the image.", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deletePortfolioImage(deleteTarget.id);
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Image removed from the portfolio.");
    } catch (err) {
      showToast(err?.message || "Could not delete the image.", "error");
    } finally {
      setBusy(false);
    }
  };

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setOrderDirty(true);
  };

  const saveOrder = async () => {
    setBusy(true);
    try {
      await reorderPortfolio(orderRef.current);
      setOrderDirty(false);
      showToast("New order saved — the Portfolio page will use it.");
    } catch (err) {
      showToast(err?.message || "Could not save the order.", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleNav = (tab) => {
    if (tab === "images") return navigate("/admin/images");
    navigate("/admin/blogs", { state: { tab } });
  };

  const statusStyle = {
    new:      { dot: "bg-green-500",  text: "text-gray-700",   label: "New" },
    existing: { dot: "bg-amber-500",  text: "text-amber-700",  label: "Already in this category — will be skipped" },
    repeat:   { dot: "bg-amber-500",  text: "text-amber-700",  label: "Repeated in this list — will be skipped" },
    invalid:  { dot: "bg-red-500",    text: "text-red-600",    label: "Not a valid http(s) URL" },
  };

  return (
    <main className="w-full min-h-screen bg-[#F7F6F3] overflow-x-hidden font-sans">
      <style>{`
        @keyframes slideUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn  { from { opacity:0; transform:scale(.92); }       to { opacity:1; transform:scale(1); } }
        @keyframes fadeIn   { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .animate-slideUp { animation: slideUp  .35s ease forwards; }
        .animate-scaleIn { animation: scaleIn  .25s ease forwards; }
        .animate-fadeIn  { animation: fadeIn   .2s  ease forwards; }
        .admin-nav {
          position: sticky; top: 0; z-index: 30;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
        }
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
        .no-scrollbar::-webkit-scrollbar { display:none; }
      `}</style>

      <AdminToast toast={toast} onClose={() => setToast(null)} />
      {editTarget && (
        <EditImageModal key={editTarget.id} item={editTarget} loading={busy}
          onConfirm={handleEdit} onCancel={() => setEditTarget(null)} />
      )}
      <ConfirmModal
        open={Boolean(deleteTarget)} danger loading={busy}
        title="Remove Image?"
        body={`This image will disappear from the ${categoryName(category)} category on the public Portfolio page.`}
        confirmLabel="Yes, Remove"
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmModal
        open={replaceOpen} loading={saving}
        title={`Replace all ${categoryName(category)} images?`}
        body={`All ${items.length} image${items.length === 1 ? "" : "s"} currently in ${categoryName(category)} will be deleted and replaced by the ${newCount} pasted URL${newCount === 1 ? "" : "s"}. This cannot be undone.`}
        confirmLabel="Replace All"
        onConfirm={() => save("replace")} onCancel={() => setReplaceOpen(false)}
      />

      <header className="relative min-h-[30vh] sm:min-h-[38vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1615567250006-de1875d0c61c?q=80&w=1331&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-2 sm:mb-3">
            Portfolio Manager
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
            Paste image URLs by category — the public Portfolio page updates instantly
          </p>
        </div>
      </header>

      <AdminNav
        active="portfolio"
        publishedCount={counts.published}
        draftCount={counts.draft}
        onSelect={handleNav}
        onLogout={() => { localStorage.removeItem("token"); navigate("/admin"); }}
      />

      <section className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">

        {/* ── Bulk URL manager ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-gray-100 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#6B4A2D" }}>
              <ClipboardPaste size={18} color="#fff" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Bulk Image URLs</h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">One URL per line — preview, then update</p>
            </div>
          </div>

          <div className="px-4 sm:px-8 py-6 space-y-5">
            {/* Category */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <LayoutGrid size={14} style={{ color: "#6B4A2D" }} /> Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PORTFOLIO_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border-2 transition-all text-left ${
                      category === cat.id
                        ? "border-[#6B4A2D] bg-[#6B4A2D] text-white shadow-md"
                        : "border-gray-200 text-gray-600 hover:border-[#6B4A2D] hover:text-[#6B4A2D]"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Paste box */}
            <div>
              <label className="flex items-center justify-between gap-2 text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-1.5">
                  <ClipboardPaste size={14} style={{ color: "#6B4A2D" }} /> Image URLs
                </span>
                <span className="text-[11px] font-normal text-gray-400">one per line</span>
              </label>
              <textarea
                rows={7}
                value={urlText}
                onChange={(e) => setUrlText(e.target.value)}
                placeholder={"https://geniestudio.in/uploads/product1.jpg\nhttps://geniestudio.in/uploads/product2.webp\nhttps://geniestudio.in/uploads/product3.jpg"}
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
                    const s = statusStyle[p.status];
                    return (
                      <div key={`${p.url}-${i}`} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                        <div className="bg-gray-100 relative" style={{ aspectRatio: "3/4" }}>
                          {p.status !== "invalid" ? (
                            <img src={p.url} alt="" loading="lazy" className="w-full h-full object-cover"
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
              <button
                type="button"
                onClick={() => setUrlText("")}
                disabled={!urlText}
                className="sm:w-32 py-3 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <X size={14} /> Clear
              </button>
              <button
                type="button"
                onClick={() => setReplaceOpen(true)}
                disabled={saving || newCount === 0}
                className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-800 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} /> Replace All in {categoryName(category)}
              </button>
              <button
                type="button"
                onClick={() => save("append")}
                disabled={saving || newCount === 0}
                className="flex-1 py-3 rounded-xl font-extrabold text-sm text-white transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: "#6B4A2D" }}
              >
                {saving
                  ? <><Loader size={15} className="animate-spin" /> Updating…</>
                  : <><CheckCircle size={15} /> Update Portfolio{newCount > 0 ? ` (${newCount})` : ""}</>}
              </button>
            </div>
          </div>
        </div>

        {/* ── Current images ───────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Images size={17} style={{ color: "#6B4A2D" }} />
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900">
                {categoryName(category)} Images
              </h2>
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
              <button type="button" onClick={() => load(category)}
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
              <h3 className="text-base font-bold text-gray-600 mb-2">
                No images in {categoryName(category)}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Paste URLs above and click Update Portfolio.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <PortfolioRow
                  key={item.id}
                  item={item}
                  index={index}
                  total={items.length}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                  onMove={move}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
          <h4 className="text-xs sm:text-sm font-bold text-amber-800 mb-3">💡 Quick Tips</h4>
          <ul className="text-[11px] sm:text-xs text-amber-700 space-y-1.5">
            <li className="flex items-start gap-2"><span>→</span> <strong>Update Portfolio</strong> adds the pasted URLs after the existing ones · <strong>Replace All</strong> wipes the category first</li>
            <li className="flex items-start gap-2"><span>→</span> Duplicates are detected automatically and skipped — pasting the same list twice is safe</li>
            <li className="flex items-start gap-2"><span>→</span> Use the arrows to reorder, then click <strong>Save Order</strong> — that order is what visitors see</li>
            <li className="flex items-start gap-2"><span>→</span> Title and description are optional and only appear in the lightbox when the image is opened</li>
            <li className="flex items-start gap-2"><span>→</span> Changes go live immediately — the Portfolio page reads this data on every visit</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
