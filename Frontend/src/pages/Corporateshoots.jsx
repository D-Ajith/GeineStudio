import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaArrowLeft, FaCheckCircle, FaWhatsapp } from 'react-icons/fa';
import OptimizedImage from "../components/OptimizedImage";

const Corporateshoots = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onScroll = () => { hero.style.transform = `translateY(${window.scrollY * 0.35}px)`; };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    "Corporate office & workspace coverage",
    "Leadership & executive portraits",
    "Team & culture storytelling",
    "Website, LinkedIn & branding-ready visuals",
  ];

  const deliverables = [
    {
      label: "200–400 edited images",
      img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "High-resolution RAW files",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "Color grading & retouching",
      img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "Online gallery & download portal",
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <main className="w-full overflow-x-hidden bg-white">

      <section className="relative min-h-[75vh] flex items-end overflow-hidden" style={{ background: '#0D1B2A' }}>
        <div
          ref={heroRef}
          className="absolute inset-0 w-full h-[110%] -top-[5%]"
          style={{
            backgroundImage: "url('https://i.pinimg.com/1200x/df/f2/c0/dff2c0464e1220f40842f7d051cfbbd9.jpg')",
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
              'linear-gradient(to top, rgba(13,27,42,0.8) 20%, rgba(13,27,42,0.4) 50%, transparent 100%)',
          }}
        />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 pb-12 sm:pb-16">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-5 text-sm font-semibold tracking-widest uppercase" style={{ background: '#1E6FA522', color: '#4A9FD9', border: '1px solid #4A9FD944' }}>
            <FaBuilding /> Photography & Videography
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-none mb-4 tracking-tight">
            Corporate<br />Shoots
          </h1>
          <p className="text-xl sm:text-2xl font-light italic mb-6" style={{ color: '#4A9FD9' }}>
            Visual authority for the modern enterprise.
          </p>
          <div className="inline-block px-5 py-2 rounded-full text-sm font-bold text-white" style={{ background: '#4A9FD9' }}>
            Custom Quote
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="w-12 h-1 rounded-full mb-6" style={{ background: '#4A9FD9' }} />
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight">What's Included</h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Our Corporate Shoots service provides comprehensive visual documentation of your business operations. From capturing the essence of your workplace culture to creating professional executive portraits, we deliver high-quality imagery that strengthens your brand identity and attracts top talent. Every frame is intentional, every image tells your business story.
            </p>
            <a href="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 shadow-lg" style={{ background: '#4A9FD9' }}>
              <FaWhatsapp className="text-lg" /> Book This Service
            </a>
          </div>
          <div className="rounded-2xl p-8 sm:p-10" style={{ background: '#EAF4FC' }}>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Service Highlights</h3>
            <ul className="space-y-4">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700 text-base">
                  <FaCheckCircle className="mt-0.5 flex-shrink-0 text-lg" style={{ color: '#4A9FD9' }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20" style={{ background: '#EAF4FC' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-12">
            <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ background: '#4A9FD9' }} />
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
                    style={{ background: '#4A9FD9' }}
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

      <section className="py-16 md:py-20 text-white text-center" style={{ background: '#0D1B2A' }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <FaBuilding className="text-5xl mx-auto mb-5 opacity-80" style={{ color: '#4A9FD9' }} />
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Ready for a <span style={{ color: '#4A9FD9' }}>Corporate Shoot?</span>
          </h2>
          <p className="text-white/60 text-lg mb-8">Let's create something remarkable together. Reach out for a free consultation and custom quote.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="px-8 py-3.5 rounded-xl font-bold text-base hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg text-white" style={{ background: '#4A9FD9' }}>
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

export default Corporateshoots;