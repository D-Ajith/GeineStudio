import React, { useState, useEffect, useRef } from "react";
import { db } from "../lib/firebase";
import { ref, push, set, remove, update, onValue } from "firebase/database";
import BlogEditor from "../components/BlogEditor";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import {
  Menu, X, LogOut, BookOpen, Edit2, Trash2, Eye, Plus,
  Search, Filter, CheckCircle, AlertCircle, Loader, ChevronRight,
  Calendar, Tag, Link2, Image, FileText, AlignLeft, ArrowLeft,
  MoreVertical, Clock, RefreshCw
} from "lucide-react";

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;
  const isSuccess = toast.type === "success";
  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border animate-slideUp"
      style={{
        background: isSuccess ? "#f0fdf4" : "#fff1f2",
        borderColor: isSuccess ? "#86efac" : "#fca5a5",
        color: isSuccess ? "#166534" : "#991b1b",
        minWidth: 280,
      }}
    >
      {isSuccess
        ? <CheckCircle size={20} className="shrink-0" style={{ color: "#16a34a" }} />
        : <AlertCircle size={20} className="shrink-0" style={{ color: "#dc2626" }} />}
      <span className="font-semibold text-sm flex-1">{toast.msg}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition">
        <X size={16} />
      </button>
    </div>
  );
}

