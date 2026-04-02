import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { ref, get } from "firebase/database";
import { ArrowLeft, Calendar, Tag, Share2, Copy, Check, ArrowRight } from "lucide-react";
import DOMPurify from "dompurify";
export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const snapshot = await get(ref(db, `blogs/${id}`));

        if (snapshot.exists()) {
          setBlog({
            id: id,
            ...snapshot.val(),
          });

          const allBlogsSnapshot = await get(ref(db, "blogs"));
          if (allBlogsSnapshot.exists()) {
            const allBlogs = allBlogsSnapshot.val();
            const related = Object.keys(allBlogs)
              .map((key) => ({
                id: key,
                ...allBlogs[key],
              }))
              .filter(
                (b) =>
                  b.category === snapshot.val().category &&
                  b.id !== id
              )
              .slice(0, 3);

            setRelatedBlogs(related);
          }
        } else {
          setBlog(null);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  useEffect(() => {
    if (blog?.keywords) {
      const keywordsArray = blog.keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k);
      document.head.querySelector('meta[name="keywords"]')?.remove();
      const metaKeywords = document.createElement("meta");
      metaKeywords.name = "keywords";
      metaKeywords.content = keywordsArray.join(", ");
      document.head.appendChild(metaKeywords);
    }
  }, [blog]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReadMore = (blogId) => {
    navigate(`/blog/${blogId}`);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-white pt-20 sm:pt-24 flex flex-col items-center justify-center px-4">
        <div className="animate-spin">
          <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#6B4A2D" }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <p className="mt-4 text-slate-600 font-medium text-sm sm:text-base">Loading blog...</p>
      </main>
    );
  }

  if (!blog) {
    return (
      <main className="w-full min-h-screen bg-white pt-20 sm:pt-24 flex flex-col items-center justify-center px-4">
        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-slate-600 font-medium text-sm sm:text-base">Blog not found</p>
        <button
          onClick={() => navigate("/blogs")}
          className="mt-6 px-6 py-2.5 text-white rounded-lg transition-all duration-300 text-sm sm:text-base font-semibold"
          style={{ backgroundColor: "#6B4A2D" }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#5a3f25"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#6B4A2D"}
        >
          Back to Blogs
        </button>
      </main>
    );
  }

  return (
    <main className="w-full overflow-x-hidden">
      {/* Hidden Keywords Meta Tag for SEO */}
      {blog?.keywords && (
        <meta name="keywords" content={blog.keywords} />
      )}

      <section className="relative w-full h-56 sm:h-64 md:h-80 lg:h-96 xl:h-[28rem] overflow-hidden bg-slate-200 -mt-16 sm:-mt-20 md:-mt-24 pt-16 sm:pt-20 md:pt-24">
        <img
          src={
            blog.image ||
            "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80"
          }
          alt={blog.title}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {blog.category && (
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 lg:left-12">
            <span className="inline-flex items-center gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-white text-xs sm:text-sm md:text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300" style={{ backgroundColor: "#6B4A2D" }}>
              <Tag className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5" strokeWidth={2} />
              {blog.category}
            </span>
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 lg:left-12 p-2 sm:p-2.5 text-slate-900 rounded-lg shadow-lg transition-all duration-300 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255, 255, 255, 1)"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "rgba(255, 255, 255, 0.9)"}
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
        </button>
      </section>

      <article className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b-2 border-slate-200">
              <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-slate-600 font-medium">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" strokeWidth={2} style={{ color: "#6B4A2D" }} />
                <time dateTime={blog.createdAt}>{formatDate(blog.createdAt)}</time>
              </div>

              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-white rounded-lg transition-all duration-300 text-xs sm:text-sm font-semibold w-fit border-2"
                style={{
                  backgroundColor: "#6B4A2D",
                  borderColor: "#6B4A2D"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#5a3f25";
                  e.currentTarget.style.borderColor = "#5a3f25";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#6B4A2D";
                  e.currentTarget.style.borderColor = "#6B4A2D";
                }}
                title="Copy link"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" strokeWidth={2} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" strokeWidth={2} />
                    <span className="hidden sm:inline">Share</span>
                  </>
                )}
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight tracking-tight">
              {blog.title}
            </h1>

            {blog.metaDescription && (
              <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed italic pl-4 sm:pl-6 py-3 sm:py-4 bg-slate-50 rounded-r-lg font-medium"
                style={{ borderLeftColor: "#6B4A2D", borderLeftWidth: "4px" }}
              >
                "{blog.metaDescription}"
              </p>
            )}
          </div>

          <div className="prose prose-sm sm:prose md:prose-lg max-w-none mb-10 sm:mb-12 md:mb-16">
            <div
              className="
    prose prose-sm sm:prose-base md:prose-lg
    max-w-none
    font-sans
    text-base sm:text-lg md:text-xl
    leading-relaxed
    tracking-wide
    text-slate-800
    dark:text-slate-200

    prose-headings:font-semibold
    prose-h1:text-3xl sm:text-4xl prose-h1:mb-6 prose-h1:mt-8
    prose-h2:text-2xl sm:text-3xl prose-h2:mb-4 prose-h2:mt-6
    prose-h3:text-xl sm:text-2xl

    prose-p:text-lg prose-p:leading-loose prose-p:mb-6

    [&_a]:text-blue-600
    dark:[&_a]:text-blue-400
    [&_a]:underline
    [&_a]:underline-offset-4
    [&_a]:font-medium
    hover:[&_a]:text-blue-700
    dark:hover:[&_a]:text-blue-300
  "
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(blog.description),
              }}
            />      
            </div>

          <div className="my-10 sm:my-12 md:my-16" style={{ borderTopWidth: "2px", borderTopColor: "#e2e8f0" }} />

          <div className="rounded-lg sm:rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-10 text-center mb-10 sm:mb-12 md:mb-16"
            style={{
              background: "linear-gradient(to bottom right, #f5f1ed, #ede9e0)",
              borderWidth: "2px",
              borderColor: "#d4c4ad"
            }}
          >
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">
              ✨ Found This Helpful?
            </h3>
            <p className="text-sm sm:text-base text-slate-700 mb-6 sm:mb-8 max-w-xl mx-auto font-medium">
              Share this article with your friends and colleagues who might find it useful.
            </p>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-2.5 sm:py-3 md:py-4 text-white font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
              style={{ backgroundColor: "#6B4A2D" }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#5a3f25"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#6B4A2D"}
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
              {copied ? "Copied to Clipboard!" : "Copy Article Link"}
            </button>
          </div>
        </div>
      </article>

      {relatedBlogs && relatedBlogs.length > 0 && (
        <section className="py-10 sm:py-14 md:py-16 lg:py-20" style={{ background: "linear-gradient(to bottom right, #f9f8f6, #ede9e0)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* SECTION HEADER */}
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4 tracking-tight">
                📚 Related Articles
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-medium">
                Explore more stories from the <span className="font-bold" style={{ color: "#6B4A2D" }}>{blog.category}</span> category
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {relatedBlogs.map((relatedBlog, index) => (
                <article
                  key={relatedBlog.id}
                  className="group relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-slate-200"
                  style={{ borderColor: "inherit" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#d4c4ad";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                  onClick={() => handleReadMore(relatedBlog.id)}
                >
                  <div className="relative overflow-hidden h-40 sm:h-48 md:h-56 bg-slate-300">
                    <img
                      src={
                        relatedBlog.image ||
                        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80"
                      }
                      alt={relatedBlog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {relatedBlog.category && (
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 text-white text-xs font-semibold rounded-full shadow-md" style={{ backgroundColor: "#6B4A2D" }}>
                          <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
                          {relatedBlog.category}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4 md:p-5">
                    {relatedBlog.createdAt && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 mb-2 sm:mb-3 font-medium">
                        <Calendar className="w-3.5 h-3.5" strokeWidth={2} style={{ color: "#6B4A2D" }} />
                        <time>{formatDate(relatedBlog.createdAt)}</time>
                      </div>
                    )}

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 line-clamp-2 transition-colors duration-300" style={{ color: "inherit" }} onMouseEnter={(e) => e.target.style.color = "#6B4A2D"} onMouseLeave={(e) => e.target.style.color = "#111827"}>
                      {relatedBlog.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3 sm:mb-4 font-medium">
                      {relatedBlog.metaDescription || relatedBlog.description?.substring(0, 100)}
                    </p>

                    <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm group-hover:gap-2 transition-all duration-300" style={{ color: "#6B4A2D" }}>
                      <span>Read More</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 rounded-bl-full transition-all duration-500"
                    style={{
                      background: "linear-gradient(135deg, rgba(107, 74, 45, 0) 0%, rgba(107, 74, 45, 0) 50%)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "linear-gradient(135deg, rgba(107, 74, 45, 0.1) 0%, transparent 50%)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "linear-gradient(135deg, rgba(107, 74, 45, 0) 0%, rgba(107, 74, 45, 0) 50%)";
                    }}
                  />
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-10 sm:py-14 md:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-5 md:mb-6 tracking-tight">
            Ready to Create Amazing Visuals?
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Let's bring your creative vision to life. Contact Geine Studio today to discuss your photography and videography needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <button
              onClick={() => navigate("/blogs")}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 md:py-4 text-slate-900 font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 border border-slate-300"
              style={{ backgroundColor: "#f3f4f6" }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#e5e7eb";
                e.target.style.borderColor = "#d1d5db";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#f3f4f6";
                e.target.style.borderColor = "#d1d5db";
              }}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
              Back to Blogs
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 md:py-4 text-white font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl group transform hover:scale-105 hover:-translate-y-1"
              style={{ backgroundColor: "#6B4A2D" }}
              onClick={() => navigate("/contact")}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#5a3f25"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#6B4A2D"}
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