import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const slides = [
  {
    id: 1,
    video:
      "https://www.pexels.com/download/video/9034534/",
    title: "Corporate Showcase",
    desc: "Professional videography for modern brands",
  },
  {
    id: 2,
    video:
      "https://www.pexels.com/download/video/7667432/",
    title: "Creative Vision",
    desc: "Turning ideas into cinematic experiences",
  },
  {
    id: 3,
    video:
      "https://www.pexels.com/download/video/31540263/",
    title: "Event Coverage",
    desc: "Capturing moments that truly matter",
  },
];

export default function VideoHero() {
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 8000); 

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      video.pause();
      video.currentTime = 0;
      video.muted = muted;

      if (index === active) {
        video.play().catch(() => {});
      }
    });
  }, [active, muted]);

  return (
    <section className="relative w-full h-[70vh] sm:h-[80vh] lg:h-[90vh] overflow-hidden bg-black">
      {slides.map((slide, index) => (
        <video
          key={slide.id}
          ref={(el) => (videoRefs.current[index] = el)}
          src={slide.video}
          playsInline
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === active ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70 z-20" />

      <div className="relative z-30 h-full flex items-end pb-16 px-6 sm:px-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-semibold text-white mb-4 leading-tight">
            {slides[active].title}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300">
            {slides[active].desc}
          </p>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-30">
        <button
          onClick={() => setMuted(!muted)}
          className="bg-white/10 hover:bg-white/20 transition p-3 rounded-full backdrop-blur"
        >
          {muted ? (
            <VolumeX className="text-white w-5 h-5" />
          ) : (
            <Volume2 className="text-white w-5 h-5" />
          )}
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              active === i ? "bg-white scale-125" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
