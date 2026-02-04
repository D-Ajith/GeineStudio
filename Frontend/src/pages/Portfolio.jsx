import DomeGallery from "@/components/DomeGallery";
import { useState, useMemo, useEffect } from "react";
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
  useEffect(() => {
    setShuffledAll(shuffleArray(portfolioItems));
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

  const portfolioItems = [
    {
      id: 1,
      category: "corporate",
      image: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?w=800&q=80",
      title: "Corporate Leadership Portraits",
      description: "Professional portraits crafted for executives and leadership branding.",
    },
    {
      id: 2,
      category: "corporate",
      image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?w=800&q=80",
      title: "Office & Workplace Culture",
      description: "Authentic visuals showcasing company culture and work environment.",
    },
    {
      id: 3,
      category: "corporate",
      image: "https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?w=800&q=80",
      title: "Team & Staff Photography",
      description: "Clean and consistent team photos for websites and corporate profiles.",
    },

    {
      id: 4,
      category: "events",
      image: "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?w=800&q=80",
      title: "Corporate Conferences",
      description: "Complete coverage of conferences, seminars, and business summits.",
    },
    {
      id: 5,
      category: "events",
      image: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?w=800&q=80",
      title: "Brand Launch Events",
      description: "High-energy visuals capturing brand launches and promotions.",
    },
    {
      id: 6,
      category: "events",
      image: "https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?w=800&q=80",
      title: "Corporate Celebrations",
      description: "Professional documentation of corporate gatherings and milestones.",
    },

    {
      id: 7,
      category: "product",
      image: "https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg?w=800&q=80",
      title: "E-commerce Product Shoots",
      description: "Clean, conversion-focused product photography for online stores.",
    },
    {
      id: 8,
      category: "product",
      image: "https://images.pexels.com/photos/1342609/pexels-photo-1342609.jpeg?w=800&q=80",
      title: "Lifestyle Product Photography",
      description: "Products captured in real-life environments for stronger storytelling.",
    },
    {
      id: 9,
      category: "product",
      image: "https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?w=800&q=80",
      title: "Food & Commercial Products",
      description: "Stylized product visuals designed for marketing and advertising.",
    },

    {
      id: 10,
      category: "podcast",
      image: "https://images.pexels.com/photos/7586659/pexels-photo-7586659.jpeg?w=800&q=80",
      title: "Podcast Studio Setup",
      description: "Professional podcast visuals with studio lighting and clean framing.",
    },
    {
      id: 11,
      category: "podcast",
      image: "https://images.pexels.com/photos/7648047/pexels-photo-7648047.jpeg?w=800&q=80",
      title: "Video Podcast Recording",
      description: "High-quality video podcasts ready for YouTube and social platforms.",
    },
    {
      id: 12,
      category: "podcast",
      image: "https://images.pexels.com/photos/7988086/pexels-photo-7988086.jpeg?w=800&q=80",
      title: "Interview Podcast Sessions",
      description: "Clean, cinematic podcast interviews with professional audio setup.",
    },

    {
      id: 13,
      category: "professional",
      image: "https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?w=800&q=80",
      title: "Personal Branding Portraits",
      description: "Premium portraits for professionals, founders, and creators.",
    },
    {
      id: 14,
      category: "professional",
      image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?w=800&q=80",
      title: "Studio Portrait Sessions",
      description: "Well-lit studio portraits with a polished professional finish.",
    },
    {
      id: 15,
      category: "professional",
      image: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?w=800&q=80",
      title: "Creative Professional Portraits",
      description: "Stylish portraits designed to stand out across platforms.",
    },

    {
      id: 16,
      category: "business",
      image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?w=800&q=80",
      title: "Brand Portfolio Photography",
      description: "Visual storytelling crafted for business portfolios and websites.",
    },
    {
      id: 17,
      category: "business",
      image: "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?w=800&q=80",
      title: "Startup & Company Showcases",
      description: "End-to-end business visuals highlighting products, teams, and spaces.",
    },
    {
      id: 18,
      category: "business",
      image: "https://images.pexels.com/photos/3182765/pexels-photo-3182765.jpeg?w=800&q=80",
      title: "Corporate Brand Storytelling",
      description: "Consistent imagery designed to reflect brand identity and vision.",
    },
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
  }, [activeCategory, shuffledAll]);






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

            <div className="text-center text-white mt-4 px-2">
              <h3 className="text-xl sm:text-2xl font-bold">
                {selectedImage.title}
              </h3>
              <p className="text-slate-300 text-sm sm:text-base">
                {selectedImage.description}
              </p>
            </div>
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
                setVisibleCount(6);

                if (cat.id === "all") {
                  setShuffledAll(shuffleArray(portfolioItems));
                }
              }}

              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${activeCategory === cat.id
                ? "bg-[#6B4A2D] text-white"
                : "bg-[#F7F6F3] hover:bg-slate-200"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      <section className="py-6 sm:py-10 md:py-16 bg-[#F7F6F3]">
        <div className="max-w-[1300px] mx-auto px-2 sm:px-6">

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

        </div>
      </section>


      <section className="py-14 bg-white text-center">
        <h2 className="text-3xl font-bold mb-4">Want to See More?</h2>
        <p className="text-slate-600 mb-6">
          Visit our studio or schedule a consultation
        </p>
        <a
          href="/contact"
          className="inline-block px-7 py-3 bg-[#6B4A2D] text-white rounded-xl hover:bg-slate-800"
        >
          Schedule a Consultation
        </a>
      </section>


    </main>
  );
};

export default Portfolio;
