import React, { useCallback, useMemo, useState } from "react";
import { lookupImage } from "../lib/imageManifest";

/**
 * The one image component for Hostinger-hosted images.
 *
 * WHY IT LOOKS LIKE THIS
 * ----------------------
 * Hostinger's CDN negotiates JPEG→WebP from the Accept header but it cannot
 * resize (`?w=` is ignored) and never serves AVIF. So the smaller files are
 * generated ahead of time by backend/lib/imagePipeline.js and recorded either
 * in imageManifest.json (everything that existed at build time) or on the API
 * row itself (anything uploaded since).
 *
 * That means this component does NOT need to guess or rewrite URLs. It looks
 * the source up, and if derivatives exist it emits a real <picture>:
 *
 *   <source type="image/avif" srcset="…-400.avif 400w, …-800.avif 800w" sizes>
 *   <source type="image/webp" srcset="…-400.webp 400w, …-800.webp 800w" sizes>
 *   <img src={original}>
 *
 * The browser takes AVIF where it can, WebP otherwise, and falls back to the
 * untouched original when an image has no derivatives yet — so nothing ever
 * breaks, it just misses the saving.
 *
 * WHAT ELSE IT HANDLES
 * - Reserves space via aspect-ratio (or width/height) before load — the CLS fix.
 * - loading="lazy" + decoding="async" by default; `priority` flips to eager +
 *   fetchpriority="high" for above-the-fold heroes.
 * - Blurs up from a ~500-byte inline LQIP, so there is no grey flash.
 * - Skips the fade for images already fetched this session.
 */

/** URLs already fetched this session — skip the fade so cached images appear instantly. */
const seen = new Set();

/**
 * Accepts both variant shapes:
 *   new  { webp: { 400: url, … }, avif: { 400: url, … } }
 *   old  { 480: url, 768: url, … }              ← pre-pipeline rows
 * and normalises to the new one so the render path has a single case.
 */
function normaliseVariants(variants) {
  if (!variants) return null;
  if (variants.webp || variants.avif) return variants;

  const widths = Object.keys(variants).filter((k) => /^\d+$/.test(k));
  if (widths.length === 0) return null;
  return { webp: variants, avif: null };
}

/** `{ 400: url, 800: url }` → `"url 400w, url 800w"`, or "" if there is nothing useful. */
function buildSrcSet(byWidth) {
  if (!byWidth) return "";
  const parts = Object.keys(byWidth)
    .map(Number)
    .filter((w) => Number.isFinite(w) && byWidth[w])
    .sort((a, b) => a - b)
    .map((w) => `${byWidth[w]} ${w}w`);
  return parts.length > 0 ? parts.join(", ") : "";
}

export default function OptimizedImage({
  src,
  alt = "",
  width,
  height,
  aspectRatio,          // e.g. "16/9" — used when width/height are unknown
  priority = false,     // true for above-the-fold heroes only
  sizes = "100vw",
  variants,             // overrides the manifest when the API supplied them
  lqip,                 // overrides the manifest
  className = "",       // wrapper
  imgClassName = "",    // the <img> itself
  objectFit = "cover",
  onClick,
  draggable,
  style,
  ...rest
}) {
  const [loaded, setLoaded] = useState(() => seen.has(src));

  // Anything the caller passes wins; the manifest is the fallback. This is what
  // lets a page opt in to optimisation without knowing anything about variants.
  const meta = useMemo(() => {
    const fromManifest = lookupImage(src);
    return {
      variants: normaliseVariants(variants || fromManifest?.variants),
      lqip: lqip || fromManifest?.lqip,
      width: width || fromManifest?.width,
      height: height || fromManifest?.height,
    };
  }, [src, variants, lqip, width, height]);

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

  const avifSrcSet = buildSrcSet(meta.variants?.avif);
  const webpSrcSet = buildSrcSet(meta.variants?.webp);

  // Deliberately only from explicit props, never from the manifest. The
  // manifest knows the ORIGINAL's dimensions, and a 7008×4672 original dropped
  // into a fixed 340×320 card would have aspect-ratio fighting the design.
  // Callers that want a reserved box say so with `aspectRatio` or width/height.
  const ratio = aspectRatio || (width && height ? `${width} / ${height}` : undefined);

  const img = (
    <img
      ref={attachRef}
      src={src}
      alt={alt}
      width={meta.width}
      height={meta.height}
      draggable={draggable}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? "sync" : "async"}
      sizes={avifSrcSet || webpSrcSet ? sizes : undefined}
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
  );

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
        backgroundImage: meta.lqip ? `url(${meta.lqip})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        ...style,
      }}
    >
      {/* Shimmer only when there is no LQIP to show */}
      {!loaded && !meta.lqip && <span className="oi-shimmer" aria-hidden="true" />}

      {avifSrcSet || webpSrcSet ? (
        <picture>
          {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />}
          {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
          {img}
        </picture>
      ) : (
        img
      )}
    </div>
  );
}
