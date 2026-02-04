import React from 'react'
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FaRing, FaBuilding, FaMountain, FaBox, FaUser, FaVideo, FaMicrophone, FaTshirt, FaUtensils, FaBolt, FaStar, FaDollarSign, FaTimes, FaCheck, FaArrowRight } from 'react-icons/fa';
import {
  FaCalendarCheck,
  FaBoxOpen,
  FaPodcast,
  FaUserTie,
  FaBriefcase
} from "react-icons/fa";

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();

  const services = [
    {
      id: 1,
      title: "Corporate Shoots",
      description:
        "Strategic corporate photography crafted to strengthen brand presence, leadership identity, and workplace culture for businesses and enterprises.",
      image:
        "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800",
      features: [
        "Corporate office & workspace coverage",
        "Leadership & executive portraits",
        "Team & culture storytelling",
        "Website, LinkedIn & branding-ready visuals"
      ],
      Icon: FaBuilding
    },
    {
      id: 2,
      title: "Event Shoots",
      description:
        "Professional photo and video coverage for corporate events, conferences, product launches, and brand activations.",
      image:
        "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800",
      features: [
        "Full event documentation",
        "Candid & stage highlights",
        "Speaker & audience moments",
        "Fast delivery for marketing use"
      ],
      Icon: FaCalendarCheck
    },
    {
      id: 3,
      title: "Product Shoots",
      description:
        "High-impact product photography designed to increase engagement, trust, and conversions across digital platforms.",
      image:
        "https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg?auto=compress&cs=tinysrgb&w=800",
      features: [
        "Studio & lifestyle product shots",
        "Detail & angle-focused photography",
        "E-commerce & ad-ready formats",
        "Consistent brand styling"
      ],
      Icon: FaBoxOpen
    },
    {
      id: 4,
      title: "Podcast Shoots",
      description:
        "End-to-end podcast production with professional audio, video, lighting, and post-production support.",
      image:
        "https://res.cloudinary.com/dcnwphnzn/image/upload/f_auto,q_auto,w_800/v1766472603/StudioNightView-min_qhb4dq.jpg",
      features: [
        "Audio & video podcast recording",
        "Professional studio lighting",
        "Sound editing & mastering",
        "Platform-ready content delivery"
      ],
      Icon: FaPodcast
    },
    {
      id: 5,
      title: "Professional Shoots",
      description:
        "Premium portrait photography for professionals, founders, creators, and executives to elevate personal branding.",
      image:
        "https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=800",
      features: [
        "Personal branding portraits",
        "Studio or on-location shoots",
        "Professional retouching",
        "Print & digital-ready images"
      ],
      Icon: FaUserTie
    },
    {
      id: 6,
      title: "Business Portfolio Shoots",
      description:
        "Complete visual storytelling solutions for brands, startups, and businesses to showcase their work, people, and vision.",
      image:
        "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800",
      features: [
        "Brand & business storytelling",
        "Website & pitch-deck visuals",
        "Consistent visual identity",
        "Custom creative direction"
      ],
      Icon: FaBriefcase
    }
  ];


  return (
    <main className="w-full overflow-x-hidden">

      <section className="relative min-h-[50vh] md:min-h-[60vh] lg:min-h-[55vh] xl:min-h-[50vh] text-white overflow-hidden flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        />

        <div className="absolute inset-0 bg-black/60"></div>

        <div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          data-aos="fade-up"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Our Services          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Professional photography and videography services tailored for brands, businesses, and professionals—capturing visuals that truly matter.         </p>
        </div>
      </section>

      {selectedService && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto"
          onClick={() => setSelectedService(null)}
        >
          <button
            onClick={() => setSelectedService(null)}
            className="fixed top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white hover:text-slate-300 transition-colors z-10 bg-slate-800/50 hover:bg-slate-800 rounded-full p-2 sm:p-2.5"
            aria-label="Close modal"
          >
            <FaTimes className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div
            className=" max-w-4xl w-full bg-[#6B4A2D] rounded-xl sm:rounded-2xl overflow-hidden my-auto max-h-[80vh] sm:max-h-none flex flex-col"
            onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">

              <img
                src={selectedService.image}
                alt={selectedService.title}
                className=" w-full h-40 sm:h-56 md:h-full object-cover "
                loading="lazy"
                decoding="async" />

              <div
                className=" p-4 sm:p-7 md:p-9 bg-white text-slate-900 overflow-y-auto max-h-[55vh] sm:max-h-none flex flex-col" >
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#6B4A2D]/10 flex items-center justify-center mb-3 sm:mb-4">
                  <selectedService.Icon className="text-lg sm:text-3xl text-[#6B4A2D]" />
                </div>

                <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                  {selectedService.title}
                </h3>

                <p className="text-sm sm:text-base text-slate-600 mb-4 leading-relaxed">
                  {selectedService.description}
                </p>

                <div className="space-y-2 sm:space-y-3 mb-5">
                  <h4 className="font-semibold text-sm sm:text-lg text-slate-800">
                    What’s Included
                  </h4>

                  {selectedService.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <FaCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                      </div>
                      <span className="text-sm sm:text-base text-slate-700">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate("/contact")}
                  className=" mt-auto w-full flex items-center justify-center gap-2 py-3 text-sm sm:text-base font-semibold text-[#6B4A2D] border border-[#6B4A2D]/40 rounded-lg hover:bg-[#6B4A2D]/5 transition-all active:scale-[0.98]">
                  <span>Book This Service</span>
                  <FaArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-[#F7F6F3]">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8 lg:gap-10">

            {services.map((service, index) => (
              <div
                key={service.id}
                onClick={() => setSelectedService(service)}
                data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                data-aos-delay={index * 100}
                data-aos-anchor-placement="top-bottom"
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
              >
                <div className="relative overflow-hidden aspect-[4/5] sm:aspect-[3/4]">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="eager"
                    fetchpriority="high"
                  />

                  <div className=" absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/50 to-transparent opacity-100 transition-opacity duration-500">
                    <div className=" absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white transition-all duration-500">
                      <service.Icon className="text-2xl sm:text-3xl mb-2 sm:mb-3" />

                      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1.5 sm:mb-2">
                        {service.title}
                      </h3>

                      <p className=" hidden sm:block sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 text-sm sm:text-base md:text-lg text-slate-200 mb-3 sm:mb-4 line-clamp-2">
                        {service.description}
                      </p>



                      <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium">
                        <span>View Details</span>
                        <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
            <div className="text-center p-4 sm:p-0" data-aos="fade-right">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#6B4A2D] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
                <FaBolt className=" text-[20px] sm:text-[24px] md:text-[30px] text-white" />              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-slate-900">Fast Delivery</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Quick turnaround times without compromising on quality</p>
            </div>
            <div className="text-center p-4 sm:p-0" data-aos="fade-up">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#6B4A2D] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
                <FaStar className=" text-[20px] sm:text-[24px] md:text-[30px] text-white" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-slate-900">Premium Quality</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Professional-grade equipment and expert editing</p>
            </div>
            <div className="text-center p-4 sm:p-0" data-aos="fade-left">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#6B4A2D] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
                <FaDollarSign className=" text-[20px] sm:text-[24px] md:text-[30px] text-white" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-slate-900">Best Value</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Competitive pricing with flexible packages</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 md:py-16 bg-slate-90">
        <div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          data-aos="zoom-in"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-slate-900 tracking-tight">
            Ready to Get Started?
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-6 sm:mb-7 px-2 sm:px-4 leading-relaxed">
            Contact us today to discuss your project and receive a customized quote
            tailored to your specific needs
          </p>

          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base font-medium bg-[#6B4A2D] rounded-xl hover:bg-slate-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-white" >
            Get a Free Quote
          </a>
        </div>
      </section>


    </main>
  );
};

export default Services;
