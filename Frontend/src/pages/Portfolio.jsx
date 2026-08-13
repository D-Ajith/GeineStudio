import { useState, useMemo, useEffect, useRef } from "react";
import AOS from "aos";
import { fetchPortfolio } from "../lib/portfolioApi";
import OptimizedImage from "../components/OptimizedImage";
import { useTargetWidth } from "../lib/useResponsiveImage";
import { bestVariantUrl } from "../lib/imageManifest";
import Seo from "../components/Seo";
import { SEO } from "../lib/seoConfig";

/** Images rendered per batch — the rest stream in as the visitor scrolls. */
const BATCH = 12;

const Portfolio = () => {
  // Hero paints via CSS background-image, which cannot carry a srcSet.
  const targetWidth = useTargetWidth();
  const optimizeImage = (url) =>
    url?.includes("cloudinary")
      ? url.replace(
        "/upload/",
        "/upload/w_900,q_auto:best,f_auto/"
      )
      : url;
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [shuffledAll, setShuffledAll] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  // Progressive loading: only this many tiles are mounted at a time
  const [visibleCount, setVisibleCount] = useState(BATCH);
  const sentinelRef = useRef(null);

  // Images come from the admin Portfolio Manager (/admin/portfolio) — nothing
  // about this page is hardcoded any more.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchPortfolio();
        if (cancelled) return;
        const items = rows.map((row) => ({
          id: row.id,
          category: row.category,
          image: row.image_url,
          title: row.title || "",
          description: row.description || "",
        }));
        setPortfolioItems(items);
        setShuffledAll(shuffleArray(items));
      } catch {
        if (!cancelled) setPortfolioItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const categories = [
    { id: "all", name: "All" },
    { id: "corporate", name: "Corporate" },
    { id: "events", name: "Event" },
    { id: "product", name: "Product" },
    { id: "podcast", name: "Podcast" },
    { id: "professional", name: "Professional" },
    { id: "business", name: "Business Portfolio" },
  ];

  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const allItems = useMemo(() => {
    if (activeCategory === "all") {
      return shuffledAll;
    }
    return portfolioItems.filter(
      (item) => item.category === activeCategory
    );
  }, [activeCategory, shuffledAll, portfolioItems]);

  // Only the first `visibleCount` tiles are mounted; the sentinel below the
  // grid pulls in the next batch as it approaches the viewport. Without this
  // the "All" tab mounted every image at once.
  const shownItems = useMemo(
    () => allItems.slice(0, visibleCount),
    [allItems, visibleCount]
  );
  const hasMore = visibleCount < allItems.length;

  // AOS hides [data-aos] elements until it animates them, and it only tracks
  // elements it has already scanned. Newly appended batches must be re-scanned
  // or they stay at opacity:0 forever.
  useEffect(() => {
    AOS.refreshHard();
  }, [shownItems.length]);

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(c + BATCH, allItems.length));
        }
      },
      // Start fetching before the sentinel is actually on screen
      { rootMargin: "800px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, allItems.length]);






  return (
    <main className="w-full overflow-x-hidden">
      <Seo
        {...SEO.portfolio}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Portfolio", path: SEO.portfolio.path },
        ]}
      />


      <section className="relative min-h-[50vh] md:min-h-[60vh] lg:min-h-[55vh] xl:min-h-[50vh] text-white overflow-hidden flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${bestVariantUrl(
              "https://geniestudio.in/uploads/1786602496_1786602495549-844717374.jpg",
              targetWidth
            )}')`,
          }}
        />

        <div className="absolute inset-0 bg-black/60"></div>

        <div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          data-aos="fade-up"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Our Portfolio
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Discover a collection of visuals crafted with creativity and purpose.          </p>
        </div>
      </section>



      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center px-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white hover:text-slate-300 transition z-10"
          >
            <svg
              className="w-9 h-9"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div
            className="flex flex-col items-center justify-center max-w-6xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.image}
              alt={selectedImage.title}
              className="max-h-[75vh] w-auto object-contain rounded-lg"
            />

            {(selectedImage.title || selectedImage.description) && (
              <div className="text-center text-white mt-4 px-2">
                {selectedImage.title && (
                  <h3 className="text-xl sm:text-2xl font-bold">
                    {selectedImage.title}
                  </h3>
                )}
                {selectedImage.description && (
                  <p className="text-slate-300 text-sm sm:text-base">
                    {selectedImage.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}


      <section className="bg-white sticky top-16 z-40 shadow-sm py-3">
        <div className="flex gap-3 px-4 sm:justify-center overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setVisibleCount(BATCH);   // start each category from the top

                if (cat.id === "all") {
                  setShuffledAll(shuffleArray(portfolioItems));
                }
              }}

              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${activeCategory === cat.id
                ? "bg-[#6B4A2D] text-white"
                : "bg-[#F7F6F3] text-black hover:bg-[#EDE3D9]"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      <section className="py-6 sm:py-10 md:py-16 bg-[#F7F6F3]">
        <div className="max-w-[1300px] mx-auto px-2 sm:px-6">

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-[3px] sm:gap-3 lg:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg sm:rounded-xl overflow-hidden bg-gray-200 animate-pulse">
                  <div className="aspect-[3/4]" />
                </div>
              ))}
            </div>
          ) : allItems.length === 0 ? (
            <p className="text-center text-slate-500 py-16">
              No images in this category yet.
            </p>
          ) : (
            <div className=" grid grid-cols-2 md:grid-cols-3 gap-[3px] sm:gap-3 lg:gap-5 " >
              {shownItems.map((item, index) => (
                <div
                  key={`${item.category}-${item.id}-${index}`}
                  onClick={() => setSelectedImage(item)}
                  data-aos={
                    !isMobile
                      ? index % 2 === 0
                        ? 'fade-right'
                        : 'fade-left'
                      : undefined
                  }
                  data-aos-delay={!isMobile ? (index % BATCH) * 80 : undefined}
                  className=" group overflow-hidden rounded-lg sm:rounded-xl bg-black cursor-pointer " >
                  <OptimizedImage
                    src={optimizeImage(item.image)}
                    variants={item.variants}
                    alt={item.title}
                    aspectRatio="3 / 4"
                    /* The first row is above the fold on most screens */
                    priority={index < 3}
                    sizes="(max-width: 768px) 50vw, (max-width: 1300px) 33vw, 420px"
                    imgClassName="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pulls in the next batch as it nears the viewport */}
          {!loading && hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-8">
              <span className="text-xs text-slate-400">Loading more…</span>
            </div>
          )}

        </div>
      </section>


      <section className="py-14 bg-white text-center">
        <h2 className="text-3xl font-bold mb-4 text-black">Want to See More?</h2>
        <p className="text-slate-600 mb-6">
          Visit our studio or schedule a consultation
        </p>
        <a
          href="/contact"
          className="inline-block px-7 py-3 bg-[#6B4A2D] text-white rounded-xl hover:bg-[#EDE3D9] hover:text-black"
        >
          Schedule a Consultation
        </a>
      </section>


    </main>
  );
};

export default Portfolio;