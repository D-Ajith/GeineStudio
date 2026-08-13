import { useEffect, useState } from "react";
import { bestVariantUrl } from "./imageManifest";

/**
 * Responsive sizing for images that CANNOT be a <picture> — specifically the
 * CSS `background-image` heroes and parallax sections.
 *
 * srcSet/sizes only work on <img>/<source>. Rewriting those sections into real
 * <img> elements would mean re-doing the ken-burns and bg-fixed treatments, so
 * instead we pick the right pre-generated file for the current viewport and
 * hand back a plain URL. The markup and the animation stay exactly as they are.
 */

/** Matches the ladder in backend/lib/imagePipeline.js. */
const LADDER = [400, 800, 1200, 1600, 2000];

/**
 * Rounds a measured CSS width up to the next rung.
 *
 * DPR is capped at 2 deliberately: a 3× phone asking for 3× pixels on a 412px
 * viewport would pull the 2000px file, and on a phone screen that is invisible
 * quality for triple the bytes.
 */
function targetWidthFor(viewportWidth, dpr) {
  const needed = viewportWidth * Math.min(dpr || 1, 2);
  return LADDER.find((w) => w >= needed) ?? LADDER[LADDER.length - 1];
}

/**
 * Current viewport width, re-measured on resize and orientation change.
 *
 * Only re-renders when the chosen RUNG changes, not on every pixel of a drag —
 * otherwise a desktop window resize would rerender the hero continuously.
 */
export function useTargetWidth() {
  const [target, setTarget] = useState(() => {
    if (typeof window === "undefined") return 1600;
    return targetWidthFor(window.innerWidth, window.devicePixelRatio);
  });

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = targetWidthFor(window.innerWidth, window.devicePixelRatio);
        setTarget((prev) => (prev === next ? prev : next));
      });
    };

    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  return target;
}

/**
 * The best pre-generated file for `src` at the current viewport.
 * Falls straight back to `src` when the image has no derivatives.
 */
export function useResponsiveImage(src) {
  const target = useTargetWidth();
  return bestVariantUrl(src, target);
}

/** Same thing for a list, so a slider can size every slide in one hook call. */
export function useResponsiveImages(sources) {
  const target = useTargetWidth();
  return (sources || []).map((src) => bestVariantUrl(src, target));
}
