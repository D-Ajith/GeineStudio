import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarCheck, FaArrowLeft, FaCheckCircle, FaWhatsapp } from 'react-icons/fa';
import OptimizedImage from "../components/OptimizedImage";
import { useTargetWidth } from "../lib/useResponsiveImage";
import { bestVariantUrl } from "../lib/imageManifest";

const Eventshoots = () => {
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
    "Full event documentation",
    "Candid & stage highlights",
    "Speaker & audience moments",
    "Fast delivery for marketing use",
  ];

  const deliverables = [
    {
      label: "Full day event coverage",
      img: "https://geniestudio.in/uploads/1786522545_1786522545086-797270712.webp",
    },
    {
      label: "Photo & video combined",
      img: "https://geniestudio.in/uploads/1786531747_1786531746636-336880294.webp",
    },
    {
      label: "Edited highlights video",
      img: "https://geniestudio.in/uploads/1786607657_1786607656901-332159277.jpg",
    },
    {
      label: "500+ high-res images",
      img: "https://geniestudio.in/uploads/1786607742_1786607741286-655224356.jpg",
    },
  ];

  return (
    <main className="w-full overflow-x-hidden bg-white">

      {/* HERO */}
      <section className="relative min-h-[75vh] flex items-end overflow-hidden" style={{ background: '#1C1A2E' }}>
        <div
          ref={heroRef}
          className="absolute inset-0 w-full h-[110%] -top-[5%]"
          style={{
            backgroundImage: `url('${bestVariantUrl("https://geniestudio.in/uploads/1786601438_1786601436150-15515106.png", targetWidth)}')`,
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
              'linear-gradient(to top, rgba(28,26,46,0.85) 25%, rgba(28,26,46,0.45) 55%, transparent 100%)',
          }}
        />


        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 pb-12 sm:pb-16">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-5 text-sm font-semibold tracking-widest uppercase" style={{ background: '#A064F022', color: '#A064F0', border: '1px solid #A064F044' }}>
            <FaCalendarCheck /> Photography & Videography
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-none mb-4 tracking-tight">
            Event<br />Shoots
          </h1>
          <p className="text-xl sm:text-2xl font-light italic mb-6" style={{ color: '#A064F0' }}>
            Every moment, preserved in full frame.
          </p>
          <div className="inline-block px-5 py-2 rounded-full text-sm font-bold text-white" style={{ background: '#A064F0' }}>
            Starting from
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="w-12 h-1 rounded-full mb-6" style={{ background: '#A064F0' }} />
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight">What's Included</h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Capture every important moment at your event. Our professional photographers and videographers provide comprehensive coverage from start to finish, ensuring no critical moment is missed. Perfect for conferences, product launches, and corporate celebrations. We blend into your event seamlessly while capturing the energy and essence of every scene.
            </p>
            <a href="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 shadow-lg" style={{ background: '#A064F0' }}>
              <FaWhatsapp className="text-lg" /> Book This Service
            </a>
          </div>
          <div className="rounded-2xl p-8 sm:p-10" style={{ background: '#F0EAFF' }}>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Service Highlights</h3>
            <ul className="space-y-4">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700 text-base">
                  <FaCheckCircle className="mt-0.5 flex-shrink-0 text-lg" style={{ color: '#A064F0' }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20" style={{ background: '#F0EAFF' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-12">
            <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ background: '#A064F0' }} />
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
                    style={{ background: '#A064F0' }}
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

      <section className="py-16 md:py-20 text-white text-center" style={{ background: '#1C1A2E' }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <FaCalendarCheck className="text-5xl mx-auto mb-5 opacity-80" style={{ color: '#A064F0' }} />
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Ready for an <span style={{ color: '#A064F0' }}>Event Shoot?</span>
          </h2>
          <p className="text-white/60 text-lg mb-8">Let's create something remarkable together. Reach out for a free consultation and custom quote.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="px-8 py-3.5 rounded-xl font-bold text-base hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg text-white" style={{ background: '#A064F0' }}>
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

export default Eventshoots;