function DeleteModal({ blog, onConfirm, onCancel, loading }) {
  if (!blog) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-red-100 animate-scaleIn">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Blog?</h3>
        <p className="text-sm text-gray-500 text-center mb-1">
          You're about to permanently delete:
        </p>
        <p className="text-sm font-semibold text-gray-800 text-center mb-6 line-clamp-2 px-2">
          "{blog.title}"
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition"
          >
            Keep It
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ blog, onEdit, onDelete, formatDate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
      <div className="relative h-44 bg-gradient-to-br from-amber-50 to-stone-100 overflow-hidden">
        {blog.image ? (
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.onerror = null; e.target.src = ""; }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-300">
            <Image size={40} />
            <span className="text-xs font-medium">No image</span>
          </div>
        )}
        <span
          className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow"
          style={{ background: "#6B4A2D", color: "#fff" }}
        >
          {blog.category}
        </span>

        <div ref={menuRef} className="absolute top-3 right-3">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition"
          >
            <MoreVertical size={16} className="text-gray-700" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-36 z-10 animate-fadeIn">
              <button
                onClick={() => { onEdit(blog); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
              >
                <Edit2 size={14} /> Edit Blog
              </button>
              <button
                onClick={() => { onDelete(blog); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2">
          {blog.title}
        </h3>
        {blog.metaDescription && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
            {blog.metaDescription}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={12} />
            {formatDate(blog.createdAt)}
          </span>
          {blog.updatedAt !== blog.createdAt && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <RefreshCw size={11} /> Updated
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onEdit(blog)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg font-semibold text-xs transition"
          >
            <Edit2 size={13} /> Edit
          </button>
          <button
            onClick={() => onDelete(blog)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-semibold text-xs transition"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, hint, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
        {Icon && <Icon size={14} className="text-[#6B4A2D]" />}
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 pl-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-[#6B4A2D] focus:ring-4 focus:ring-[#6B4A2D]/10 outline-none transition font-medium";


export default function AdminBlogs() {
  const emptyForm = {
    title: "", permalink: "", metaDescription: "",
    description: "", category: "", image: "", keywords: "",
  };

  const categories = [
    "Services", "Corporate Shoots", "Event Shoots", "Product Shoots",
    "Podcast Shoots", "Professional Shoots", "Business Portfolio",
  ];

  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("view");
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null); // blog object
  const [toast, setToast] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const formTopRef = useRef();

  useEffect(() => {
    const blogsRef = ref(db, "blogs");
    const unsub = onValue(blogsRef, (snapshot) => {
      const data = snapshot.val();
      setBlogs(
        data
          ? Object.entries(data)
              .map(([key, val]) => ({ id: key, ...val }))
              .sort((a, b) => b.createdAt - a.createdAt)
          : []
      );
      setDbLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let f = blogs;
    if (searchTerm)
      f = f.filter(
        (b) =>
          b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.metaDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (filterCategory) f = f.filter((b) => b.category === filterCategory);
    setFilteredBlogs(f);
  }, [blogs, searchTerm, filterCategory]);

  const showToast = (msg, type = "success") => setToast({ msg, type });
  const dismissToast = () => setToast(null);

  const formatDate = (ts) =>
    new Date(ts).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });

  const makeSlug = (str) =>
    str.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "-");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === "title") {
        const titleSlug = makeSlug(value);
        const catSlug = prev.category ? makeSlug(prev.category) : "";
        return {
          ...prev,
          title: value,
          permalink: catSlug ? `/${catSlug}/${titleSlug}` : titleSlug,
        };
      }
      if (name === "category") {
        const catSlug = makeSlug(value);
        const titleSlug = prev.title ? makeSlug(prev.title) : "";
        return {
          ...prev,
          category: value,
          permalink: titleSlug ? `/${catSlug}/${titleSlug}` : `/${catSlug}`,
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.category) {
      showToast("Please fill all required fields.", "error");
      return;
    }
    try {
      setLoading(true);
      if (editingId) {
        await update(ref(db, `blogs/${editingId}`), {
          ...form, updatedAt: Date.now(),
        });
        showToast("Blog updated successfully! ✏️");
      } else {
        const newRef = push(ref(db, "blogs"));
        await set(newRef, { ...form, createdAt: Date.now(), updatedAt: Date.now() });
        showToast("Blog published successfully! 🎉");
      }
      resetForm();
      setActiveTab("view");
    } catch (err) {
      console.error(err);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog) => {
    setForm({
      title: blog.title || "",
      permalink: blog.permalink || "",
      metaDescription: blog.metaDescription || "",
      description: blog.description || "",
      category: blog.category || "",
      image: blog.image || "",
      keywords: blog.keywords || "",
    });
    setEditingId(blog.id);
    setActiveTab("create");
    setTimeout(() => formTopRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setLoading(true);
      await remove(ref(db, `blogs/${deleteTarget.id}`));
      showToast("Blog deleted successfully.");
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      showToast("Error deleting blog.", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleLogout = async () => {
    try { await signOut(auth); navigate("/admin"); }
    catch (err) { console.error(err); }
  };

  return (
    <main className="w-full min-h-screen bg-[#F7F6F3] overflow-x-hidden font-sans">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp  { animation: slideUp  .35s ease forwards; }
        .animate-scaleIn  { animation: scaleIn  .25s ease forwards; }
        .animate-fadeIn   { animation: fadeIn   .2s  ease forwards; }
      `}</style>

      <Toast toast={toast} onClose={dismissToast} />

      <DeleteModal
        blog={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={loading}
      />

      <header className="relative min-h-[58vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://i.pinimg.com/1200x/b1/5b/c0/b15bc016bed27f26c118b419fff0112b.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        <div className="relative z-10 text-center px-4">
         
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-3">
            Blog Management
          </h1>
          <p className="text-sm text-gray-300 max-w-md mx-auto">
            Create, edit, and manage all your blog content in one place
          </p>
          <div className="flex items-center justify-center gap-6 mt-5">
            <div className="text-center">
              <p className="text-2xl font-black text-white">{blogs.length}</p>
              <p className="text-xs text-gray-400">Total Blogs</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black text-white">{categories.length}</p>
              <p className="text-xs text-gray-400">Categories</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex">
              <button
                onClick={() => { setActiveTab("view"); }}
                className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                  activeTab === "view"
                    ? "border-[#6B4A2D] text-[#6B4A2D]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Eye size={16} />
                <span className="hidden sm:inline">All Blogs</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#6B4A2D", color: "#fff" }}
                >
                  {blogs.length}
                </span>
              </button>
              <button
                onClick={() => { resetForm(); setActiveTab("create"); }}
                className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                  activeTab === "create"
                    ? "border-[#6B4A2D] text-[#6B4A2D]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Plus size={16} />
                <span className="hidden sm:inline">
                  {editingId ? "Edit Blog" : "New Blog"}
                </span>
                <span className="sm:hidden text-xs">
                  {editingId ? "Edit" : "New"}
                </span>
                {editingId && (
                  <span className="hidden sm:inline text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                    Editing
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-all"
            >
              <LogOut size={15} /> Logout
            </button>
            <button
              onClick={() => setMobileMenuOpen((p) => !p)}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="sm:hidden pb-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>


      {activeTab === "view" && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {/* search + filter bar */}
          <div className="bg-white rounded-2xl p-5 mb-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex-1 w-full">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                Search Blogs
              </label>
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or description…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#6B4A2D] focus:ring-4 focus:ring-[#6B4A2D]/10 outline-none transition"
                />
              </div>
            </div>
            <div className="w-full sm:w-56">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                Category
              </label>
              <div className="relative">
                <Filter size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#6B4A2D] focus:ring-4 focus:ring-[#6B4A2D]/10 outline-none transition appearance-none bg-white cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {(searchTerm || filterCategory) && (
              <button
                onClick={() => { setSearchTerm(""); setFilterCategory(""); }}
                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 py-2.5 px-3 border-2 border-gray-200 rounded-xl transition whitespace-nowrap"
              >
                <X size={13} /> Clear
              </button>
            )}
            <button
              onClick={() => { resetForm(); setActiveTab("create"); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition shadow-md hover:shadow-lg whitespace-nowrap"
              style={{ background: "#6B4A2D" }}
            >
              <Plus size={16} /> New Blog
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-4 font-medium">
            Showing <span className="font-bold text-gray-800">{filteredBlogs.length}</span> of{" "}
            <span className="font-bold text-gray-800">{blogs.length}</span> blogs
          </p>

          {dbLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <Loader size={36} className="animate-spin" style={{ color: "#6B4A2D" }} />
              <p className="text-sm font-medium">Loading blogs…</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-600 mb-2">No blogs found</h3>
              <p className="text-sm text-gray-400 mb-6">
                {blogs.length === 0
                  ? "You haven't created any blogs yet."
                  : "Try a different search or filter."}
              </p>
              {blogs.length === 0 && (
                <button
                  onClick={() => { resetForm(); setActiveTab("create"); }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition"
                  style={{ background: "#6B4A2D" }}
                >
                  <Plus size={16} /> Create First Blog
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBlogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  onEdit={handleEdit}
                  onDelete={(b) => setDeleteTarget(b)}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </section>
      )}


      {activeTab === "create" && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10" ref={formTopRef}>
          {/* back + title */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => { resetForm(); setActiveTab("view"); }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#6B4A2D] font-semibold transition"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-sm font-bold text-gray-700">
              {editingId ? "Edit Blog" : "New Blog"}
            </span>
            {editingId && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-bold ml-1">
                Editing mode
              </span>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: "#6B4A2D" }}
              >
                {editingId ? <Edit2 size={20} color="#fff" /> : <FileText size={20} color="#fff" />}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  {editingId ? "Update Blog Post" : "Create New Blog Post"}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {editingId ? "Modify the details and save changes" : "Fill in the details below and publish"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-8 space-y-6">
              <Field label="Blog Title" required icon={FileText}>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter an engaging blog title…"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </Field>

              <Field label="Category" required icon={Tag}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        handleChange({ target: { name: "category", value: cat } })
                      }
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border-2 transition-all text-left ${
                        form.category === cat
                          ? "border-[#6B4A2D] bg-[#6B4A2D] text-white shadow-md"
                          : "border-gray-200 text-gray-600 hover:border-[#6B4A2D] hover:text-[#6B4A2D]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </Field>

              <Field
                label="Permalink"
                icon={Link2}
                hint="Auto-generated from title & category"
              >
                <div className="flex items-center gap-0 border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-[#6B4A2D] transition">
                  <span className="px-3 py-3 bg-gray-50 text-gray-400 text-sm border-r-2 border-gray-200 font-mono whitespace-nowrap">
                    /blog
                  </span>
                  <input
                    type="text"
                    name="permalink"
                    value={form.permalink}
                    onChange={handleChange}
                    placeholder="auto-generated"
                    className="flex-1 px-3 py-3 text-sm text-gray-700 font-mono outline-none bg-white"
                  />
                </div>
              </Field>

              <Field
                label="Meta Description"
                icon={AlignLeft}
                hint={`${form.metaDescription.length}/160 characters — appears in search results`}
              >
                <textarea
                  name="metaDescription"
                  placeholder="Brief summary for SEO…"
                  value={form.metaDescription}
                  onChange={handleChange}
                  rows={3}
                  maxLength={160}
                  className={inputCls + " resize-none"}
                />
              </Field>

              <Field
                label="Keywords (SEO)"
                icon={Tag}
                hint="Comma-separated keywords for search engine ranking (admin only)"
              >
                <input
                  type="text"
                  name="keywords"
                  placeholder="e.g., photography, videography, corporate shoots…"
                  value={form.keywords}
                  onChange={handleChange}
                  className={inputCls}
                />
              </Field>

              <Field label="Featured Image URL" icon={Image}>
                <input
                  type="url"
                  name="image"
                  placeholder="https://example.com/image.jpg"
                  value={form.image}
                  onChange={handleChange}
                  className={inputCls}
                />
                {form.image && (
                  <div className="mt-2 rounded-xl overflow-hidden border-2 border-gray-200 h-40 bg-gray-50">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = ""; }}
                    />
                  </div>
                )}
              </Field>

              <Field label="Blog Content" required icon={FileText}>
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-[#6B4A2D] transition">
                  <BlogEditor
                    value={form.description}
                    onChange={(val) => setForm((p) => ({ ...p, description: val }))}
                  />
                </div>
              </Field>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => { resetForm(); setActiveTab("view"); }}
                    className="sm:w-40 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                  >
                    <X size={15} /> Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl font-extrabold text-sm text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  style={{ background: loading ? "#9d7a5f" : "#6B4A2D" }}
                >
                  {loading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      {editingId ? "Saving changes…" : "Publishing…"}
                    </>
                  ) : editingId ? (
                    <><CheckCircle size={16} /> Save Changes</>
                  ) : (
                    <><Plus size={16} /> Publish Blog</>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-amber-800 mb-3">💡 Quick Tips</h4>
            <ul className="text-xs text-amber-700 space-y-1.5 list-none">
              <li className="flex items-start gap-2"><span className="mt-0.5">→</span> Permalink auto-generates as <code className="bg-amber-100 px-1 rounded">/blog/category/title-slug</code></li>
              <li className="flex items-start gap-2"><span className="mt-0.5">→</span> Keep meta descriptions under 160 characters for best SEO</li>
              <li className="flex items-start gap-2"><span className="mt-0.5">→</span> Add comma-separated keywords for better search ranking</li>
              <li className="flex items-start gap-2"><span className="mt-0.5">→</span> Use high-resolution images (1200×630px recommended)</li>
              <li className="flex items-start gap-2"><span className="mt-0.5">→</span> Choose the most specific category for better content discovery</li>
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}