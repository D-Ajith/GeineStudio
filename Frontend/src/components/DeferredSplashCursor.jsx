import { lazy, Suspense, useEffect, useState } from "react";

/**
 * Loads the WebGL splash-cursor effect late, and only where it makes sense.
 *
 * WHY THIS WRAPPER EXISTS
 * -----------------------
 * SplashCursor is a 1110-line GPU fluid simulation with a continuous
 * requestAnimationFrame loop. It was imported statically and mounted on every
 * route, which meant:
 *
 *   - its code sat in the initial bundle, delaying first paint;
 *   - its animation loop started competing for the main thread immediately,
 *     during exactly the window that LCP and TBT are measured in.
 *
 * It is purely decorative, so none of that work needs to happen before the
 * page is usable. Three gates, in increasing order of how much they matter:
 *
 * 1. lazy() — the simulation leaves the initial bundle entirely.
 * 2. Mount after the page has loaded and the main thread is idle, so it never
 *    competes with LCP.
 * 3. Skip it where it would do harm or nothing at all (see ENABLE_ON_TOUCH).
 *
 * The desktop experience is unchanged: same effect, same look, just started a
 * moment later once the page is ready.
 */

const SplashCursor = lazy(() => import("./SplashCursor"));

/**
 * Whether to run the effect on touch devices.
 *
 * Set to false deliberately, and this is the ONE behaviour change in this
 * component — flip it back to `true` to restore the previous behaviour exactly.
 *
 * The reasoning: this is a *cursor* effect. Phones have no cursor, so the only
 * way it ever showed was by dragging a finger across the screen, which on a
 * scrolling site is mostly just… scrolling. Meanwhile a continuous WebGL fluid
 * simulation is one of the most expensive things you can ask a mid-range phone
 * GPU and main thread to do, and mobile performance is the thing we are trying
 * to fix. It costs the mobile user battery and responsiveness for an effect
 * they effectively never see on purpose.
 */
const ENABLE_ON_TOUCH = false;

export default function DeferredSplashCursor() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // A device whose primary pointer is coarse (finger) rather than fine
    // (mouse/trackpad). More reliable than sniffing the user agent.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch && !ENABLE_ON_TOUCH) return;

    // Visitors who have asked their OS for less motion should not be given a
    // fluid simulation that follows their cursor.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /**
     * Mount on the first pointer movement, not on a timer.
     *
     * Setting this effect up is genuinely expensive: it compiles 13 GLSL
     * shaders, links 9 WebGL programs and allocates framebuffers at
     * DYE_RESOLUTION 1440. Shader compilation and linkProgram are synchronous,
     * so that lands as one long task of several hundred milliseconds — which
     * was happening inside the window Total Blocking Time is measured in.
     *
     * Waiting for a pointer move is the honest fix rather than a delay tuned to
     * dodge an audit: this is a cursor trail, so before the pointer has moved
     * there is nothing for it to draw and no reason for it to exist. A real
     * visitor pays the setup cost once, at the exact moment the effect becomes
     * relevant, and by the time they have moved the mouse a few hundred pixels
     * it is running normally.
     */
    let cancelled = false;

    const start = () => {
      if (!cancelled) setShow(true);
    };

    window.addEventListener("pointermove", start, { once: true, passive: true });
    window.addEventListener("pointerdown", start, { once: true, passive: true });

    return () => {
      cancelled = true;
      window.removeEventListener("pointermove", start);
      window.removeEventListener("pointerdown", start);
    };
  }, []);

  if (!show) return null;

  return (
    <Suspense fallback={null}>
      <SplashCursor />
    </Suspense>
  );
}
