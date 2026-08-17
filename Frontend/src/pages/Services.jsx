import React from 'react'
import { Link } from "react-router-dom";
import {
  FaBuilding,
  FaCalendarCheck,
  FaBoxOpen,
  FaPodcast,
  FaUserTie,
  FaBriefcase,
  FaBolt,
  FaStar,
  FaDollarSign,
  FaArrowRight
} from 'react-icons/fa';
import OptimizedImage from "../components/OptimizedImage";
import Breadcrumbs from "../components/Breadcrumbs";
import { useTargetWidth } from "../lib/useResponsiveImage";
import { bestVariantUrl } from "../lib/imageManifest";
import Seo from "../components/Seo";
import { SEO } from "../lib/seoConfig";

const Services = () => {
  // Hero paints via CSS background-image, which cannot carry a srcSet.
  const targetWidth = useTargetWidth();

  const services = [
    {
      title: "Podcast Shoots",
      description: "End-to-end podcast production with professional audio, video, lighting, and post-production support.",
      image: "https://geniestudio.in/uploads/1786530713_1786530711207-616205262.jpg",
      Icon: FaPodcast,
      route: "/services/podcast-shoots",
    },
    {
      title: "Product Shoots",
      description: "High-impact product photography designed to increase engagement, trust, and conversions across digital platforms.",
      image: "https://geniestudio.in/uploads/1786601780_1786601778626-797870812.png",
      Icon: FaBoxOpen,
      route: "/services/product-shoots",
    },
    {
      title: "Corporate Shoots",
      description: "Strategic corporate photography crafted to strengthen brand presence, leadership identity, and workplace culture.",
      image: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800",
      Icon: FaBuilding,
      route: "/services/corporate-shoots",
    },
    {
      title: "Event Shoots",
      description: "Professional photo and video coverage for corporate events, conferences, product launches, and brand activations.",
      image: "https://geniestudio.in/uploads/1786601438_1786601436150-15515106.png",
      Icon: FaCalendarCheck,
      route: "/services/event-shoots",
    },
    {
      title: "Professional Shoots",
      description: "Premium portrait photography for professionals, founders, creators, and executives to elevate personal branding.",
      image: "https://geniestudio.in/uploads/1786520942_1786520939441-392375551.webp",
      Icon: FaUserTie,
      route: "/services/professional-shoots",
    },
    {
      title: "Business Portfolio Shoots",
      description: "Complete visual storytelling solutions for brands, startups, and businesses to showcase their work, people, and vision.",
      image: "https://geniestudio.in/uploads/1786519476_1786519476246-824255335.jpg",
      Icon: FaBriefcase,
      route: "/services/business-portfolio-shoots",
    },
  ];

  return (
    <main className="w-full overflow-x-hidden bg-white">
      <Seo
        {...SEO.services}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: SEO.services.path },
        ]}
      />



      <section className="relative min-h-[50vh] md:min-h-[60vh] lg:min-h-[55vh] xl:min-h-[50vh] text-white overflow-hidden flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${bestVariantUrl(
              "https://geniestudio.in/uploads/1786602495_1786602495498-147900462.jpg",
              targetWidth
            )}')`,
          }}
        />

        <div className="absolute inset-0 bg-black/60"></div>

        <div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          data-aos="fade-up"
        >
          <Breadcrumbs
            items={[{ name: "Home", path: "/" }, { name: "Services", path: "/services" }]}
            className="mb-5 text-white/70 justify-center [&>ol]:justify-center"
          />

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Our Services
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Professional photography and videography services tailored for brands, businesses, and professionals - capturing visuals that truly matter.
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-[#F7F6F3]">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8 lg:gap-10">
            {services.map((service, index) => (
              <Link
                key={service.title}
                to={service.route}
                /* No aria-label: the card already reads out as
                   "Podcast Shoots … View Podcast Shoots", which is a better
                   name than anything added here — and the old label
                   ("… — view details") did not contain the visible text, so
                   voice-control users could not say what they could see. */
                data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                data-aos-delay={index * 100}
                data-aos-anchor-placement="top-bottom"
                className="group relative block overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="relative overflow-hidden aspect-[4/5] sm:aspect-[3/4]">
                  <OptimizedImage
                    src={service.image}
                    alt={service.alt || `${service.title} by GenieStudio in Visakhapatnam`}
                    className="w-full h-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    imgClassName="group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/50 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
                      <service.Icon className="text-2xl sm:text-3xl mb-2 sm:mb-3" />
                      {/* h2: the only heading above these cards is the page
                          h1, so h3 skipped a level. Sizing is set by the
                          classes, so nothing moves. */}
                      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1.5 sm:mb-2">
                        {service.title}
                      </h2>
                      <p className="hidden sm:block sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 text-sm sm:text-base md:text-lg text-slate-200 mb-3 sm:mb-4 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="inline-flex items-center gap-1 text-[10px] sm:text-sm font-medium">
                        {/* "View Details" says nothing to a crawler about
                            where it leads; the service name does. */}
                        <span>View {service.title}</span>
                        <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 md:mb-16 text-slate-900">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {[
              { Icon: FaBolt, title: "Fast Delivery", desc: "Quick turnaround times without compromising on quality", aos: "fade-right" },
              { Icon: FaStar, title: "Premium Quality", desc: "Professional-grade equipment and expert editing", aos: "fade-up" },
              { Icon: FaDollarSign, title: "Best Value", desc: "Competitive pricing with flexible packages", aos: "fade-left" },
            ].map(({ Icon, title, desc, aos }) => (
              <div key={title} className="text-center p-4 sm:p-0" data-aos={aos}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#6B4A2D] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
                  <Icon className="text-[20px] sm:text-[24px] md:text-[30px] text-white" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-slate-900">{title}</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-aos="zoom-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-slate-900 tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-6 sm:mb-7 px-2 sm:px-4 leading-relaxed">
            Contact us today to discuss your project and receive a customized quote tailored to your specific needs
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base font-medium bg-[#6B4A2D] rounded-xl hover:bg-[#E0D2C3] hover:text-black transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-white"
          >
            Get a Free Quote
          </a>
        </div>
      </section>
    </main>
  );
};

export default Services;