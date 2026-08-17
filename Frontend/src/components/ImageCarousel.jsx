import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

export default function imageCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      id: 1,
      image: "https://geniestudio.in/uploads/1786524726_1786524725461-113127996.JPG",
      title: "Podcast Shoots",
      description: "Studio-grade podcast video and audio production."
    },
    {
      id: 2,
      image: "https://geniestudio.in/uploads/1786533208_1786533208074-71190126.webp",
      title: "Product Shoots",
      description: "High-quality product photography built for impact and conversion."
    },
    {
      id: 3,
      image: "https://geniestudio.in/uploads/1786601041_1786601041120-705832864.png",
      title: "Corporate Shoots",
      description: "Professional visuals that elevate brands, teams, and workplaces."
    },
    {
      id: 4,
      image: "https://geniestudio.in/uploads/1786601438_1786601436150-15515106.png",
      title: "Event Shoots",
      description: "Seamless coverage of corporate events, launches, and conferences."
    },
    {
      id: 5,
      image: "https://geniestudio.in/uploads/1786531718_1786531716883-563738109.webp",
      title: "Professional Shoots",
      description: "Personal branding portraits for professionals and leaders."
    },
    {
      id: 6,
      image: "https://geniestudio.in/uploads/1786531726_1786531724729-939039825.webp",
      title: "Business Portfolio Shoots",
      description: "Complete visual storytelling for brands and businesses."
    }
  ];


  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentSlide]);

  return (
    <div className="bg-black flex flex-col">

      <div
        className="
    relative w-full overflow-hidden
    h-[60vh]     /* mobile */
    sm:h-[50vh] /* tablet */
    md:h-[60vh] /* laptop */
    lg:h-[90vh] /* desktop */ "
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >

        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>

              {/* Only the first slide is on screen at load; the rest sit at
                  opacity-0 behind it, so they must not compete for bandwidth. */}
              <OptimizedImage
                src={slide.image}
                alt={slide.title}
                className="w-full h-full"
                sizes="100vw"
                priority={index === 0}
              />


              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />


              <div className="absolute left-6 sm:left-8 md:left-12 bottom-6 sm:bottom-8 md:bottom-12">
                <div className="max-w-4xl">
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 animate-fade-in">
                    {slide.title}
                  </h2>
                  <p className="text-lg md:text-xl lg:text-2xl text-gray-300 animate-fade-in">
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>


        <button type="button" onClick={prevSlide} className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 md:p-4 rounded-full transition-all" aria-label="Previous slide" >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white" aria-hidden="true" />
        </button>

        <button type="button" onClick={nextSlide} className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 md:p-4 rounded-full transition-all" aria-label="Next slide">
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white" aria-hidden="true" />
        </button>


        {/* The dots were 6–8px buttons, well under the 24px minimum a pointer
            target needs. The button box is 24px now with the dot unchanged
            inside it; the gap is dropped and -mb-[9px] pulls the row back onto
            its original baseline, so the strip sits where it always did. */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-0 -mb-[9px]">
          {slides.map((slide, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              /* min-w, not w: the active pill is 32–48px wide and a fixed
                 24px box would squash it. */
              className="min-w-[24px] h-[24px] flex items-center justify-center shrink-0"
              aria-current={index === currentSlide ? "true" : undefined}
              aria-label={`Go to slide ${index + 1} of ${slides.length}: ${slide.title}`}
            >
              <span
                aria-hidden="true"
                className={`shrink-0 transition-all ${index === currentSlide
                  ? 'w-8 md:w-12 h-1.5 md:h-2 bg-white'
                  : 'w-1.5 md:w-2 h-1.5 md:h-2 bg-white/50 hover:bg-white/75'
                  } rounded-full`}
              />
            </button>
          ))}
        </div>



      </div>
    </div>
  );
}