import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Orbit } from "lucide-react";

import AdminNav from "../components/AdminNav";
import AdminToast from "../components/AdminToast";
import BulkUrlManager from "../components/BulkUrlManager";
import BASE_URL from "../api";
import {
  fetchGallery, bulkSaveGallery, updateGalleryImage, deleteGalleryImage, reorderGallery,
} from "../lib/galleryApi";

export default function AdminGallery() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [counts, setCounts] = useState({ published: 0, draft: 0 });

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await fetchGallery());
    } catch (err) {
      setError(err?.message || "Could not load the gallery.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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

  const handleNav = (tab) => {
    if (tab === "gallery") return;
    if (tab === "images") return navigate("/admin/images");
    if (tab === "portfolio") return navigate("/admin/portfolio");
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
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
        }
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
        .no-scrollbar::-webkit-scrollbar { display:none; }
      `}</style>

      <AdminToast toast={toast} onClose={() => setToast(null)} />

      <header className="relative min-h-[30vh] sm:min-h-[38vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=1200&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-2 sm:mb-3">
            Dome Gallery
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
            Paste image URLs — the 3D gallery on /gallery updates instantly
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Orbit size={16} className="text-gray-300" />
            <p className="text-xl sm:text-2xl font-black text-white">{items.length}</p>
            <p className="text-[10px] sm:text-xs text-gray-400">images in the dome</p>
          </div>
        </div>
      </header>

      <AdminNav
        active="gallery"
        publishedCount={counts.published}
        draftCount={counts.draft}
        onSelect={handleNav}
        onLogout={() => { localStorage.removeItem("token"); navigate("/admin"); }}
      />

      <section className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        <BulkUrlManager
          items={items}
          onItemsChange={setItems}
          loading={loading}
          error={error}
          onReload={load}
          onToast={showToast}
          onBulkSave={(urls, mode) => bulkSaveGallery({ urls, mode })}
          onEditSave={(item, fields) => updateGalleryImage(item.id, fields)}
          onDelete={(item) => deleteGalleryImage(item.id)}
          onReorder={reorderGallery}
          labelKey="alt"
          extraFields={[{ key: "alt", label: "Alt text", hint: "for accessibility" }]}
          labels={{
            cardTitle: "Bulk Dome Gallery URLs",
            cardSubtitle: "One URL per line — preview, then update the 3D gallery",
            updateButton: "Update Dome Gallery",
            replaceButton: "Replace Entire Gallery",
            replaceTitle: "Replace the whole Dome Gallery?",
            listTitle: "Dome Gallery Images",
            emptyTitle: "No gallery images",
            emptyBody: "Paste URLs above and click Update Dome Gallery.",
            deleteBody: "This image will disappear from the Dome Gallery on /gallery.",
          }}
        />

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
          <h4 className="text-xs sm:text-sm font-bold text-amber-800 mb-3">💡 Quick Tips</h4>
          <ul className="text-[11px] sm:text-xs text-amber-700 space-y-1.5">
            <li className="flex items-start gap-2"><span>→</span> <strong>Update Dome Gallery</strong> adds after the existing images · <strong>Replace Entire Gallery</strong> clears it first</li>
            <li className="flex items-start gap-2"><span>→</span> The dome repeats your images to fill every tile — even a handful of images fills the sphere</li>
            <li className="flex items-start gap-2"><span>→</span> <strong>Portrait images work best</strong> — tiles are taller than they are wide</li>
            <li className="flex items-start gap-2"><span>→</span> Use the arrows to reorder, then <strong>Save Order</strong> — that order maps onto the dome tiles</li>
            <li className="flex items-start gap-2"><span>→</span> Duplicates are detected automatically and skipped</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
