import React, { useState, useEffect } from "react";
import { Users, Camera, Globe, Award, ArrowRight, Briefcase, Calendar, Package, Mic, User, TrendingUp, CheckCircle, Star, Play, Aperture, Film, Lightbulb, Monitor } from "lucide-react";
import VideoHero from "../components/VideoHero";
import Headings from "../components/Headings"
import { useNavigate } from "react-router-dom";
const Home = () => {
  const [active, setActive] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const handleSlideChange = (index) => {
    setActiveIndex(index);
  };


  const slides = [
    {
      id: 1,
      title: "Elevate Your Brand",
      subtitle: "with Professional Photography",
      tag: "Corporate Excellence",
      description: "Transform your corporate identity with stunning visuals that speak volumes about your business.",
      buttonText: "Explore Services",
      route: "/services",
      image: "https://geniestudio.in/uploads/1786601041_1786601041120-705832864.png",
    },
    {
      id: 2,
      title: "Capture Every Moment",
      subtitle: "That Matters",
      tag: "Event Photography",
      description: "From conferences to celebrations, we immortalize the energy and emotion of your special events.",
      buttonText: "View Gallery",
      route: "/gallery",
      image: "https://geniestudio.in/uploads/1786601438_1786601436150-15515106.png",
    },
    {
      id: 3,
      title: "Showcase Your Products",
      subtitle: "in Their Best Light",
      tag: "Product Photography",
      description: "High-end product photography that drives engagement and elevates your e-commerce success.",
      buttonText: "See Portfolio",
      route: "/portfolio",
      image: "https://geniestudio.in/uploads/1786601780_1786601778626-797870812.png",
    },
  ];
  const services = [
    {
      icon: Mic,
      title: "Podcast Shoots",
      link: "/services/podcast-shoots",
      description: "Professional video...",
      features: ["Studio Setup", "Multi-Camera", "Thumbnail Creation", "Behind-the-Scenes"],
      color: "from-green-500 to-teal-500",
    },
    {
      icon: Package,
      title: "Product Shoots",
      link: "/services/product-shoots",
      description: "Stunning product photography...",
      features: ["E-commerce Photos", "Catalog Shots", "Lifestyle Products", "360° Photography"],
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Briefcase,
      title: "Corporate Shoots",
      link: "/services/corporate-shoots",
      description: "Professional headshots...",
      features: ["Executive Portraits", "Team Photography", "Office Culture", "Annual Reports"],
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Calendar,
      title: "Event Shoots",
      link: "/services/event-shoots",
      description: "Comprehensive event coverage...",
      features: ["Conferences", "Galas & Awards", "Product Launches", "Networking Events"],
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: User,
      title: "Professional Shoots",
      link: "/services/professional-shoots",
      description: "Personal branding photography...",
      features: ["Personal Branding", "LinkedIn Profiles", "Speaker Photos", "Author Headshots"],
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: TrendingUp,
      title: "Business Portfolio",
      link: "/services/business-portfolio-shoots",
      description: "Complete visual documentation...",
      features: ["Brand Story", "Process Documentation", "Testimonial Videos", "Social Media Content"],
      color: "from-pink-500 to-rose-500",
    },
  ];

  const equipment = [
    {
      icon: Camera,
      title: "Professional Cameras",
      description: "Canon EOS R5, Sony A7R IV, Nikon Z9 for stunning 45MP+ resolution",
      image: "https://geniestudio.in/uploads/1786531746_1786531746647-991825491.webp"
    },
    {
      icon: Aperture,
      title: "Premium Lenses",
      description: "Professional-grade L-series and G Master lenses for every scenario",
      image: "https://geniestudio.in/uploads/1786531747_1786531746636-336880294.webp"
    },
    {
      icon: Lightbulb,
      title: "Studio Lighting",
      description: "Profoto and Godox strobe systems with modifiers for perfect illumination",
      image: "https://geniestudio.in/uploads/1786531741_1786531740098-646092175.webp"
    },
    {
      icon: Film,
      title: "Video Equipment",
      description: "4K/8K cinema cameras, gimbals, and professional audio gear",
      image: "https://geniestudio.in/uploads/1786530714_1786530711205-339283661.jpg"
    }
  ];


  const processSteps = [
    {
      step: "01",
      title: "Discovery Call",
      description: "We understand your vision, goals, and creative requirements through detailed consultation.",
    },
    {
      step: "02",
      title: "Creative Planning",
      description: "Our team develops a comprehensive shoot plan, including concepts, timelines, and logistics.",
    },
    {
      step: "03",
      title: "Production Day",
      description: "Professional execution with state-of-the-art equipment and experienced creative team.",
    },
    {
      step: "04",
      title: "Post-Production",
      description: "Meticulous editing and retouching to deliver stunning, publication-ready visuals.",
    },
    {
      step: "05",
      title: "Final Delivery",
      description: "High-resolution files delivered in your preferred format with full usage rights.",
    },
  ];

  const whyChooseUs = [
    {
      icon: Award,
      title: "Award-Winning Team",
      description: "Industry-recognized photographers with proven expertise",
    },
    {
      icon: Camera,
      title: "Premium Equipment",
      description: "Latest professional-grade cameras and lighting setup",
    },
    {
      icon: CheckCircle,
      title: "On-Time Delivery",
      description: "Consistent track record of meeting deadlines",
    },
    {
      icon: Users,
      title: "Client-Centric",
      description: "Personalized approach tailored to your unique needs",
    },
  ];
  const portfolioItems = [
    {
      title: "Podcast Studio Production",
      category: "Podcast / Studio",
      image: "https://geniestudio.in/uploads/1786524726_1786524725461-113127996.JPG"
    },
    {
      title: "Product Photography",
      category: "Commercial / Products",
      image: "https://geniestudio.in/uploads/1786524727_1786524727071-219313124.JPG"
    },
    {
      title: "Corporate Branding Shoot",
      category: "Corporate / Branding",
      image: "https://geniestudio.in/uploads/1786533202_1786533201910-902353578.webp"
    },
    {
      title: "Corporate Event Coverage",
      category: "Events / Conferences",
      image: "https://geniestudio.in/uploads/1786522543_1786522543152-698768911.webp"
    },
    {
      title: "Professional Portraits",
      category: "Personal Branding",
      image: "https://geniestudio.in/uploads/1786520957_1786520953868-540240767.webp"
    },
    {
      title: "Business Portfolio Shoot",
      category: "Brand Storytelling",
      image: "https://geniestudio.in/uploads/1786519472_1786519472788-977568825.jpg"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative h-[70vh] sm:h-[80vh] lg:h-screen overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${active === index ? "opacity-100" : "opacity-0"
              }`}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div
                className={`w-full h-full bg-cover bg-center ${active === index ? "animate-ken-burns" : ""
                  }`}
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              </div>
            </div>

            <div className="relative h-full flex items-center justify-start">

              <div className="w-full pl-6 sm:pl-10 lg:pl-48">

                <div className="max-w-3xl">
                  <div
                    className={`transform transition-all duration-1000 delay-300 ${active === index
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                      }`}
                  >
                    <span className=" inline-block px-3 py-1.5 bg-white/10 backdrop-blur-md text-white rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-white/20">
                      {slide.tag}
                    </span>
                    <h1 className=" text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 leading-tight sm:leading-snug">
                      {slide.title}
                      <br />
                      <span className=" bg-[#ffffff] bg-clip-text text-transparent text-3xl sm:text-4xl md:text-5xl lg:text-7xl">
                        {slide.subtitle}
                      </span>
                    </h1>
                    <p className=" text-base sm:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 leading-relaxed">
                      {slide.description}
                    </p>
                    <button
                      className="group px-6 sm:px-8 py-3 sm:py-4 bg-white text-sm sm:text-base text-gray-900 rounded-full font-semibold hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white transition-all duration-300 flex items-center gap-2 sm:gap-3 shadow-xl hover:shadow-2xl hover:scale-105"
                      onClick={() => navigate(slides[active].route)}
                    >
                      {slides[activeIndex].buttonText}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActive(index)}
              className={`h-1 rounded-full transition-all duration-300 ${active === index ? "w-12 bg-white" : "w-8 bg-white/50"
                }`}
            />
          ))}
        </div>
      </section>
      {/* <Headings /> */}
      <section
        id="about"
        className="py-10 sm:py-14 md:py-16 lg:py-20 bg-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            <div className="space-y-5 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                <span className="text-black text-xs font-bold uppercase tracking-widest">
                  Genie Studio
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl md:text-5xl xl:text-6xl font-black text-gray-900 leading-tight">
                CREATING STORIES FOR
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#6B4A2D] to-orange-600">
                  MODERN BRANDS
                </span>
              </h3>


              <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
                Genie Studio is a full-service creative studio
                <br className="block md:hidden" />specializing in Corporate Shoots, Event Coverage
                <br className="block md:hidden" />, Product, Photography, Podcast Production,
                <br className="block md:hidden" />Professional Portraits, and Business
                <br className="block md:hidden" /> Portfolio Shoots. We help brands,
                professionals,
                <br className="block md:hidden" /> and businesses visually communicate
                <br className="block md:hidden" /> their story with creativity, clarity,
                and impact.
              </p>

              <button onClick={() => navigate("/about")} className="inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-[#6B4A2D] to-[#8B5E3C] text-white rounded-full font-semibold sm:font-bold hover:scale-105 hover:shadow-xl transition-all duration-300 ">
                Learn More
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor" >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

            </div>

            <div className="order-1 lg:order-2">
              <div className="overflow-hidden rounded-2xl shadow-2xl">
                <div className="carousel-track flex gap-5">

                  <div className="carousel-item flex-shrink-0 w-[300px] sm:w-[340px] h-[280px] sm:h-[320px] relative rounded-2xl overflow-hidden cursor-pointer group">
                    <img
                      src="https://geniestudio.in/uploads/1786524726_1786524725461-113127996.JPG"
                      alt="Podcast Production"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end pointer-events-none">
                      <span className="bg-orange-500 text-white text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full w-fit mb-2">
                        Podcast
                      </span>
                      <h3 className="text-white text-lg font-extrabold uppercase leading-tight">
                        Podcast Production
                      </h3>
                    </div>
                  </div>
                  <div className="carousel-item flex-shrink-0 w-[300px] sm:w-[340px] h-[280px] sm:h-[320px] relative rounded-2xl overflow-hidden cursor-pointer group">
                    <img
                      src="https://geniestudio.in/uploads/1786519473_1786519471789-580284373.jpg"
                      alt="Product Shoots"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end pointer-events-none">
                      <span className="bg-orange-500 text-white text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full w-fit mb-2">
                        Product
                      </span>
                      <h3 className="text-white text-lg font-extrabold uppercase leading-tight">
                        Product Shoots
                      </h3>
                    </div>
                  </div>
                  <div className="carousel-item flex-shrink-0 w-[300px] sm:w-[340px] h-[280px] sm:h-[320px] relative rounded-2xl overflow-hidden cursor-pointer group">
                    <img
                      src="https://geniestudio.in/uploads/1786520942_1786520939441-392375551.webp"
                      alt="Corporate Shoots"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end pointer-events-none">
                      <span className="bg-orange-500 text-white text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full w-fit mb-2">
                        Corporate
                      </span>
                      <h3 className="text-white text-lg font-extrabold uppercase leading-tight">
                        Corporate Shoots
                      </h3>
                    </div>
                  </div>

                  <div className="carousel-item flex-shrink-0 w-[300px] sm:w-[340px] h-[280px] sm:h-[320px] relative rounded-2xl overflow-hidden cursor-pointer group">
                    <img
                      src="https://geniestudio.in/uploads/1786522543_1786522542765-76055353.webp"
                      alt="Event Photography"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end pointer-events-none">
                      <span className="bg-orange-500 text-white text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full w-fit mb-2">
                        Events
                      </span>
                      <h3 className="text-white text-lg font-extrabold uppercase leading-tight">
                        Event Photography
                      </h3>
                    </div>
                  </div>

                  <div className="carousel-item flex-shrink-0 w-[300px] sm:w-[340px] h-[280px] sm:h-[320px] relative rounded-2xl overflow-hidden cursor-pointer group">
                    <img
                      src="https://geniestudio.in/uploads/1786520942_1786520939442-30465918.webp"
                      alt="Professional Shoots"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end pointer-events-none">
                      <span className="bg-orange-500 text-white text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full w-fit mb-2">
                        Professional
                      </span>
                      <h3 className="text-white text-lg font-extrabold uppercase leading-tight">
                        Professional Shoots
                      </h3>
                    </div>
                  </div>

                  <div className="carousel-item flex-shrink-0 w-[300px] sm:w-[340px] h-[280px] sm:h-[320px] relative rounded-2xl overflow-hidden cursor-pointer group">
                    <img
                      src="https://geniestudio.in/uploads/1786533204_1786533201915-325514601.webp"
                      alt="Business Portfolio"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end pointer-events-none">
                      <span className="bg-orange-500 text-white text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full w-fit mb-2">
                        Portfolio
                      </span>
                      <h3 className="text-white text-lg font-extrabold uppercase leading-tight">
                        Business Portfolio
                      </h3>
                    </div>
                  </div>

                  <div className="carousel-item flex-shrink-0 w-[300px] sm:w-[340px] h-[280px] sm:h-[320px] relative rounded-2xl overflow-hidden cursor-pointer group">
                    <img
                      src="https://geniestudio.in/uploads/1786519473_1786519473117-884148224.jpg"
                      alt="Corporate Shoots"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end pointer-events-none">
                      <span className="bg-orange-500 text-white text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full w-fit mb-2">
                        Corporate
                      </span>
                      <h3 className="text-white text-lg font-extrabold uppercase leading-tight">
                        Corporate Shoots
                      </h3>
                    </div>
                  </div>

                  <div className="carousel-item flex-shrink-0 w-[300px] sm:w-[340px] h-[280px] sm:h-[320px] relative rounded-2xl overflow-hidden cursor-pointer group">
                    <img
                      src="https://geniestudio.in/uploads/1786522545_1786522545182-756687474.webp"
                      alt="Event Photography"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end pointer-events-none">
                      <span className="bg-orange-500 text-white text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full w-fit mb-2">
                        Events
                      </span>
                      <h3 className="text-white text-lg font-extrabold uppercase leading-tight">
                        Event Photography
                      </h3>
                    </div>
                  </div>

                  <div className="carousel-item flex-shrink-0 w-[300px] sm:w-[340px] h-[280px] sm:h-[320px] relative rounded-2xl overflow-hidden cursor-pointer group">
                    <img
                      src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
                      alt="Product Shoots"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end pointer-events-none">
                      <span className="bg-orange-500 text-white text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full w-fit mb-2">
                        Product
                      </span>
                      <h3 className="text-white text-lg font-extrabold uppercase leading-tight">
                        Product Shoots
                      </h3>
                    </div>
                  </div>

                  <div className="carousel-item flex-shrink-0 w-[300px] sm:w-[340px] h-[280px] sm:h-[320px] relative rounded-2xl overflow-hidden cursor-pointer group">
                    <img
                      src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80"
                      alt="Podcast Production"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end pointer-events-none">
                      <span className="bg-orange-500 text-white text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full w-fit mb-2">
                        Podcast
                      </span>
                      <h3 className="text-white text-lg font-extrabold uppercase leading-tight">
                        Podcast Production
                      </h3>
                    </div>
                  </div>

                  <div className="carousel-item flex-shrink-0 w-[300px] sm:w-[340px] h-[280px] sm:h-[320px] relative rounded-2xl overflow-hidden cursor-pointer group">
                    <img
                      src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80"
                      alt="Professional Shoots"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end pointer-events-none">
                      <span className="bg-orange-500 text-white text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full w-fit mb-2">
                        Professional
                      </span>
                      <h3 className="text-white text-lg font-extrabold uppercase leading-tight">
                        Professional Shoots
                      </h3>
                    </div>
                  </div>

                  <div className="carousel-item flex-shrink-0 w-[300px] sm:w-[340px] h-[280px] sm:h-[320px] relative rounded-2xl overflow-hidden cursor-pointer group">
                    <img
                      src="https://images.unsplash.com/photo-1664575602276-acd073f104c1?w=800&q=80"
                      alt="Business Portfolio"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end pointer-events-none">
                      <span className="bg-orange-500 text-white text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full w-fit mb-2">
                        Portfolio
                      </span>
                      <h3 className="text-white text-lg font-extrabold uppercase leading-tight">
                        Business Portfolio
                      </h3>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>

        <style>{`
    @keyframes scroll-carousel {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(calc(-50%));
      }
    }

    .carousel-track {
      animation: scroll-carousel 24s linear infinite;
      width: max-content;
    }

    .carousel-track:hover {
      animation-play-state: paused;
    }

    @media (prefers-reduced-motion: reduce) {
      .carousel-track {
        animation-duration: 60s;
      }
    }
  `}</style>
      </section>



      <VideoHero />

      <section className="py-12 sm:py-6 md:py-20 lg:py-12 bg-[#F7F6F3]" data-animate id="services">
        <div className="page-container">

          <div className="text-left sm:text-center mb-10 sm:mb-16">
            <span className="font-semibold text-sm uppercase tracking-wider">
              Our Services
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-4 mb-6">
              Comprehensive Photography Solutions
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              From corporate headshots to large-scale events, we offer a full spectrum of
              professional photography services tailored to your needs.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-stretch">
            {services.map((service, i) => {
              const Icon = service.icon;

              const colorSchemes = [
                {
                  hoverBg: 'group-hover:from-purple-500 group-hover:via-purple-400 group-hover:to-pink-400',
                  icon: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
                  circle: 'bg-purple-400',
                  text: 'text-purple-600',
                  overlay: 'group-hover:bg-purple-500/90'
                },
                {
                  hoverBg: 'group-hover:from-blue-500 group-hover:via-blue-400 group-hover:to-cyan-300',
                  icon: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
                  circle: 'bg-blue-400',
                  text: 'text-blue-600',
                  overlay: 'group-hover:bg-blue-500/90'
                },
                {
                  hoverBg: 'group-hover:from-green-500 group-hover:via-green-400 group-hover:to-emerald-300',
                  icon: 'bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white',
                  circle: 'bg-green-400',
                  text: 'text-green-600',
                  overlay: 'group-hover:bg-green-500/90'
                },
                {
                  hoverBg: 'group-hover:from-blue-600 group-hover:via-blue-500 group-hover:to-blue-400',
                  icon: 'bg-blue-100 text-blue-700 group-hover:bg-blue-700 group-hover:text-white',
                  circle: 'bg-blue-500',
                  text: 'text-blue-700',
                  overlay: 'group-hover:bg-blue-600/90'
                },
                {
                  hoverBg: 'group-hover:from-orange-600 group-hover:via-orange-500 group-hover:to-amber-400',
                  icon: 'bg-orange-100 text-orange-600 group-hover:bg-orange-700 group-hover:text-white',
                  circle: 'bg-orange-500',
                  text: 'text-orange-600',
                  overlay: 'group-hover:bg-orange-600/90'
                }
              ];

              const scheme = colorSchemes[i % colorSchemes.length];

              return (
                <div key={i} className={` group relative overflow-hidden bg-white bg-gradient-to-br ${scheme.hoverBg} rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md sm:shadow-lg lg:hover:shadow-2xl transition-all duration-500
               lg:hover:-translate-y-2 border border-gray-100 h-full flex flex-col`} data-animate id={`service-${i}`}>
                  <div className={` absolute inset-0 bg-white ${scheme.overlay} transition-all duration-500 rounded-xl sm:rounded-2xl `} />
                  <div className={`  absolute -right-16 -top-16 sm:-right-20 sm:-top-20  w-32 h-32 sm:w-40 sm:h-40 ${scheme.circle}  rounded-full  opacity-0 group-hover:opacity-30 transition-opacity duration-500 z-[1] `} />

                  <div className={` absolute -right-20 -bottom-20 sm:-right-24 sm:-bottom-24 w-40 h-40 sm:w-48 sm:h-48 ${scheme.circle} rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-[1] `} />

                  <div className={` relative z-10 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl ${scheme.icon} flex items-center justify-center  mb-4 sm:mb-5 lg:mb-6 lg:group-hover:scale-110 transition-all duration-300 `}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                  </div>

                  <h3 className="relative z-10 text-base sm:text-lg lg:text-2xl font-bold text-gray-800 group-hover:text-white mb-2 sm:mb-3 lg:mb-4 transition-colors duration-300">
                    {service.title}
                  </h3>

                  <p className="relative z-10 text-xs sm:text-sm lg:text-base text-gray-600 group-hover:text-white mb-4 sm:mb-6 leading-snug sm:leading-relaxed transition-colors duration-300">
                    {service.description}
                  </p>

                  <ul className="relative z-10 space-y-1.5 sm:space-y-2.5 mb-auto hidden sm:block">
                    {service.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 group-hover:text-white transition-colors duration-300"
                      >
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 group-hover:text-white flex-shrink-0 transition-colors duration-300" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>


                  <button
                    className={` relative z-10 mt-auto sm:mt-6 flex text-xs sm:text-sm ${scheme.text} group-hover:text-white font-semibold items-center gap-1.5 sm:gap-2 lg:group-hover:gap-3 transition-all duration-300 `}
                    onClick={() => navigate(service.link)}
                  >
                    Explore more
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="py-8 sm:py-20 text-center px-4 relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            We are a professional photography{" "}
            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">
              house
            </span>
          </h2>

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 w-full ">
          {[
            "https://geniestudio.in/uploads/1786522543_1786522542888-63592060.webp",
            "https://geniestudio.in/uploads/1786520942_1786520939456-72574430.webp",
            "https://geniestudio.in/uploads/1786530714_1786530711205-339283661.jpg",
            "https://geniestudio.in/uploads/1786519472_1786519472788-977568825.jpg",
            "https://geniestudio.in/uploads/1786522544_1786522544183-789140313.webp",
            "https://geniestudio.in/uploads/1786522551_1786522551131-390094297.webp",
          ].map((src, i) => (
            <div key={i} className="aspect-square w-full overflow-hidden group relative" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} >
              <img src={src} alt={`photo-${i}`}
                className={`w-full h-full object-cover transition-all duration-700 ${hoveredIndex === i ? 'scale-110 brightness-75' : 'scale-100 brightness-100'}`}
                loading="lazy"
                decoding="async" />
              <div className={`absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent transition-opacity duration-500 ${hoveredIndex === i ? 'opacity-100' : 'opacity-0'
                }`}></div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-8 sm:py-24 bg-white" data-animate id="equipment">
        <div className="page-container">

          {/* HEADER */}
          <div className="text-left sm:text-center mb-12 sm:mb-16">
            <span className="text-[#6B4A2D] font-semibold text-sm uppercase tracking-wider">
              Our Equipment
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-4 mb-5">
              State of the Art Technology
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              We invest in the finest professional equipment to ensure every shot is perfect
            </p>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {equipment.map((item, i) => {
              const Icon = item.icon;

              return (
                <div key={i} className=" group relative overflow-hidden rounded-2xl  bg-white  shadow-lg hover:shadow-2xl transition-all duration-500" data-animate id={`equipment-${i}`} >
                  <div className="aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] overflow-hidden">
                    <img src={item.image} alt={item.title} className=" w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 " />
                  </div>

                  <div className=" absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-6 " >
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white/90 mb-2 sm:mb-3" />

                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1">
                      {item.title}
                    </h3>

                    <p className=" text-xs sm:text-sm text-gray-100 opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-24 transition-all duration-300 leading-relaxed " >
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      <section className="py-12 sm:py-16 lg:py-24 bg-[#F7F6F3]" data-animate id="why-choose">
        <div className="page-container">

          <div className="text-left sm:text-center mb-8 sm:mb-16">
            <span className="text-[#6B4A2D] font-semibold text-sm uppercase tracking-wider">
              Why Choose Genie Studio
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-4">
              Excellence in Every Frame
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-stretch">
            {whyChooseUs.map((item, i) => {
              const Icon = item.icon;

              const colorSchemes = [
                {
                  hoverBg: 'group-hover:from-purple-500 group-hover:via-purple-400 group-hover:to-pink-400',
                  icon: 'bg-purple-600 group-hover:bg-white group-hover:text-purple-600',
                  circle: 'bg-purple-400',
                  overlay: 'group-hover:bg-purple-500/90'
                },
                {
                  hoverBg: 'group-hover:from-blue-500 group-hover:via-blue-400 group-hover:to-cyan-300',
                  icon: 'bg-blue-600 group-hover:bg-white group-hover:text-blue-600',
                  circle: 'bg-blue-400',
                  overlay: 'group-hover:bg-blue-500/90'
                },
                {
                  hoverBg: 'group-hover:from-green-500 group-hover:via-green-400 group-hover:to-emerald-300',
                  icon: 'bg-green-600 group-hover:bg-white group-hover:text-green-600',
                  circle: 'bg-green-400',
                  overlay: 'group-hover:bg-green-500/90'
                },
                {
                  hoverBg: 'group-hover:from-orange-600 group-hover:via-orange-500 group-hover:to-amber-400',
                  icon: 'bg-orange-600 group-hover:bg-white group-hover:text-orange-600',
                  circle: 'bg-orange-500',
                  overlay: 'group-hover:bg-orange-600/90'
                }
              ];

              const scheme = colorSchemes[i % colorSchemes.length];

              return (
                <div
                  key={i}
                  className={` text-center group relative overflow-hidden p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-white bg-gradient-to-br ${scheme.hoverBg} shadow-md lg:hover:shadow-2xl transition-all duration-500 lg:hover:-translate-y-2 h-full flex flex-col `}>
                  <div className={`  absolute inset-0 bg-white ${scheme.overlay} transition-all duration-500 rounded-xl sm:rounded-2xl `} />

                  <div className={` absolute -right-12 -top-12 sm:-right-16 sm:-top-16 w-24 h-24 sm:w-32 sm:h-32 ${scheme.circle} rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 z-[1] `} />

                  <div className={` absolute -left-16 -bottom-16 sm:-left-20 sm:-bottom-20 w-32 h-32 sm:w-40 sm:h-40 ${scheme.circle} rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-[1] `} />

                  <div className={` relative z-10 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-3 sm:mb-5 lg:mb-6 rounded-full ${scheme.icon} text-white flex items-center justify-center lg:group-hover:scale-110 transition-all duration-300 `}>
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
                  </div>

                  <h3 className="relative z-10 text-base sm:text-lg lg:text-2xl font-bold text-gray-800 group-hover:text-white mb-2 sm:mb-3 lg:mb-4 transition-colors duration-300">
                    {item.title}
                  </h3>

                  <p className="relative z-10 text-xs sm:text-sm lg:text-base text-gray-600 group-hover:text-white leading-snug sm:leading-relaxed transition-colors duration-300">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      <section className="py-8 bg-white" data-animate id="process">
        <div className="page-container">

          <div className="text-left sm:text-center mb-8 sm:mb-16">
            <span className="text-[#6B4A2D] font-semibold text-sm uppercase tracking-wider">
              Our Process
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-4">
              How We Work
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 items-stretch">
            {processSteps.map((step, i) => {
              const colorSchemes = [
                {
                  hoverBg: 'group-hover:from-purple-500 group-hover:via-purple-400 group-hover:to-pink-400',
                  stepColor: 'bg-gradient-to-br from-purple-600 to-pink-500',
                  circle: 'bg-purple-400',
                  overlay: 'group-hover:bg-purple-500/90',
                  line: 'bg-purple-600'
                },
                {
                  hoverBg: 'group-hover:from-blue-500 group-hover:via-blue-400 group-hover:to-cyan-300',
                  stepColor: 'bg-gradient-to-br from-blue-600 to-cyan-500',
                  circle: 'bg-blue-400',
                  overlay: 'group-hover:bg-blue-500/90',
                  line: 'bg-blue-600'
                },
                {
                  hoverBg: 'group-hover:from-green-500 group-hover:via-green-400 group-hover:to-emerald-300',
                  stepColor: 'bg-gradient-to-br from-green-600 to-emerald-500',
                  circle: 'bg-green-400',
                  overlay: 'group-hover:bg-green-500/90',
                  line: 'bg-green-600'
                },
                {
                  hoverBg: 'group-hover:from-orange-600 group-hover:via-orange-500 group-hover:to-amber-400',
                  stepColor: 'bg-gradient-to-br from-orange-600 to-amber-500',
                  circle: 'bg-orange-500',
                  overlay: 'group-hover:bg-orange-600/90',
                  line: 'bg-orange-600'
                },
                {
                  hoverBg: 'group-hover:from-indigo-500 group-hover:via-indigo-400 group-hover:to-purple-400',
                  stepColor: 'bg-gradient-to-br from-indigo-600 to-purple-500',
                  circle: 'bg-indigo-400',
                  overlay: 'group-hover:bg-indigo-500/90',
                  line: 'bg-indigo-600'
                }
              ];

              const scheme = colorSchemes[i % colorSchemes.length];

              return (
                <div
                  key={i}
                  className="relative group"
                  data-animate
                  id={`process-${i}`}
                >
                  {i < processSteps.length - 1 && (
                    <div className={` hidden lg:block  absolute top-16 left-full w-full h-0.5 bg-gray-300 group-hover:${scheme.line} opacity-30 group-hover:opacity-100 transition-all duration-300 z-0 `} />)}

                  <div
                    className={` relative overflow-hidden bg-white bg-gradient-to-br ${scheme.hoverBg} rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-md sm:shadow-lg lg:hover:shadow-2xl transition-all duration-500 lg:hover:-translate-y-2 border border-gray-100 h-full flex flex-col`} >
                    <div className={` absolute inset-0 bg-white ${scheme.overlay} transition-all duration-500 rounded-xl sm:rounded-2xl `} />

                    <div className={` absolute -right-10 -top-10 sm:-right-12 sm:-top-12 w-20 h-20 sm:w-24 sm:h-24 ${scheme.circle} rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 z-[1] `} />

                    <div className={` absolute -left-12 -bottom-12 sm:-left-16 sm:-bottom-16 w-24 h-24 sm:w-32 sm:h-32 ${scheme.circle} rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-[1] `} />

                    <div className={` relative z-10 text-2xl sm:text-3xl lg:text-5xl  font-bold ${scheme.stepColor} bg-clip-text text-transparent group-hover:text-white mb-2 sm:mb-3 lg:mb-4 transition-all duration-300 `}>
                      {step.step}
                    </div>

                    <h3 className="relative z-10 text-base sm:text-lg lg:text-2xl font-bold text-gray-800 group-hover:text-white mb-2 sm:mb-3 lg:mb-4 transition-colors duration-300">
                      {step.title}
                    </h3>

                    <p className=" relative z-10 text-[12px] sm:text-sm lg:text-base text-gray-600 group-hover:text-white leading-snug sm:leading-relaxed transition-colors duration-300 mt-auto">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative h-[50vh] lg:h-[70vh] overflow-hidden" data-animate id="parallax">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('https://geniestudio.in/uploads/1786601936_1786601934919-89162093.jpg')"
          }}
        >
          <div className="absolute inset-0 bg-[#6B4A2D]/80" />
        </div>

        <div className="relative h-full flex items-center justify-center text-center px-6">
          <div className="max-w-4xl">
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-6">
              Your Vision, Our Expertise
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-200 mb-8 leading-relaxed">
              We transform ideas into captivating visuals that tell your unique story and elevate your brand presence
            </p>
            <button onClick={() => navigate("/contact")} className="px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 text-sm sm:text-base bg-white text-[#6B4A2D] rounded-full font-semibold inline-flex items-center gap-1 sm:gap-2 hover:shadow-2xl transition-all duration-300 hover:scale-100 sm:hover:scale-105">
              Start Your Project
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-10 bg-[#F7F6F3]" data-animate id="portfolio">
        <div className="page-container">

          <div className="text-left sm:text-center mb-8 sm:mb-16">
            <span className="text-[#6B4A2D] font-semibold text-sm uppercase tracking-wider">
              Our Work
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-4">
              Recent Projects
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
            {portfolioItems.map((item, i) => (
              <div
                key={i}
                className=" group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg lg:hover:shadow-2xl transition-all duration-300 aspect-[4/3] ">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover lg:group-hover:scale-110 transition-transform duration-500"
                />

                <div
                  className=" absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-4 lg:p-6 " >
                  <div
                    className=" text-white transform translate-y-2 lg:group-hover:translate-y-0 transition-transform duration-300 " >
                    <h3 className="text-sm sm:text-base lg:text-xl font-bold mb-0.5">
                      {item.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs lg:text-sm text-gray-300">
                      {item.category}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>



          <div className="text-left sm:text-center mt-8 sm:mt-12">
            <button
              className=" px-5 sm:px-8 py-3 sm:py-4 bg-[#6B4A2D] text-white text-sm sm:text-base rounded-full font-semibold inline-flex items-center gap-1.5 sm:gap-2 transition-all duration-300 sm:hover:shadow-xl"
              onClick={() => navigate("/portfolio")}   >
              View Full Portfolio
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-24 bg-[#6B4A2D] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>

        <div className="page-container relative z-10">
          <div className="max-w-none sm:max-w-4xl mx-auto text-left sm:text-center">

            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
              Ready to Elevate Your Visual Story?
            </h2>

            <p className="text-sm sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-10 leading-snug sm:leading-relaxed">
              Let's collaborate to create stunning visuals that capture your brand's essence
              and leave a lasting impression. Get in touch with Genie Studio today.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-start sm:justify-center">
              <button
                className=" px-6 sm:px-10 py-3 sm:py-5 bg-white text-gray-900 rounded-full text-sm sm:text-base font-bold transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg sm:shadow-2xl lg:hover:scale-105 group " onClick={() => navigate("/contact")} >
                Get Started
                <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 lg:group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="https://www.youtube.com/@itsgeniemedia_official"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button
                  className=" px-6 sm:px-10  py-3 sm:py-5  bg-white/10 backdrop-blur-lg text-white rounded-full text-sm sm:text-base font-bold transition-all duration-300 border border-white/30 flex items-center justify-center gap-2 sm:gap-3  lg:hover:bg-white/20" >
                  <Play className="w-4 h-4 sm:w-6 sm:h-6" />
                  Watch Showreel
                </button>
              </a>
            </div>

          </div>
        </div>
      </section>


      <style>{`
        @keyframes ken-burns {
          0% {
            transform: scale(1);/@itsgeniemedia_official
          }
          100% {
            transform: scale(1.1);
          }
        }
        .animate-ken-burns {
          animation: ken-burns 20s ease-out infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default Home;