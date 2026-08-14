import React, { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBriefcase, FaArrowLeft, FaCheckCircle, FaWhatsapp } from 'react-icons/fa';
import OptimizedImage from "../components/OptimizedImage";
import Breadcrumbs from "../components/Breadcrumbs";
import Seo from "../components/Seo";
import { SEO, serviceSchema } from "../lib/seoConfig";

/** Declared once, then used by both <Breadcrumbs> and <Seo>. */
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Business Portfolio Shoots", path: "/services/business-portfolio-shoots" },
];

const Businessportfolioshoots = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    // Coalesce to one write per frame. A scroll event can fire many times
    // between paints, and each `style.transform =` invalidates layout — so the
    // unbatched version did several times more work than the screen could
    // show, which is what surfaces as "forced reflow". The motion is
    // identical; it just no longer runs ahead of the compositor.
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        hero.style.transform = `translateY(${window.scrollY * 0.35}px)`;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    "Brand & business storytelling",
    "Website & pitch-deck visuals",
    "Consistent visual identity",
    "Custom creative direction",
  ];

  const deliverables = [
    {
      label: "400–800 curated images",
      img: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "Team & culture documentation",
      img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "Process & workflow shots",
      img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "Brand guidelines included",
      img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <main className="w-full overflow-x-hidden bg-white">
      <Seo
        {...SEO.businessPortfolio}
        schema={serviceSchema({
          name: "Business Portfolio Shoots",
          description: SEO.businessPortfolio.description,
          path: SEO.businessPortfolio.path,
        })}
        breadcrumbs={CRUMBS}
      />


      <section className="relative min-h-[75vh] flex items-end overflow-hidden" style={{ background: '#1A1A14' }}>
        <div
          ref={heroRef}
          className="absolute inset-0 w-full h-[110%] -top-[5%]"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1920&q=100')",
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
              'linear-gradient(to top, rgba(26,26,20,0.85) 25%, rgba(26,26,20,0.45) 55%, transparent 100%)',
          }}
        />


        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 pb-12 sm:pb-16">
          <Breadcrumbs items={CRUMBS} className="mb-5 text-white/70" />

          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-5 text-sm font-semibold tracking-widest uppercase" style={{ background: '#C9A22722', color: '#C9A227', border: '1px solid #C9A22744' }}>
            <FaBriefcase /> Photography & Videography
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-none mb-4 tracking-tight">
            Business<br />Portfolio Shoots
          </h1>
          <p className="text-xl sm:text-2xl font-light italic mb-6" style={{ color: '#C9A227' }}>
            The full story of your brand, told beautifully.
          </p>
          <div className="inline-block px-5 py-2 rounded-full text-sm font-bold text-white" style={{ background: '#C9A227' }}>
            Custom Quote
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="w-12 h-1 rounded-full mb-6" style={{ background: '#C9A227' }} />
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight">What's Included</h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Tell your brand story through compelling visual narratives. Our comprehensive portfolio service combines team portraits, office culture, work processes, and product documentation to create a cohesive visual identity. Every deliverable is crafted to be pitch-ready, investor-ready, and brand-ready from day one.
            </p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 shadow-lg" style={{ background: '#C9A227' }}>
              <FaWhatsapp className="text-lg" /> Book This Service
            </Link>
          </div>
          <div className="rounded-2xl p-8 sm:p-10" style={{ background: '#FAF6E8' }}>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Service Highlights</h3>
            <ul className="space-y-4">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700 text-base">
                  <FaCheckCircle className="mt-0.5 flex-shrink-0 text-lg" style={{ color: '#C9A227' }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20" style={{ background: '#FAF6E8' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-12">
            <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ background: '#C9A227' }} />
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
                    style={{ background: '#C9A227' }}
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

      <section className="py-16 md:py-20 text-white text-center" style={{ background: '#1A1A14' }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <FaBriefcase className="text-5xl mx-auto mb-5 opacity-80" style={{ color: '#C9A227' }} />
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Ready for a <span style={{ color: '#C9A227' }}>Business Portfolio Shoot?</span>
          </h2>
          <p className="text-white/60 text-lg mb-8">Let's create something remarkable together. Reach out for a free consultation and custom quote.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="px-8 py-3.5 rounded-xl font-bold text-base hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg text-white" style={{ background: '#C9A227' }}>
              Get a Free Quote
            </Link>
            <button onClick={() => navigate('/services')} className="px-8 py-3.5 rounded-xl font-bold text-base border border-white/20 text-white/80 hover:bg-white/10 transition-all">
              View All Services
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Businessportfolioshoots;