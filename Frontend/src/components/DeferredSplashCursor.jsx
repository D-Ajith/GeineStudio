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

    let idleId;
    let cancelled = false;

    const start = () => {
      if (cancelled) return;
      // requestIdleCallback waits for a genuinely quiet main thread. The
      // timeout is the upper bound so it still starts on busy pages, and the
      // setTimeout is the fallback for Safari, which lacks the API.
      idleId = window.requestIdleCallback
        ? window.requestIdleCallback(() => !cancelled && setShow(true), { timeout: 3000 })
        : setTimeout(() => !cancelled && setShow(true), 1200);
    };

    // Wait for load first: until then the browser is still fetching the images
    // that decide LCP, and this effect must not compete with them.
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
      if (idleId && window.cancelIdleCallback) window.cancelIdleCallback(idleId);
      else clearTimeout(idleId);
    };
  }, []);

  if (!show) return null;

  return (
    <Suspense fallback={null}>
      <SplashCursor />
    </Suspense>
  );
}
