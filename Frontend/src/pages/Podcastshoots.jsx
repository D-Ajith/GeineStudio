import React, { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaPodcast, FaArrowLeft, FaCheckCircle, FaWhatsapp } from 'react-icons/fa';
import OptimizedImage from "../components/OptimizedImage";
import Breadcrumbs from "../components/Breadcrumbs";
import { useTargetWidth } from "../lib/useResponsiveImage";
import { bestVariantUrl } from "../lib/imageManifest";
import Seo from "../components/Seo";
import { SERVICE_SEO, serviceSchema } from "../lib/seoConfig";

/** Declared once, then used by both <Breadcrumbs> and <Seo>'s BreadcrumbList. */
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Podcast Shoots", path: "/services/podcast-shoots" },
];

const Podcastshoots = () => {
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
    "Audio & video podcast recording",
    "Professional studio lighting",
    "Sound editing & mastering",
    "Platform-ready content delivery",
  ];

  const deliverables = [
    {
      label: "4K video recording",
      img: "https://geniestudio.in/uploads/1786531742_1786531741887-833036636.webp",
      alt: "Multi-camera 4K podcast video recording at the GenieStudio podcast studio",
    },
    {
      label: "Professional audio mix",
      img: "https://geniestudio.in/uploads/1786531738_1786531737915-76485310.webp",
      alt: "Podcast audio being mixed and mastered after a studio recording session",
    },
    {
      label: "Podcast artwork design",
      img: "https://geniestudio.in/uploads/1786531741_1786531740123-858872067.webp",
      alt: "Podcast cover artwork designed for a GenieStudio client episode",
    },
    {
      label: "Multiple format exports",
      img: "https://geniestudio.in/uploads/1786531739_1786531738826-206533018.webp",
      alt: "Podcast episode exported in multiple formats for different platforms",
    },
  ];

  /**
   * The podcast shoot, start to finish. Written from what the studio actually
   * does — no invented equipment lists, turnaround guarantees or pricing.
   */
  const process = [
    {
      step: "Consultation",
      body: "We start with a free consultation to understand your show — the format, how many people are on mic, how often you plan to publish, and where the episodes are going.",
    },
    {
      step: "Studio setup",
      body: "We set the studio for your format, whether that is a solo show, a two-person interview or a full panel. Lighting, cameras and microphones are configured before you arrive.",
    },
    {
      step: "Recording",
      body: "We record audio and video together, so you leave with a video podcast as well as an audio episode rather than having to choose between them.",
    },
    {
      step: "Editing & mastering",
      body: "Sound editing and mastering, colour on the video, and podcast artwork where you need it.",
    },
    {
      step: "Delivery",
      body: "You receive platform-ready files exported in the formats your podcast host and social channels need.",
    },
  ];

  /**
   * FAQ answers are rendered visibly AND emitted as FAQPage structured data.
   * Google requires the two to match, and every answer here is grounded in a
   * service the studio genuinely offers.
   */
  const faqs = [
    {
      q: "Where is your podcast studio in Vizag located?",
      a: "Our studio is at 5A-2, KP Icon, Yendada, Visakhapatnam, Andhra Pradesh 530045. Get in touch through the contact page to arrange a visit or a session.",
    },
    {
      q: "Can you record a video podcast, not just audio?",
      a: "Yes. We record audio and video in the same session, so you get a 4K video podcast alongside the audio episode. Video podcasts are what most creators use for YouTube and for short clips on social platforms.",
    },
    {
      q: "What does a podcast shoot include?",
      a: "A shoot covers audio and video recording, professional studio lighting, sound editing and mastering, and delivery in platform-ready formats. Podcast artwork design is available where you need it.",
    },
    {
      q: "Do you record interviews and panel discussions?",
      a: "Yes. We handle solo shows, two-person interviews and panel discussions. Tell us the format during the consultation and we set the studio up for it.",
    },
    {
      q: "Who are podcast shoots for?",
      a: "Creators launching or running a show, and businesses using podcasts for brand and content marketing. The production process is the same for both.",
    },
    {
      q: "How do I book a podcast shoot in Visakhapatnam?",
      a: "Reach out through our contact page for a free consultation and a custom quote based on your format and episode count.",
    },
  ];

  return (
    <main className="w-full overflow-x-hidden bg-white">
      <Seo
        {...SERVICE_SEO.podcast}
        schema={[
          // serviceType is what tells Google this is a podcast studio rather
          // than generic photography.
          serviceSchema({
            name: "Podcast Studio & Podcast Production",
            description: SERVICE_SEO.podcast.description,
            path: SERVICE_SEO.podcast.path,
            serviceType: "Podcast Studio",
          }),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
        breadcrumbs={CRUMBS}
      />


      <section className="relative min-h-[75vh] flex items-end overflow-hidden" style={{ background: '#1F1A18' }}>
        <div
          ref={heroRef}
          className="absolute inset-0 w-full h-[110%] -top-[5%]"
          style={{
            backgroundImage: `url('${bestVariantUrl("https://geniestudio.in/uploads/1786531745_1786531742798-721756481.webp", targetWidth)}')`,
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
              'linear-gradient(to top, rgba(31,26,24,0.85) 25%, rgba(31,26,24,0.45) 55%, transparent 100%)',
          }}
        />


        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 pb-12 sm:pb-16">
          <Breadcrumbs items={CRUMBS} className="mb-5 text-white/70" />

          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-5 text-sm font-semibold tracking-widest uppercase" style={{ background: '#E8600A22', color: '#E8600A', border: '1px solid #E8600A44' }}>
            <FaPodcast /> Podcast Studio in Visakhapatnam
          </div>
          {/* Same two-line display treatment as before, so the hero looks
              unchanged — but the H1 now states what the page is actually for
              instead of just naming the service. */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-none mb-4 tracking-tight">
            Podcast Studio<br />in Vizag
          </h1>
          <p className="text-xl sm:text-2xl font-light italic mb-6" style={{ color: '#E8600A' }}>
            Sound great. Look even better.
          </p>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mb-6 leading-relaxed">
            Professional podcast shoots, video recording and full podcast
            production at GenieStudio in Yendada, Visakhapatnam.
          </p>
          <div className="inline-block px-5 py-2 rounded-full text-sm font-bold text-white" style={{ background: '#E8600A' }}>
            Starting from
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="w-12 h-1 rounded-full mb-6" style={{ background: '#E8600A' }} />
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight">What's Included</h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Produce professional-quality podcast episodes with our complete production service. From recording in our state-of-the-art studio to final editing and delivery, we handle every aspect of your podcast production. Whether it's a solo show, interview format, or panel discussion — we make it look and sound world-class.
            </p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 shadow-lg" style={{ background: '#E8600A' }}>
              <FaWhatsapp className="text-lg" /> Book a Podcast Shoot
            </Link>
          </div>
          <div className="rounded-2xl p-8 sm:p-10" style={{ background: '#FFF0E8' }}>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Service Highlights</h3>
            <ul className="space-y-4">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700 text-base">
                  <FaCheckCircle className="mt-0.5 flex-shrink-0 text-lg" style={{ color: '#E8600A' }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20" style={{ background: '#FFF0E8' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-12">
            <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ background: '#E8600A' }} />
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
                    alt={item.alt}
                    className="w-full h-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    imgClassName="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Card Footer */}
                <div className="p-4 sm:p-5 flex items-center gap-3">
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs"
                    style={{ background: '#E8600A' }}
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

      {/* ── Local relevance + process. Same visual system as the sections
             above: max-w-6xl, the orange rule, alternating white / #FFF0E8. ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="w-12 h-1 rounded-full mb-6" style={{ background: '#E8600A' }} />
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight">
            Professional Podcast Studio in Visakhapatnam
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <p className="text-slate-600 text-lg leading-relaxed">
              GenieStudio is a creative studio in Yendada, Visakhapatnam. Our podcast
              studio is set up so you can record audio and video in the same session
              — you leave with a video podcast for YouTube and social clips as well
              as the audio episode, rather than having to pick one.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed">
              We work with creators launching a show and with businesses using
              podcasts as part of their content and brand marketing. Whether it is a
              solo episode, a two-person interview or a panel, we configure the
              lighting, cameras and microphones for your format before you arrive.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24" style={{ background: '#FFF0E8' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-12">
            <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ background: '#E8600A' }} />
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Our Podcast Shooting Process
            </h2>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {process.map((item, i) => (
              <li
                key={item.step}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs mb-4"
                  style={{ background: '#E8600A' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.step}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-12">
            <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ background: '#E8600A' }} />
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          {/* Rendered visibly and emitted as FAQPage structured data above.
              Google requires the two to match — invisible FAQ schema is a
              structured-data violation, not a shortcut. <details> gives the
              accordion keyboard support and open-by-default crawlability. */}
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-slate-200 px-5 py-4 open:shadow-sm transition-all"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold text-slate-900">
                  <h3 className="text-base sm:text-lg">{faq.q}</h3>
                  <span
                    className="flex-shrink-0 text-xl leading-none transition-transform group-open:rotate-45"
                    style={{ color: '#E8600A' }}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="text-slate-600 leading-relaxed mt-3 text-sm sm:text-base">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Related services. Gives the podcast page outbound internal links
             with descriptive anchor text, and passes authority sideways. ── */}
      <section className="py-16 md:py-20" style={{ background: '#FFF0E8' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="w-12 h-1 rounded-full mb-6" style={{ background: '#E8600A' }} />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">
            Related Services at GenieStudio
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { to: "/services/professional-shoots", label: "Professional photography in Vizag" },
              { to: "/services/corporate-shoots", label: "Corporate photography & team portraits" },
              { to: "/services/product-shoots", label: "Product photography for e-commerce" },
              { to: "/services/event-shoots", label: "Event photography in Visakhapatnam" },
              { to: "/portfolio", label: "See our recent work" },
              { to: "/blogs", label: "Read our photography & video guides" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-5 py-2.5 rounded-full bg-white text-slate-700 text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 text-white text-center" style={{ background: '#1F1A18' }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <FaPodcast className="text-5xl mx-auto mb-5 opacity-80" style={{ color: '#E8600A' }} />
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Book a <span style={{ color: '#E8600A' }}>Podcast Shoot in Vizag</span>
          </h2>
          <p className="text-white/60 text-lg mb-8">Let's create something remarkable together. Reach out for a free consultation and custom quote.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="px-8 py-3.5 rounded-xl font-bold text-base hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg text-white" style={{ background: '#E8600A' }}>
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

export default Podcastshoots;