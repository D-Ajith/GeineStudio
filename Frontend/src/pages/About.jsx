import { Camera, Award, Heart, Target, Zap, Users, CheckCircle, Quote } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Counter from '../components/Counter';
import ImageCarousel from "../components/ImageCarousel"
import OptimizedImage from "../components/OptimizedImage";
import { useTargetWidth } from "../lib/useResponsiveImage";
import { bestVariantUrl } from "../lib/imageManifest";
import Seo from "../components/Seo";
import { SEO } from "../lib/seoConfig";
const About = () => {
  const [activeTab, setActiveTab] = useState('mission');

  // The hero paints through CSS background-image, which cannot carry a srcSet.
  const targetWidth = useTargetWidth();

  const values = [
    {
      icon: Heart,
      title: 'Passion',
      description: 'We love what we do and it shows in every photograph we create.',
    },
    {
      icon: Target,
      title: 'Precision',
      description: 'Meticulous attention to detail in every aspect of our work.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Always exploring new techniques and creative approaches.',
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Working closely with clients to bring their vision to life.',
    },
  ];

  const stats = [
    { number: '10', label: 'Years Experience', suffix: '+' },
    { number: '500', label: 'Happy Clients', suffix: '+' },
    { number: '5000', label: 'Photos Captured', suffix: '+' },
    { number: '15', label: 'Awards Won', suffix: '+' },
  ];

  const services = [
    {
      title: "Podcast Shoots",
      description: "Studio-grade podcast video and audio production.",
      image:
        "https://geniestudio.in/uploads/1786531745_1786531742798-721756481.webp"
    },
    {
      title: "Product Shoots",
      description: "High-quality product images for ads and e-commerce.",
      image:
        "https://geniestudio.in/uploads/1786531740_1786531740110-988555456.webp"
    },
    {
      title: "Corporate Shoots",
      description: "Professional visuals for brands, teams, and workspaces.",
      image:
        "https://geniestudio.in/uploads/1786520942_1786520939442-30465918.webp"
    },
    {
      title: "Event Shoots",
      description: "Complete coverage for corporate events and launches.",
      image:
        "https://geniestudio.in/uploads/1786522543_1786522542765-76055353.webp"
    },
    {
      title: "Professional Shoots",
      description: "Personal branding portraits for professionals.",
      image:
        "https://geniestudio.in/uploads/1786520948_1786520946061-981315709.webp"
    },
    {
      title: "Business Portfolio Shoots",
      description: "Visual storytelling for brands and businesses.",
      image:
        "https://geniestudio.in/uploads/1786519473_1786519473117-884148224.jpg"
    }
  ];


  const testimonials = [
    {
      name: "Ananya & Rohit",
      role: "Corporate Client",
      image:
        "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=400",
      text:
        "Genie Studio delivered exactly what our brand needed. The corporate shoot was clean, professional, and perfectly aligned with our identity."
    },
    {
      name: "Rahul Mehta",
      role: "Event & Product Client",
      image:
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
      text:
        "From event coverage to product shoots, the team handled everything seamlessly. High-quality visuals and very quick turnaround."
    },
    {
      name: "Sneha Kapoor",
      role: "Podcast & Professional Shoot Client",
      image:
        "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400",
      text:
        "The podcast setup and professional portraits exceeded my expectations. Great lighting, sound quality, and an extremely comfortable experience."
    }
  ];


  const whyChooseUs = [
    "Industry-grade cameras, lighting, and studio equipment",
    "Experienced professionals across photography & videography",
    "Tailored shoots designed around your brand and goals",
    "Fast turnaround with consistent premium quality",
    "Flexible packages for startups, professionals, and enterprises",
    "Trusted by brands, businesses, and creators"
  ];


  const tabs = [
    { id: 'mission', label: 'Our Mission' },
    { id: 'vision', label: 'Our Vision' },
    { id: 'approach', label: 'Our Approach' },
  ];

  const tabContent = {
    mission:
      "To create powerful visual content that helps brands, professionals, and businesses communicate their story with clarity, creativity, and impact through photography and videography.",

    vision:
      "To become a leading creative studio known for setting high standards in visual storytelling, production quality, and client experience across corporate, commercial, and digital platforms.",

    approach:
      "We work closely with our clients to understand their goals and brand identity. By combining creative direction, technical expertise, and a collaborative process, we deliver visuals that are purposeful, polished, and effective."
  };


  return (
    <main className="w-full overflow-x-hidden">
      <Seo
        {...SEO.about}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: SEO.about.path },
        ]}
      />

      <section className="relative min-h-[50vh] md:min-h-[60vh] lg:min-h-[55vh] xl:min-h-[50vh] text-white overflow-hidden flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${bestVariantUrl(
              "https://geniestudio.in/uploads/1786602774_1786602774122-495403358.jpg",
              targetWidth
            )}')`,
          }}
        />

        <div className="absolute inset-0 bg-black/60"></div>

        <div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          data-aos="fade-up"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            About Geine Studio
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            A creative studio delivering high-quality visuals for brands and professionals.          </p>
        </div>
      </section>
      <section className="py-10 sm:py-14 md:py-16 lg:py-20 bg-gray-50 min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

            <div className="space-y-6" data-aos="fade-right">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 uppercase leading-tight">
                Our Studio Spaces
              </h2>

              <div className="space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">

                <div className="space-y-4">
                  <p>
                    Genie Studio operates through professionally equipped creative spaces
                    designed for photography, video production, podcasts, and branded
                    content creation. Our studios meet industry standards for lighting,
                    sound, and visual production.
                  </p>

                  <p>
                    Each studio space is supported with modern equipment, controlled lighting
                    setups, post-production facilities, and experienced creative teams to ensure
                    consistent quality across all shoots and productions. From high-resolution
                    cameras and professional audio systems to color-accurate editing suites,
                    every detail is designed to deliver industry-standard output.
                  </p>

                  <p>
                    Our workflow combines technical expertise with creative vision, allowing us
                    to handle everything from concept planning and on-site execution to editing,
                    retouching, and final delivery. This end-to-end approach helps us maintain.
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-2xl shadow-lg h-28 sm:h-40 md:h-48 w-full" data-aos="fade-right">
                  <OptimizedImage
                    src="https://i.pinimg.com/736x/87/cd/ae/87cdaefca8bb9eded4cc653ec1c81ccc.jpg"
                    alt="Genie Studio Workspace"
                    className="w-full h-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    imgClassName="transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>


              </div>

            </div>

            <div
              className="grid grid-cols-2 gap-3 sm:gap-4"
              data-aos="fade-up"
            >
              <div className="relative group overflow-hidden rounded-2xl shadow-lg h-64 sm:h-72 cursor-pointer">
                <OptimizedImage
                  src="https://geniestudio.in/uploads/1786531745_1786531742798-721756481.webp"
                  alt="Podcast Studio"
                  className="w-full h-full"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  imgClassName="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white text-xl sm:text-2xl font-black uppercase leading-tight">
                    Podcast Studio
                  </h3>
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-2xl shadow-lg h-64 sm:h-72 cursor-pointer">
                <OptimizedImage
                  src="https://geniestudio.in/uploads/1786601780_1786601778626-797870812.png"
                  alt="Product Studio"
                  className="w-full h-full"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  imgClassName="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white text-xl sm:text-2xl font-black uppercase leading-tight">
                    Product Studio
                  </h3>
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-2xl shadow-lg h-64 sm:h-72 cursor-pointer">
                <OptimizedImage
                  src="https://geniestudio.in/uploads/1786522542_1786522540558-872910330.webp"
                  alt="Corporate Studio"
                  className="w-full h-full"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  imgClassName="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white text-xl sm:text-2xl font-black uppercase leading-tight">
                    Corporate Studio
                  </h3>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-2xl shadow-lg h-64 sm:h-72 cursor-pointer">
                <OptimizedImage
                  src="https://geniestudio.in/uploads/1786601438_1786601436150-15515106.png"
                  alt="Event Production"
                  className="w-full h-full"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  imgClassName="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white text-xl sm:text-2xl font-black uppercase leading-tight">
                    Event Production
                  </h3>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      <section className="py-10 sm:py-14 md:py-16 lg:py-20 bg-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start overflow-x-hidden">

            <div className=" grid grid-cols-2 gap-1 sm:gap-2 order-2 lg:order-1 w-full rounded-2xl shadow-lg overflow-hidden">
              <div className="relative group overflow-hidden h-[180px] sm:h-[210px] md:h-[240px]">
                <OptimizedImage
                  src="https://geniestudio.in/uploads/1786531739_1786531738826-206533018.webp"
                  alt="Podcast Shoots"
                  className="w-full h-full"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  imgClassName="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-white text-sm sm:text-lg font-black uppercase">
                    Podcast
                  </h3>
                </div>
              </div>
              <div className="relative group overflow-hidden h-[180px] sm:h-[210px] md:h-[240px]">
                <OptimizedImage
                  src="https://geniestudio.in/uploads/1786601780_1786601778626-797870812.png"
                  alt="Product Shoots"
                  className="w-full h-full"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  imgClassName="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-white text-sm sm:text-lg font-black uppercase">
                    Product
                  </h3>
                </div>
              </div>
              <div className="relative group overflow-hidden h-[180px] sm:h-[210px] md:h-[240px]">
                <OptimizedImage
                  src="https://geniestudio.in/uploads/1786601041_1786601041120-705832864.png"
                  alt="Corporate Shoots"
                  className="w-full h-full"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  imgClassName="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-white text-sm sm:text-lg font-black uppercase">
                    Corporate
                  </h3>
                </div>
              </div>

              <div className="relative group overflow-hidden h-[180px] sm:h-[210px] md:h-[240px]">
                <OptimizedImage
                  src="https://geniestudio.in/uploads/1786601438_1786601436150-15515106.png"
                  alt="Event Shoots"
                  className="w-full h-full"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  imgClassName="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-white text-sm sm:text-lg font-black uppercase">
                    Events
                  </h3>
                </div>
              </div>
            </div>




            <div className="space-y-2 order-1 lg:order-2" data-aos="fade-left">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 uppercase">
                What We Do
              </h2>

              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                Genie Studio delivers visually compelling content that helps brands
                connect with audiences. From concept to final output, we focus on
                creativity, precision, and storytelling.
              </p>

              <ul className="space-y-2 pl-4 text-sm sm:text-base">
                <li>• Podcast & Studio Production</li>
                <li>• Product & Commercial Shoots</li>
                <li>• Corporate & Brand Shoots</li>
                <li>• Event Photography & Coverage</li>
                <li>• Professional Portraits</li>
                <li>• Business Portfolio Creation</li>
                <li>• Video Editing</li>
                <li>• Animations 2d or 3d</li>
                <li>• Figma</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      <section className="py-4 sm:py-14 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 sm:mb-4 tracking-tight">
              Who We Are
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 font-light px-4">
              Discover what drives us and shapes our work
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 px-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${activeTab === tab.id
                  ? 'bg-[#6B4A2D] text-white shadow-lg scale-105'
                  : 'bg-[#F7F6F3] text-slate-700 hover:bg-slate-200 hover:scale-102'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-[#F7F6F3] rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 text-center shadow-sm">
            <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed font-light">
              {tabContent[activeTab]}
            </p>
          </div>
        </div>
      </section>
      <ImageCarousel />

      <section className="py-10 sm:py-16 md:py-20 bg-[#F7F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 sm:mb-4 tracking-tight">
              Our Values
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-light px-4">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {values.map((value, index) => {
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

              const scheme = colorSchemes[index % colorSchemes.length];

              return (
                <div
                  key={index}
                  data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                  data-aos-delay={index * 100}
                  className={`
          relative
          overflow-hidden
          p-4 sm:p-6 md:p-8 
          text-center 
          bg-white
          bg-gradient-to-br
          ${scheme.hoverBg}
          rounded-xl sm:rounded-2xl 
          shadow-md 
          hover:shadow-xl 
          hover:-translate-y-2
          transition-all duration-500 
          group
        `}
                >
                  <div className={`
          absolute inset-0
          bg-white
          ${scheme.overlay}
          transition-all duration-500
          rounded-xl sm:rounded-2xl
        `} />

                  <div className={`
          absolute -right-10 -top-10 sm:-right-12 sm:-top-12
          w-20 h-20 sm:w-24 sm:h-24
          ${scheme.circle}
          rounded-full
          opacity-0 group-hover:opacity-30
          transition-opacity duration-500
          z-[1]
        `} />

                  <div className={`
          absolute -left-12 -bottom-12 sm:-left-16 sm:-bottom-16
          w-24 h-24 sm:w-32 sm:h-32
          ${scheme.circle}
          rounded-full
          opacity-0 group-hover:opacity-20
          transition-opacity duration-500
          z-[1]
        `} />

                  <div className={`
          relative z-10
          w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 
          ${scheme.icon}
          text-white
          rounded-full 
          flex items-center justify-center 
          mb-3 sm:mb-5 md:mb-6 
          mx-auto 
          group-hover:scale-110
          transition-all duration-300
        `}>
                    <value.icon
                      className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"
                      strokeWidth={1.5}
                    />
                  </div>

                  <h3 className="relative z-10 text-base sm:text-lg lg:text-2xl font-bold text-gray-800 group-hover:text-white mb-2 sm:mb-3 lg:mb-4 transition-colors duration-300">

                    {value.title}
                  </h3>

                  <p className=" relative z-10 text-xs sm:text-sm md:text-base  text-slate-600  group-hover:text-white leading-relaxed transition-colors duration-300 ">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 xl:gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 sm:mb-5 md:mb-6 tracking-tight">
                Why Choose Geine Studio?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-6 sm:mb-8 md:mb-10 leading-relaxed font-light">
                We're more than just photographers - we're storytellers, artists, and memory makers. Here's what sets us apart from the rest.
              </p>
              <div className="space-y-3 sm:space-y-4 md:space-y-5">
                {whyChooseUs.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 sm:gap-4 group">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 flex-shrink-0 mt-0.5 sm:mt-1 group-hover:scale-110 transition-transform" strokeWidth={2} />
                    <p className="text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative order-first lg:order-last" data-aos="slide-left">
              <OptimizedImage
                src="https://geniestudio.in/uploads/1786604019_1786604018546-87413699.jpg"
                alt="Photography equipment"
                className="rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl w-full h-[350px] sm:h-[400px] md:h-[500px] lg:h-[550px]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-20 lg:py-12 bg-[#F7F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 md:mb-4">
              Our Services
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              Professional photography tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
            {services.map((service, index) => (
              <div
                key={index}
                data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                data-aos-delay={index * 100}
                className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <OptimizedImage
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    imgClassName="group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="p-3 sm:p-4 md:p-5">
                  <h3 className="relative z-10 text-base sm:text-lg lg:text-2xl font-bold text-gray-800 group-hover:text-black mb-2 sm:mb-3 lg:mb-4 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
        <div className="text-center mt-12">
          <a
            href="/services"
            className="inline-flex items-center px-8 py-4 bg-[#6B4A2D] text-white rounded-lg font-medium hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl group"
          >
            View Our services  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />

          </a>
        </div>
      </section>
      <section className="py-0">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0">
          <div className="relative group aspect-square overflow-hidden cursor-pointer">
            <OptimizedImage
              src="https://geniestudio.in/uploads/1786520942_1786520939456-72574430.webp"
              alt="Photography showcase"
              className="w-full h-full"
              sizes="(max-width: 768px) 100vw, 50vw"
              imgClassName="group-hover:scale-110 group-hover:brightness-90 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500"></div>
          </div>
          <div className="relative group aspect-square overflow-hidden cursor-pointer">
            <OptimizedImage
              src="https://geniestudio.in/uploads/1786531747_1786531746636-336880294.webp"
              alt="Photography showcase"
              className="w-full h-full"
              sizes="(max-width: 768px) 100vw, 50vw"
              imgClassName="group-hover:scale-110 group-hover:brightness-90 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500"></div>
          </div>
          <div className="relative group aspect-square overflow-hidden cursor-pointer">
            <OptimizedImage
              src="https://geniestudio.in/uploads/1786530714_1786530711205-339283661.jpg"
              alt="Photography showcase"
              className="w-full h-full"
              sizes="(max-width: 768px) 100vw, 50vw"
              imgClassName="group-hover:scale-110 group-hover:brightness-90 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500"></div>
          </div>
        </div>
      </section>
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 sm:mb-4 tracking-tight">
              Meet Our Team
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-light px-4">
              Talented professionals dedicated to capturing your perfect moments
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 overflow-x-hidden">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Lead Photographer',
                image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800',
              },
              {
                name: 'Michael Chen',
                role: 'Portrait Specialist',
                image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Wedding Photographer',
                image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=800',
              },
            ].map((member, index) => (
              <div
                key={index}
                data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                data-aos-delay={index * 100}
                className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="relative overflow-hidden">
                  <OptimizedImage
                    src={member.image}
                    alt={member.name}
                    className="w-full h-56 sm:h-80 md:h-96"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    imgClassName="group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>

                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 md:p-8 text-white">
                    <h3 className="text-sm sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-2 tracking-tight">
                      {member.name}
                    </h3>
                    <p className="text-xs sm:text-base md:text-lg text-slate-200 font-light">
                      {member.role}
                    </p>
                  </div>
                </div>
              </div>

            ))}
          </div>

        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-[#F7F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 sm:mb-4 tracking-tight">
              What Our Clients Say
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 font-light px-4">
              Don't just take our word for it - hear from those we've worked with
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                data-aos-delay={index * 80}
                className="group relative bg-white p-3 sm:p-5 md:p-10 rounded-lg sm:rounded-xl md:rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#6B4A2D]/5 via-orange-50/50 to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg sm:rounded-xl md:rounded-2xl" />

                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#6B4A2D]/20 rounded-lg sm:rounded-xl md:rounded-2xl transition-colors duration-500" />

                <div className="relative z-10">
                  <Quote
                    className="w-5 h-5 sm:w-8 sm:h-8 md:w-12 md:h-12 text-slate-300 group-hover:text-[#6B4A2D] mb-2 sm:mb-4 md:mb-6 transition-colors duration-500"
                    strokeWidth={1.5}
                  />

                  <p className="text-[11px] sm:text-sm md:text-lg text-slate-700 group-hover:text-slate-900 mb-3 sm:mb-5 md:mb-8 leading-snug sm:leading-relaxed italic line-clamp-3 transition-colors duration-300">
                    "{testimonial.text}"
                  </p>

                  <div className="flex items-center gap-2.5 sm:gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#6B4A2D] to-orange-500 opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-500" />
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="relative w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover ring-1 sm:ring-2 ring-slate-100 group-hover:ring-[#6B4A2D]/30 transition-all duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-base md:text-lg font-semibold text-slate-900 group-hover:text-[#6B4A2D] leading-tight transition-colors duration-300">
                        {testimonial.name}
                      </h4>
                      <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 group-hover:text-orange-600 font-medium transition-colors duration-300">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-bl from-orange-500/0 group-hover:from-orange-500/10 to-transparent rounded-bl-full transition-all duration-500" />
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className="py-12 sm:py-14 md:py-16 bg-white">
        <div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          data-aos="zoom-in"
        >
          <Award
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-4 sm:mb-5 md:mb-6 text-slate-900"
            strokeWidth={1.5}
          />

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-5 tracking-tight text-slate-900">
            Award-Winning Excellence
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed font-light px-2 sm:px-4">
            Our work has been trusted by businesses, professionals, and brands across industries.
            While our visuals speak for themselves, our true success lies in long-term client
            relationships and the impact our photography and videography create for their growth.
          </p>

        </div>
      </section>

    </main>
  );
};

export default About;