import { useState, useMemo, useEffect } from "react";
import { fetchPortfolio } from "../lib/portfolioApi";

const Portfolio = () => {
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






  return (
    <main className="w-full overflow-x-hidden">

      <section className="relative min-h-[50vh] md:min-h-[60vh] lg:min-h-[55vh] xl:min-h-[50vh] text-white overflow-hidden flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1615567250006-de1875d0c61c?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
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
            {allItems.map((item, index) => (
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
                data-aos-delay={!isMobile ? index * 80 : undefined}
                className=" group overflow-hidden rounded-lg sm:rounded-xl bg-black cursor-pointer " >
                <div className="aspect-[3/4]">
                  <img
                    src={optimizeImage(item.image)}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className=" w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              </div>
            ))}
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