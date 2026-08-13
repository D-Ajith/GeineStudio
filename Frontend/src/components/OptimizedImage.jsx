import React, { useCallback, useState } from "react";

/**
 * The one image component for Hostinger-hosted images.
 *
 * What it does, and why each piece is there:
 *
 * - Reserves space via aspect-ratio (or width/height) BEFORE the image loads,
 *   so nothing on the page jumps — this is the CLS fix.
 * - loading="lazy" + decoding="async" by default; `priority` flips to
 *   loading="eager" + fetchpriority="high" for above-the-fold heroes.
 * - Shows a lightweight placeholder (a blurred LQIP data-URI when one is
 *   stored, otherwise a soft shimmer) and cross-fades the real image in.
 * - Builds srcSet/sizes when width-variants exist for the image, so the
 *   browser downloads the 480/768/1200/1600 file it actually needs instead of
 *   the full-resolution original.
 *
 * IMPORTANT about formats: Hostinger's CDN already performs JPEG→WebP
 * conversion based on the request's Accept header (verified: a .jpg URL
 * returns Content-Type image/webp, ~22% smaller, when Accept includes
 * image/webp). So this component deliberately does NOT hand-roll <picture>
 * with .webp sources — the CDN handles format negotiation on the same URL.
 * AVIF is not offered by the CDN, so asking for it would just waste a request.
 */

/** URLs already fetched this session — skip the fade so cached images appear instantly. */
const seen = new Set();

const WIDTHS = [480, 768, 1200, 1600];

/**
 * Builds a srcSet from a variants map like { 480: url, 768: url, ... }.
 * Returns "" when no variants exist, in which case the browser just uses src.
 */
function buildSrcSet(variants) {
  if (!variants) return "";
  const parts = WIDTHS
    .filter((w) => variants[w])
    .map((w) => `${variants[w]} ${w}w`);
  return parts.length > 1 ? parts.join(", ") : "";
}

export default function OptimizedImage({
  src,
  alt = "",
  width,
  height,
  aspectRatio,          // e.g. "16/9" — used when width/height are unknown
  priority = false,     // true for above-the-fold heroes only
  sizes = "100vw",
  variants,             // { 480: url, 768: url, 1200: url, 1600: url }
  lqip,                 // tiny base64 placeholder, if stored
  className = "",       // wrapper
  imgClassName = "",    // the <img> itself
  objectFit = "cover",
  onClick,
  draggable,
  style,
  ...rest
}) {
  const [loaded, setLoaded] = useState(() => seen.has(src));

  const handleLoad = useCallback(() => {
    seen.add(src);
    setLoaded(true);
  }, [src]);

  // An image served from the browser cache can finish decoding before React
  // attaches onLoad, and then the event never fires — leaving it invisible.
  // The ref callback runs once the element is in the DOM, so check there.
  const attachRef = useCallback((el) => {
    if (el?.complete && el.naturalWidth > 0) handleLoad();
  }, [handleLoad]);

  const srcSet = buildSrcSet(variants);
  const ratio = aspectRatio || (width && height ? `${width} / ${height}` : undefined);

  return (
    <div
      className={`oi-wrap ${className}`}
      onClick={onClick}
      style={{
        position: "relative",
        overflow: "hidden",
        aspectRatio: ratio,
        // The placeholder sits behind the image and is revealed until it loads
        backgroundColor: "#ece9e4",
        backgroundImage: lqip ? `url(${lqip})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        ...style,
      }}
    >
      {/* Shimmer only when there is no LQIP to show */}
      {!loaded && !lqip && <span className="oi-shimmer" aria-hidden="true" />}

      <img
        ref={attachRef}
        src={src}
        srcSet={srcSet || undefined}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        width={width}
        height={height}
        draggable={draggable}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding={priority ? "sync" : "async"}
        onLoad={handleLoad}
        onError={handleLoad}
        className={imgClassName}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
          display: "block",
          opacity: loaded ? 1 : 0,
          transition: "opacity .35s ease",
        }}
        {...rest}
      />
    </div>
  );
}
