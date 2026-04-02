import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { ref, get } from "firebase/database";
import { ArrowRight, Calendar, Tag } from "lucide-react";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const snapshot = await get(ref(db, "blogs"));

        if (snapshot.exists()) {
          const data = snapshot.val();

          const formatted = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          formatted.sort((a, b) => b.createdAt - a.createdAt);

          setBlogs(formatted);
        } else {
          setBlogs([]);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Hidden Keywords Meta Tag for SEO
  useEffect(() => {
    if (blogs.length > 0) {
      const allKeywords = blogs
        .map((blog) => blog.keywords)
        .filter(Boolean)
        .join(", ");

      if (allKeywords) {
        document.head.querySelector('meta[name="keywords"]')?.remove();
        const metaKeywords = document.createElement("meta");
        metaKeywords.name = "keywords";
        metaKeywords.content = allKeywords;
        document.head.appendChild(metaKeywords);
      }
    }
  }, [blogs]);

  const categories = [
    "All",
    ...new Set(blogs.map((blog) => blog.category).filter(Boolean)),
  ];

  const filteredBlogs =
    selectedCategory === "All"
      ? blogs
      : blogs.filter((blog) => blog.category === selectedCategory);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleReadMore = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  return (
    <main className="w-full overflow-x-hidden">
      <section className="relative min-h-[45vh] sm:min-h-[50vh] md:min-h-[60vh] lg:min-h-[55vh] flex items-center text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=600&fit=crop&auto=format&ixlib=rb-4.1.0')",
          }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 drop-shadow-lg">
            Our Blog
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl sm:max-w-3xl mx-auto drop-shadow-md">
            Insights and creative stories from Geine Studio
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {categories.length > 1 && (
            <div className="mb-10 sm:mb-12 md:mb-14 lg:mb-16">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition-all duration-300 ${
                      selectedCategory === cat
                        ? "bg-[#6B4A2D] text-white shadow-lg scale-105"
                        : "bg-[#F7F6F3] text-slate-700 hover:bg-slate-200 hover:scale-102"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

           {loading ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 md:py-24">
              <div className="animate-spin">
                <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[#6B4A2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <p className="mt-4 text-slate-600 font-medium text-sm sm:text-base">Loading amazing content...</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 md:py-24">
              <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
              </svg>
              <p className="text-slate-600 font-medium text-sm sm:text-base md:text-lg">No blogs found in this category</p>
              <p className="text-slate-500 text-xs sm:text-sm mt-2">Check back soon for new content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {filteredBlogs.map((blog, index) => (
                <article
                  key={blog.id}
                  data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                  data-aos-delay={index * 100}
                  className="group relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="relative overflow-hidden h-40 sm:h-48 md:h-56 lg:h-64">
                    <img
                      src={
                        blog.image ||
                        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80"
                      }
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {blog.category && (
                      <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 z-10">
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-[#6B4A2D] text-white text-xs sm:text-xs md:text-sm font-semibold rounded-full">
                          <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" strokeWidth={2} />
                          {blog.category}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                    {blog.createdAt && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-xs md:text-sm text-slate-500 mb-2 sm:mb-3 md:mb-4">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4" strokeWidth={2} />
                        <time>{formatDate(blog.createdAt)}</time>
                      </div>
                    )}

                    <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-900 group-hover:text-[#6B4A2D] mb-2 sm:mb-3 md:mb-4 line-clamp-3 transition-colors duration-300">
                      {blog.title}
                    </h2>

                    <p className="text-xs sm:text-xs md:text-sm lg:text-base text-slate-600 line-clamp-3 leading-relaxed mb-3 sm:mb-4 md:mb-5">
                      {blog.metaDescription || blog.description}
                    </p>

                    <button
                      onClick={() => handleReadMore(blog.id)}
                      className="flex items-center gap-1.5 sm:gap-2 text-[#6B4A2D] font-semibold text-xs sm:text-sm md:text-base group-hover:gap-3 transition-all duration-300 cursor-pointer hover:text-slate-900"
                    >
                      <span>Read More</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
                    </button>
                  </div>

                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-bl from-[#6B4A2D]/0 group-hover:from-[#6B4A2D]/10 to-transparent rounded-bl-full transition-all duration-500" />
                </article>
              ))}
            </div>
          )}

          {!loading && filteredBlogs.length > 0 && (
            <div className="mt-10 sm:mt-12 md:mt-14 lg:mt-16 text-center">
              <p className="text-slate-600 text-xs sm:text-sm md:text-base">
                Showing <span className="font-semibold text-slate-900">{filteredBlogs.length}</span> of <span className="font-semibold text-slate-900">{blogs.length}</span> articles
              </p>
            </div>
          )}
        </div>
      </section>

      {!loading && blogs.length > 0 && (
        <section className="py-10 sm:py-14 md:py-16 lg:py-20 bg-[#F7F6F3]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-5 md:mb-6 tracking-tight">
              Want to Share Your Story?
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Get in touch with us to discuss your project, book a shoot, or collaborate with Geine Studio.
            </p>
            <button className="inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 lg:py-5 bg-[#6B4A2D] text-white font-semibold text-xs sm:text-sm md:text-base rounded-lg hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl group"  onClick={() => navigate("/contact")}>
              Get Started
              <ArrowRight className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2} />
            </button>
          </div>
        </section>
      )}
    </main>
  );
}