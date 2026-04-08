import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Calendar, Tag, Share2, Copy, Check, ArrowRight,
} from "lucide-react";
import DOMPurify from "dompurify";
import BASE_URL from "../api";

const FALLBACK =
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80";

const cleanSlug = (raw) =>
    raw ? raw.replace(/^\/+/, "").replace(/^blog\//, "") : raw;

export default function BlogDetail() {
    const params = useParams();
    const slug = params["*"];
    const navigate = useNavigate();

    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [relatedBlogs, setRelated] = useState([]);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            setImgError(false);
            setBlog(null);
            setRelated([]);

            const safeSlug = cleanSlug(slug);

            if (!safeSlug) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${BASE_URL}/api/blog/${safeSlug}`);

                if (!res.ok) {
                    setBlog(null);
                    return;
                }

                const data = await res.json();

                if (!data || !data.title) {
                    setBlog(null);
                    return;
                }

                setBlog(data);

                try {
                    const allRes = await fetch(`${BASE_URL}/api/blogs`);
                    const allData = await allRes.json();

                    if (Array.isArray(allData)) {
                        const related = allData
                            .filter(
                                (b) =>
                                    b.category === data.category &&
                                    cleanSlug(b.permalink) !== safeSlug &&
                                    b.status === "published"
                            )
                            .slice(0, 3);
                        setRelated(related);
                    }
                } catch (_) {
                    
                }
            } catch (err) {
                console.error("BlogDetail fetch error:", err);
                setBlog(null);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [slug]);

    useEffect(() => {
        if (!blog?.keywords) return;
        const kw = blog.keywords.split(",").map((k) => k.trim()).filter(Boolean);
        document.head.querySelector('meta[name="keywords"]')?.remove();
        const m = document.createElement("meta");
        m.name = "keywords";
        m.content = kw.join(", ");
        document.head.appendChild(m);
        return () => m.remove();
    }, [blog]);

    const formatDate = (ts) =>
        ts
            ? new Date(Number(ts)).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
            })
            : "Just now";

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const goRelated = (b) => {
        navigate(`/blog/${cleanSlug(b.permalink)}`);
        window.scrollTo(0, 0);
    };

    if (loading) {
        return (
            <main className="w-full min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4">
                <div className="animate-spin">
                    <svg className="w-12 h-12 sm:w-14 sm:h-14 text-[#6B4A2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="2" />
                    </svg>
                </div>
                <p className="text-slate-600 font-medium text-sm sm:text-base">Loading blog…</p>
            </main>
        );
    }

    if (!blog) {
        return (
            <main className="w-full min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4">
                <svg className="w-14 h-14 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-slate-600 font-medium text-sm sm:text-base">Blog not found</p>
                <p className="text-slate-400 text-xs mt-1">
                    Slug: <code className="bg-slate-100 px-1 rounded">{slug || "undefined"}</code>
                </p>
                <button
                    onClick={() => navigate("/blogs")}
                    className="mt-3 px-6 py-2.5 bg-[#6B4A2D] hover:bg-[#5a3f25] text-white rounded-lg transition-colors text-sm font-semibold"
                >
                    Back to Blogs
                </button>
            </main>
        );
    }

    const heroSrc = !imgError && blog.image ? blog.image : FALLBACK;

    return (
        <main className="w-full overflow-x-hidden">

            <section className="relative w-full bg-[#f5f0eb] overflow-hidden">
                <div className="relative w-full flex items-center justify-center min-h-[320px] sm:min-h-[340px] md:min-h-[400px]">
                    <img
                        src={heroSrc}
                        alt={blog.title}
                        onError={() => setImgError(true)}
                        loading="eager"
                        decoding="async"
                        className="w-full h-auto max-h-[420px] sm:max-h-[420px] md:max-h-[500px] lg:max-h-[580px] xl:max-h-[640px] object-contain block"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#f5f0eb] to-transparent pointer-events-none" />
                </div>
                {blog.category && (
                    <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-6 md:left-10">
                        <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#6B4A2D] text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg">
                            <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
                            {blog.category}
                        </span>
                    </div>
                )}
            </section>

            <article className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b-2 border-slate-100">
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <Calendar className="w-4 h-4 text-[#6B4A2D] flex-shrink-0" strokeWidth={2} />
                            <time dateTime={String(blog.createdAt)}>{formatDate(blog.createdAt)}</time>
                        </div>
                        <button
                            onClick={copyLink}
                            title="Copy link"
                            className="flex items-center gap-2 px-4 py-2 bg-[#6B4A2D] hover:bg-[#5a3f25] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors w-fit"
                        >
                            {copied ? (
                                <><Check className="w-4 h-4 text-green-300" strokeWidth={2.5} /><span>Copied!</span></>
                            ) : (
                                <><Copy className="w-4 h-4" strokeWidth={2} /><span>Share</span></>
                            )}
                        </button>
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 sm:mb-5 leading-tight tracking-tight">
                        {blog.title}
                    </h1>

                    {blog.metaDescription && (
                        <p className="text-base sm:text-lg text-slate-600 leading-relaxed italic pl-4 sm:pl-5 py-3 sm:py-4 mb-8 sm:mb-10 bg-amber-50 border-l-4 border-[#6B4A2D] rounded-r-xl font-normal">
                            "{blog.metaDescription}"
                        </p>
                    )}

                    <div
                        className="
              text-[17px] leading-[1.85] text-slate-800
              sm:text-[18px] sm:leading-[1.9]
              break-words
              [&_*]:box-border
              [&_p]:my-5 [&_p]:leading-[1.85] [&_p]:text-slate-700 [&_p]:text-[17px]
              sm:[&_p]:text-[18px]
              [&_h1]:text-3xl [&_h1]:sm:text-4xl [&_h1]:font-extrabold [&_h1]:text-slate-900
              [&_h1]:tracking-tight [&_h1]:leading-tight [&_h1]:mt-10 [&_h1]:mb-4
              [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-bold [&_h2]:text-slate-900
              [&_h2]:tracking-tight [&_h2]:leading-snug [&_h2]:mt-10 [&_h2]:mb-4
              [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-slate-100
              [&_h3]:text-xl [&_h3]:sm:text-2xl [&_h3]:font-bold [&_h3]:text-slate-800
              [&_h3]:leading-snug [&_h3]:mt-8 [&_h3]:mb-3
              [&_h4]:text-lg [&_h4]:sm:text-xl [&_h4]:font-semibold [&_h4]:text-slate-800
              [&_h4]:leading-snug [&_h4]:mt-6 [&_h4]:mb-2
              [&_strong]:font-bold [&_strong]:text-slate-900
              [&_b]:font-bold [&_b]:text-slate-900
              [&_em]:italic [&_em]:text-slate-600
              [&_i]:italic [&_i]:text-slate-600
              [&_u]:underline [&_u]:underline-offset-[3px] [&_u]:decoration-slate-400
              [&_s]:line-through [&_s]:text-slate-400
              [&_del]:line-through [&_del]:text-slate-400
              [&_strike]:line-through [&_strike]:text-slate-400
              [&_mark]:bg-amber-100 [&_mark]:text-slate-900 [&_mark]:px-1 [&_mark]:rounded-sm
              [&_a]:text-[#6B4A2D] [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2
              [&_a]:decoration-[#6B4A2D]/40 [&_a]:transition-colors
              [&_a:hover]:text-[#9b6a3d] [&_a:hover]:decoration-[#9b6a3d]/60
              [&_blockquote]:my-8 [&_blockquote]:pl-5 [&_blockquote]:pr-4 [&_blockquote]:py-4
              [&_blockquote]:border-l-4 [&_blockquote]:border-[#6B4A2D]
              [&_blockquote]:bg-amber-50 [&_blockquote]:rounded-r-xl
              [&_blockquote]:text-slate-600 [&_blockquote]:italic [&_blockquote]:text-[17px]
              [&_blockquote]:leading-relaxed
              [&_blockquote_p]:my-0 [&_blockquote_p]:text-slate-600
              [&_code]:font-mono [&_code]:text-[14px] [&_code]:text-[#6B4A2D]
              [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5
              [&_code]:rounded [&_code]:border [&_code]:border-slate-200
              [&_pre]:my-6 [&_pre]:bg-[#1a1a2e] [&_pre]:text-slate-100
              [&_pre]:rounded-xl [&_pre]:p-5 [&_pre]:overflow-x-auto
              [&_pre]:text-[13px] [&_pre]:sm:text-[14px] [&_pre]:leading-relaxed [&_pre]:font-mono
              [&_pre_code]:bg-transparent [&_pre_code]:border-none [&_pre_code]:text-slate-100
              [&_pre_code]:p-0 [&_pre_code]:text-[13px] [&_pre_code]:sm:text-[14px]
              [&_ul]:my-5 [&_ul]:pl-6 [&_ul]:list-disc
              [&_ol]:my-5 [&_ol]:pl-6 [&_ol]:list-decimal
              [&_li]:my-2 [&_li]:leading-[1.75] [&_li]:text-slate-700 [&_li]:text-[17px]
              sm:[&_li]:text-[18px]
              [&_ul_li]:marker:text-[#6B4A2D]
              [&_ol_li]:marker:text-[#6B4A2D] [&_ol_li]:marker:font-bold
              [&_li_ul]:mt-2 [&_li_ul]:mb-1 [&_li_ol]:mt-2 [&_li_ol]:mb-1
              [&_hr]:my-10 [&_hr]:border-0 [&_hr]:border-t-2 [&_hr]:border-slate-100
              [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:shadow-md
              [&_img]:my-6 [&_img]:block [&_img]:mx-auto
              [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse
              [&_table]:text-sm [&_table]:sm:text-base
              [&_th]:bg-slate-50 [&_th]:font-bold [&_th]:text-slate-900
              [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:border [&_th]:border-slate-200
              [&_td]:px-4 [&_td]:py-3 [&_td]:text-slate-700 [&_td]:border [&_td]:border-slate-200
              [&_tr:nth-child(even)_td]:bg-slate-50
            "
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(blog.description),
                        }}
                    />

                    <div className="my-10 sm:my-12 border-t-2 border-slate-100" />

                    <div className="rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center mb-2 bg-gradient-to-br from-amber-50 to-stone-100 border-2 border-stone-200">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">✨ Found This Helpful?</h3>
                        <p className="text-sm sm:text-base text-slate-600 mb-5 sm:mb-6 max-w-md mx-auto">
                            Share this article with friends and colleagues who might find it useful.
                        </p>
                        <button
                            onClick={copyLink}
                            className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[#6B4A2D] hover:bg-[#5a3f25] text-white font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                            {copied ? "Copied to Clipboard!" : "Copy Article Link"}
                        </button>
                    </div>
                </div>
            </article>

            {relatedBlogs.length > 0 && (
                <section className="py-10 sm:py-14 md:py-16 lg:py-20 bg-gradient-to-br from-stone-50 to-amber-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10 sm:mb-12">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 sm:mb-3 tracking-tight">
                                📚 Related Articles
                            </h2>
                            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
                                More from the <span className="font-bold text-[#6B4A2D]">{blog.category}</span> category
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            {relatedBlogs.map((rb) => (
                                <article
                                    key={rb.id}
                                    onClick={() => goRelated(rb)}
                                    className="group flex flex-col overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer border border-slate-100 hover:border-stone-300"
                                >
                                    <div className="relative w-full bg-[#f5f0eb] overflow-hidden aspect-[4/3]">
                                        <img
                                            src={rb.image || FALLBACK}
                                            alt={rb.title || "Related blog"}
                                            loading="lazy"
                                            decoding="async"
                                            onError={(e) => { e.currentTarget.src = FALLBACK; }}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        {rb.category && (
                                            <div className="absolute top-2.5 left-2.5 z-10">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#6B4A2D] text-white text-[10px] sm:text-xs font-semibold rounded-full shadow">
                                                    <Tag className="w-3 h-3" strokeWidth={2} />
                                                    {rb.category}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1 p-4 sm:p-5">
                                        {rb.createdAt && (
                                            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mb-2">
                                                <Calendar className="w-3.5 h-3.5 text-[#6B4A2D]" strokeWidth={2} />
                                                <time>{formatDate(rb.createdAt)}</time>
                                            </div>
                                        )}
                                        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#6B4A2D] mb-2 line-clamp-2 transition-colors duration-300 leading-snug">
                                            {rb.title}
                                        </h3>
                                        <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3 flex-1">
                                            {rb.metaDescription || rb.description?.replace(/<[^>]+>/g, "").substring(0, 100)}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[#6B4A2D] font-semibold text-xs sm:text-sm group-hover:gap-2.5 transition-all duration-300">
                                            <span>Read More</span>
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="py-10 sm:py-14 md:py-16 lg:py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-5 tracking-tight">
                        Ready to Create Amazing Visuals?
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
                        Let's bring your creative vision to life. Contact Genie Studio today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <button
                            onClick={() => navigate("/blogs")}
                            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm sm:text-base rounded-lg transition-colors border border-slate-200"
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                            Back to Blogs
                        </button>
                        <button
                            onClick={() => navigate("/contact")}
                            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[#6B4A2D] hover:bg-[#5a3f25] text-white font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 group"
                        >
                            Get in Touch
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2} />
                        </button>
                    </div>
                </div>
            </section>

        </main>
    );
}