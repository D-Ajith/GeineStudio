import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Images, Upload, CheckCircle, Copy, Trash2, Loader, RefreshCw, X, Link2, AlertCircle, Search,
} from "lucide-react";

import BASE_URL from "../api";
import AdminNav from "../components/AdminNav";
import AdminToast from "../components/AdminToast";
import ImageUploader from "../components/ImageUploader";
import ImageLibraryGrid from "../components/ImageLibraryGrid";
import { fetchImages, deleteImage, copyToClipboard } from "../lib/imageApi";

function DeleteImageModal({ image, onConfirm, onCancel, loading }) {
  if (!image) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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

export default function AdminImages() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [images, setImages] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");
  const [lastUploaded, setLastUploaded] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [counts, setCounts] = useState({ published: 0, draft: 0 });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredImages = searchTerm
    ? images.filter((img) =>
        `${img.original_name || ""} ${img.filename || ""} ${img.file_url || ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : images;

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const loadImages = async () => {
    setLoadingList(true);
    setListError("");
    try {
      setImages(await fetchImages());
    } catch (err) {
      setListError(err?.message || "Could not load the image library.");
    } finally {
      setLoadingList(false);
    }
  };

  const loadBlogCounts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/blogs`, { headers: { Authorization: token } });
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setCounts({
        published: data.filter((b) => b.status === "published").length,
        draft: data.filter((b) => b.status === "draft").length,
      });
    } catch {
      /* counts are cosmetic — ignore */
    }
  };

  useEffect(() => { loadImages(); loadBlogCounts(); }, []);

  const handleUploaded = (image) => {
    setLastUploaded(image);
    setCopied(false);
    setImages((prev) => [image, ...prev.filter((i) => i.id !== image.id)]);
    showToast("🎉 Upload successful — image is live on Hostinger!");
  };

  const handleCopyUrl = async (url) => {
    const ok = await copyToClipboard(url);
    if (!ok) return showToast("Could not copy the URL.", "error");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    showToast("URL copied to clipboard.");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteImage(deleteTarget.id);
      setImages((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      if (lastUploaded?.id === deleteTarget.id) setLastUploaded(null);
      setDeleteTarget(null);
      showToast("Image removed from library.");
    } catch (err) {
      showToast(err?.message || "Could not delete the image.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin");
  };

  const handleNav = (tab) => {
    if (tab === "images") return;
    navigate("/admin/blogs", { state: { tab } });
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
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
        }
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
        .no-scrollbar::-webkit-scrollbar { display:none; }
      `}</style>

      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <DeleteImageModal
        image={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      <header className="relative min-h-[32vh] sm:min-h-[42vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1400&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-2 sm:mb-3">
            Image Library
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
            Upload images once — reuse the same Hostinger URL in any blog
          </p>
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-5">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-black text-white">{images.length}</p>
              <p className="text-[10px] sm:text-xs text-gray-400">Images</p>
            </div>
            <div className="w-px h-7 sm:h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-black text-white">{counts.published}</p>
              <p className="text-[10px] sm:text-xs text-gray-400">Published</p>
            </div>
          </div>
        </div>
      </header>

      <AdminNav
        active="images"
        publishedCount={counts.published}
        draftCount={counts.draft}
        onSelect={handleNav}
        onLogout={handleLogout}
      />

      <section className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">

        {/* ── Upload card ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-gray-100 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#6B4A2D" }}>
              <Upload size={18} color="#fff" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Upload Image</h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Uploads straight to Hostinger — no blog required
              </p>
            </div>
          </div>

          <div className="px-4 sm:px-8 py-6 sm:py-8">
            <ImageUploader
              autoUpload
              showPreview={false}
              inputId="library-image-upload"
              onUpload={handleUploaded}
              onError={(msg) => showToast(msg, "error")}
            />

            {/* ── Upload successful ─────────────────────────────────────── */}
            {lastUploaded && (
              <div className="mt-5 rounded-2xl border-2 border-green-200 bg-green-50 overflow-hidden animate-fadeIn">
                <div className="px-4 py-2.5 bg-green-100 border-b border-green-200 flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-600" />
                  <p className="text-xs sm:text-sm font-bold text-green-800">Upload successful</p>
                </div>
                <div className="p-4 grid gap-4 sm:grid-cols-[220px_1fr]">
                  <div className="relative rounded-xl overflow-hidden border-2 border-green-200 bg-gray-100 w-full" style={{ aspectRatio: "16/9" }}>
                    <img
                      src={lastUploaded.url || lastUploaded.file_url}
                      alt={lastUploaded.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-green-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                      <Link2 size={11} /> Public HTTPS URL
                    </p>
                    <p className="text-[11px] sm:text-xs font-mono text-gray-700 bg-white border border-green-200 rounded-lg px-3 py-2.5 break-all">
                      {lastUploaded.url || lastUploaded.file_url}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(lastUploaded.url || lastUploaded.file_url)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
                          copied ? "bg-green-600 text-white" : "text-white"
                        }`}
                        style={copied ? undefined : { background: "#6B4A2D" }}
                      >
                        {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
                        {copied ? "Copied!" : "Copy URL"}
                      </button>
                      <a
                        href={lastUploaded.url || lastUploaded.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-white border-2 border-gray-200 text-gray-700 hover:border-[#6B4A2D] hover:text-[#6B4A2D] transition"
                      >
                        Open image
                      </a>
                      <button
                        type="button"
                        onClick={() => setLastUploaded(null)}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-white border-2 border-gray-200 text-gray-500 hover:text-red-600 transition"
                        title="Dismiss"
                      >
                        <X size={13} />
                      </button>
                    </div>
                    {lastUploaded.width && lastUploaded.height && (
                      <p className="text-[11px] text-gray-500 mt-3">
                        {lastUploaded.width} × {lastUploaded.height} px · {lastUploaded.filename}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Library ────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Images size={17} style={{ color: "#6B4A2D" }} />
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900">Uploaded Images</h2>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#6B4A2D", color: "#fff" }}>
                {images.length}
              </span>
            </div>
            <button
              type="button"
              onClick={loadImages}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-white border-2 border-gray-200 hover:border-[#6B4A2D] hover:text-[#6B4A2D] transition"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {/* ── Search ─────────────────────────────────────────────────── */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search images by file name or URL…"
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
              Showing <strong className="text-gray-800">{filteredImages.length}</strong> of{" "}
              <strong className="text-gray-800">{images.length}</strong> images
            </p>
          )}

          {listError ? (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-red-700">{listError}</p>
            </div>
          ) : (
            <ImageLibraryGrid
              images={filteredImages}
              loading={loadingList}
              onDelete={(image) => setDeleteTarget(image)}
              emptyHint={
                searchTerm
                  ? "No images match that search."
                  : "Upload your first image using the box above."
              }
            />
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
          <h4 className="text-xs sm:text-sm font-bold text-amber-800 mb-3">💡 Quick Tips</h4>
          <ul className="text-[11px] sm:text-xs text-amber-700 space-y-1.5">
            <li className="flex items-start gap-2"><span>→</span> Images upload to <strong>public_html/uploads/</strong> on Hostinger and are served over HTTPS immediately</li>
            <li className="flex items-start gap-2"><span>→</span> Best image: <strong>1200×675px · JPG/WebP · 16:9 · max 500KB</strong></li>
            <li className="flex items-start gap-2"><span>→</span> Use <strong>Copy URL</strong> to paste the link anywhere, or pick the image from <strong>New Blog → Featured Image → Select From Library</strong></li>
            <li className="flex items-start gap-2"><span>→</span> One image can back many blogs — selecting from the library never re-uploads the file</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
