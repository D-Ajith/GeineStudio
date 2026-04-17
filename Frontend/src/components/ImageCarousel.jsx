import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function imageCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      id: 1,
      image: "https://i.pinimg.com/1200x/03/79/f1/0379f10c7de915ae64bca35ffa7f59e0.jpg",
      title: "Podcast Shoots",
      description: "Studio-grade podcast video and audio production."
    },
    {
      id: 2,
      image: "https://i.pinimg.com/736x/44/70/5c/44705c6700132d6e6c27edee1b800c34.jpg",
      title: "Product Shoots",
      description: "High-quality product photography built for impact and conversion."
    },
    {
      id: 3,
      image: "https://i.pinimg.com/1200x/8a/5c/1d/8a5c1ded741ab3a3a3b05bc11f4bf048.jpg",
      title: "Corporate Shoots",
      description: "Professional visuals that elevate brands, teams, and workplaces."
    },
    {
      id: 4,
      image: "https://i.pinimg.com/736x/e4/2f/d6/e42fd65fa4584ed088d924f9a024bafc.jpg",
      title: "Event Shoots",
      description: "Seamless coverage of corporate events, launches, and conferences."
    },
    {
      id: 5,
      image: "https://i.pinimg.com/1200x/00/f8/09/00f80924ca315eec7ff96e30c297a280.jpg",
      title: "Professional Shoots",
      description: "Personal branding portraits for professionals and leaders."
    },
    {
      id: 6,
      image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?w=1200&q=80",
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

              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />


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


        <button onClick={prevSlide} className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 md:p-4 rounded-full transition-all" aria-label="Previous slide" >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white" />
        </button>

        <button onClick={nextSlide} className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 md:p-4 rounded-full transition-all" aria-label="Next slide">
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
        </button>


        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2 md:gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all ${index === currentSlide
                ? 'w-8 md:w-12 h-1.5 md:h-2 bg-white'
                : 'w-1.5 md:w-2 h-1.5 md:h-2 bg-white/50 hover:bg-white/75'
                } rounded-full`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>



      </div>
    </div>
  );
}