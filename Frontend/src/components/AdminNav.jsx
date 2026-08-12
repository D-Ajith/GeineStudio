import React, { useState } from "react";
import { Menu, X, LogOut, Plus, Globe, Lock, Images, LayoutGrid, Orbit } from "lucide-react";

/**
 * Shared admin navigation bar — identical styling, spacing and typography on
 * every admin screen. `active` is one of: published | drafts | images | create.
 */
export default function AdminNav({
  active,
  publishedCount = 0,
  draftCount = 0,
  editing = false,
  onSelect,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabCls = (isActive, accent = "#6B4A2D") =>
    `flex items-center gap-1.5 px-3 sm:px-5 py-3.5 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
      isActive
        ? accent === "#6B4A2D"
          ? "border-[#6B4A2D] text-[#6B4A2D]"
          : "border-amber-500 text-amber-600"
        : "border-transparent text-gray-500 hover:text-gray-800"
    }`;

  return (
    <nav className="admin-nav">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex overflow-x-auto no-scrollbar">
            <button onClick={() => onSelect?.("published")} className={tabCls(active === "published")}>
              <Globe size={14} /><span>Published</span>
              <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full" style={{ background: "#6B4A2D", color: "#fff" }}>
                {publishedCount}
              </span>
            </button>

            <button onClick={() => onSelect?.("drafts")} className={tabCls(active === "drafts", "amber")}>
              <Lock size={13} /><span>Drafts</span>
              {draftCount > 0 && (
                <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {draftCount}
                </span>
              )}
            </button>

            <button onClick={() => onSelect?.("images")} className={tabCls(active === "images")}>
              <Images size={14} /><span>Images</span>
            </button>

            <button onClick={() => onSelect?.("portfolio")} className={tabCls(active === "portfolio")}>
              <LayoutGrid size={14} /><span>Portfolio</span>
            </button>

            <button onClick={() => onSelect?.("gallery")} className={tabCls(active === "gallery")}>
              <Orbit size={14} /><span>Gallery</span>
            </button>

            <button onClick={() => onSelect?.("create")} className={tabCls(active === "create")}>
              <Plus size={14} /><span>{editing ? "Edit Blog" : "New Blog"}</span>
              {editing && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">Editing</span>}
            </button>
          </div>

          <button
            onClick={onLogout}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-all shrink-0"
          >
            <LogOut size={15} /> Logout
          </button>
          <button onClick={() => setMobileMenuOpen((p) => !p)} className="sm:hidden p-2 hover:bg-gray-100 rounded-lg shrink-0">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden pb-3 pt-1">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
