import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

const slides = [
  {
    id: 1,
    video: "https://www.pexels.com/download/video/9034534/",
    title: "Corporate Showcase",
    desc: "Professional videography for modern brands",
  },
  {
    id: 2,
    video: "https://www.pexels.com/download/video/7667432/",
    title: "Creative Vision",
    desc: "Turning ideas into cinematic experiences",
  },
  {
    id: 3,
    video: "https://www.pexels.com/download/video/31540263/",
    title: "Event Coverage",
    desc: "Capturing moments that truly matter",
  },
];

export default function VideoHero() {
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);
  const sectionRef = useRef(null);

  /**
   * This section sits well below the fold, but the <video> had autoPlay, so the
   * browser began buffering and decoding a remote Pexels clip during initial
   * page load — competing for bandwidth and main thread with the hero that
   * actually decides LCP.
   *
   * Gate it on visibility instead: nothing is fetched until the section is
   * near the viewport. To a visitor it is identical, because it starts playing
   * as they scroll to it, which is the only moment they could ever have seen it.
   */
  const [inView, setInView] = useState(false);


  useEffect(() => {
    if (!isPlaying || !inView) return;

    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isPlaying, inView]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // 200px of lead-in so playback has started by the time it is on screen.
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !inView) return;

    video.load();
    video.muted = muted;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [active, muted, isPlaying, inView]);

  // Pause when scrolled away so an offscreen video is not decoding frames.
  useEffect(() => {
    const video = videoRef.current;
    if (video && !inView) video.pause();
  }, [inView]);

  return (
    <section ref={sectionRef} className="relative w-full h-[70vh] sm:h-[80vh] lg:h-[90vh] overflow-hidden bg-black">
      
      <video
        key={slides[active].id}
        ref={videoRef}
        src={inView ? slides[active].video : undefined}
        playsInline
        preload="metadata"
        autoPlay
        loop
        muted={muted}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70 z-20" />

      <div className="relative z-30 h-full flex items-end pb-16 px-6 sm:px-12">
        <div className="max-w-3xl">
          {/* h2, not h1. This component renders inside Home, which already
              has its own H1 — two H1s on one page leaves Google guessing what
              the page is about. Tailwind preflight makes headings inherit size
              and weight, so this renders identically. */}
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-semibold text-white mb-4 leading-tight">
            {slides[active].title}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300">
            {slides[active].desc}
          </p>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-30 flex gap-3">
        
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-white/10 hover:bg-white/20 transition p-3 rounded-full backdrop-blur"
        >
          {isPlaying ? (
            <Pause className="text-white w-5 h-5" />
          ) : (
            <Play className="text-white w-5 h-5" />
          )}
        </button>

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