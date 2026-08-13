import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaArrowLeft, FaCheckCircle, FaWhatsapp } from 'react-icons/fa';
import OptimizedImage from "../components/OptimizedImage";
import { useTargetWidth } from "../lib/useResponsiveImage";
import { bestVariantUrl } from "../lib/imageManifest";

const Productshoots = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  // Hero paints via CSS background-image, which cannot carry a srcSet.
  const targetWidth = useTargetWidth();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onScroll = () => { hero.style.transform = `translateY(${window.scrollY * 0.35}px)`; };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    "Studio & lifestyle product shots",
    "Detail & angle-focused photography",
    "E-commerce & ad-ready formats",
    "Consistent brand styling",
  ];

  const deliverables = [
    {
      label: "Multiple angles per product",
      img: "https://geniestudio.in/uploads/1786533208_1786533208088-576412932.webp",
    },
    {
      label: "Lifestyle & context shots",
      img: "https://geniestudio.in/uploads/1786533193_1786533192518-337638744.webp",
    },
    {
      label: "Background variations",
      img: "https://geniestudio.in/uploads/1786519473_1786519471789-580284373.jpg",
    },
    {
      label: "Social media optimized files",
      img: "https://geniestudio.in/uploads/1786605558_1786605557565-709229691.jpg",
    },
  ];

  return (
    <main className="w-full overflow-x-hidden bg-white">

      {/* HERO */}
      <section className="relative min-h-[75vh] flex items-end overflow-hidden" style={{ background: '#0F1F0F' }}>
        <div
          ref={heroRef}
          className="absolute inset-0 w-full h-[110%] -top-[5%]"
          style={{
            backgroundImage: `url('${bestVariantUrl("https://geniestudio.in/uploads/1786531726_1786531724729-939039825.webp", targetWidth)}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            imageRendering: 'auto',
            willChange: 'transform',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(15,31,15,0.85) 25%, rgba(15,31,15,0.45) 55%, transparent 100%)',
          }}
        />


        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 pb-12 sm:pb-16">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-5 text-sm font-semibold tracking-widest uppercase" style={{ background: '#4CAF5022', color: '#4CAF50', border: '1px solid #4CAF5044' }}>
            <FaBoxOpen /> Photography & Videography
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-none mb-4 tracking-tight">
            Product<br />Shoots
          </h1>
          <p className="text-xl sm:text-2xl font-light italic mb-6" style={{ color: '#4CAF50' }}>
            Visuals that sell before words can.
          </p>
          <div className="inline-block px-5 py-2 rounded-full text-sm font-bold text-white" style={{ background: '#4CAF50' }}>
            Starting from
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="w-12 h-1 rounded-full mb-6" style={{ background: '#4CAF50' }} />
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight">What's Included</h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Showcase your products in their best light. We specialize in studio product photography and lifestyle shots that highlight features, quality, and appeal. Perfect for e-commerce, advertising, and marketing campaigns. Our meticulous attention to lighting and composition ensures every product looks irresistible to your customers.
            </p>
            <a href="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 shadow-lg" style={{ background: '#4CAF50' }}>
              <FaWhatsapp className="text-lg" /> Book This Service
            </a>
          </div>
          <div className="rounded-2xl p-8 sm:p-10" style={{ background: '#EAF5EA' }}>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Service Highlights</h3>
            <ul className="space-y-4">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700 text-base">
                  <FaCheckCircle className="mt-0.5 flex-shrink-0 text-lg" style={{ color: '#4CAF50' }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20" style={{ background: '#EAF5EA' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-12">
            <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ background: '#4CAF50' }} />
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">What You'll Receive</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 px-4 sm:px-0">
            {deliverables.map((item, i) => (
              <div
                key={i}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 active:scale-95 sm:hover:-translate-y-1 group"
              >
                {/* Image */}
                <div className="w-full h-40 sm:h-44 overflow-hidden">
                  <OptimizedImage
                    src={item.img}
                    alt={item.label}
                    className="w-full h-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    imgClassName="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Card Footer */}
                <div className="p-4 sm:p-5 flex items-center gap-3">
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs"
                    style={{ background: ' #4CAF50' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  <p className="text-slate-800 font-semibold text-sm sm:text-base leading-snug">
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 text-white text-center" style={{ background: '#0F1F0F' }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <FaBoxOpen className="text-5xl mx-auto mb-5 opacity-80" style={{ color: '#4CAF50' }} />
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Ready for a <span style={{ color: '#4CAF50' }}>Product Shoot?</span>
          </h2>
          <p className="text-white/60 text-lg mb-8">Let's create something remarkable together. Reach out for a free consultation and custom quote.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="px-8 py-3.5 rounded-xl font-bold text-base hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg text-white" style={{ background: '#4CAF50' }}>
              Get a Free Quote
            </a>
            <button onClick={() => navigate('/services')} className="px-8 py-3.5 rounded-xl font-bold text-base border border-white/20 text-white/80 hover:bg-white/10 transition-all">
              View All Services
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Productshoots;