import { useEffect, useRef, useState, useMemo, useCallback } from 'react';

const dist = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance, maxDist, minVal, maxVal) => {
  const val = maxVal - Math.abs((maxVal * distance) / maxDist);
  return Math.max(minVal, val + minVal);
};

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const TextPressure = ({
  text = 'Compressa',
  fontFamily = 'Compressa VF',
  fontUrl = 'https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2',

  width = true,
  weight = true,
  italic = true,
  alpha = false,

  flex = true,
  stroke = false,
  scale = false,

  textColor = '#FFFFFF',
  strokeColor = '#FF0000',
  strokeWidth = 2,
  className = '',

  minFontSize = 24
}) => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const spansRef = useRef([]);

  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });

  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);

  const chars = text.split('');

  useEffect(() => {
    const handleMouseMove = e => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const handleTouchMove = e => {
      const t = e.touches[0];
      cursorRef.current.x = t.clientX;
      cursorRef.current.y = t.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    if (containerRef.current) {
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + width / 2;
      mouseRef.current.y = top + height / 2;
      cursorRef.current.x = mouseRef.current.x;
      cursorRef.current.y = mouseRef.current.y;
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const setSize = useCallback(() => {
    if (!containerRef.current || !titleRef.current) return;

    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();

    let newFontSize = containerW / (chars.length / 2);
    newFontSize = Math.max(newFontSize, minFontSize);

    setFontSize(newFontSize);
    setScaleY(1);
    setLineHeight(1);

    requestAnimationFrame(() => {
      if (!titleRef.current) return;
      const textRect = titleRef.current.getBoundingClientRect();

      if (scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        setScaleY(yRatio);
        setLineHeight(yRatio);
      }
    });
  }, [chars.length, minFontSize, scale]);

  useEffect(() => {
    const debouncedSetSize = debounce(setSize, 100);
    debouncedSetSize();
    window.addEventListener('resize', debouncedSetSize);
    return () => window.removeEventListener('resize', debouncedSetSize);
  }, [setSize]);

  useEffect(() => {
    /**
     * Two problems fixed here, both of which showed up in PageSpeed as
     * "forced reflow" and as main-thread/blocking time.
     *
     * 1. LAYOUT THRASHING. The old loop interleaved reads and writes per
     *    character: read a span's rect, write its style, read the next span's
     *    rect, write... Each style write invalidates layout, so every
     *    subsequent read forced the browser to re-run layout synchronously —
     *    roughly one forced reflow per character, 60 times a second. Reads are
     *    now all done first, in one pass, and the writes applied afterwards, so
     *    at most one layout flush happens per frame.
     *
     * 2. IT NEVER STOPPED. The loop ran forever even with the pointer
     *    stationary, recomputing identical values. It now settles once the
     *    easing has converged and restarts on pointer, scroll or resize input
     *    (scroll matters because getBoundingClientRect is viewport-relative,
     *    so scrolling genuinely changes the distances).
     *
     * The effect itself is untouched: the same easing, the same distance
     * falloff, the same font-variation output.
     */
    let rafId = null;
    let settled = false;

    const animate = () => {
      const dx = cursorRef.current.x - mouseRef.current.x;
      const dy = cursorRef.current.y - mouseRef.current.y;
      mouseRef.current.x += dx / 15;
      mouseRef.current.y += dy / 15;

      if (titleRef.current) {
        // ---- READ PHASE: every measurement first, no writes in between ----
        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = titleRect.width / 2;

        const spans = spansRef.current;
        const measurements = [];
        for (let i = 0; i < spans.length; i++) {
          const span = spans[i];
          if (!span) continue;
          const rect = span.getBoundingClientRect();
          measurements.push({
            span,
            d: dist(mouseRef.current, {
              x: rect.x + rect.width / 2,
              y: rect.y + rect.height / 2,
            }),
          });
        }

        // ---- WRITE PHASE ----
        for (let i = 0; i < measurements.length; i++) {
          const { span, d } = measurements[i];
          const wdth = width ? Math.floor(getAttr(d, maxDist, 5, 200)) : 100;
          const wght = weight ? Math.floor(getAttr(d, maxDist, 100, 900)) : 400;
          const italVal = italic ? getAttr(d, maxDist, 0, 1).toFixed(2) : 0;
          const alphaVal = alpha ? getAttr(d, maxDist, 0, 1).toFixed(2) : 1;

          const newFontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;

          if (span.style.fontVariationSettings !== newFontVariationSettings) {
            span.style.fontVariationSettings = newFontVariationSettings;
          }
          if (alpha && span.style.opacity !== alphaVal) {
            span.style.opacity = alphaVal;
          }
        }
      }

      // Converged on the target and nothing new came in — stop until it does.
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        settled = true;
        rafId = null;
        return;
      }

      rafId = requestAnimationFrame(animate);
    };

    const wake = () => {
      if (!settled) return;
      settled = false;
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', wake, { passive: true });
    window.addEventListener('touchmove', wake, { passive: true });
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake, { passive: true });

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', wake);
      window.removeEventListener('touchmove', wake);
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', wake);
    };
  }, [width, weight, italic, alpha]);

  const styleElement = useMemo(() => {
    return (
      <style>{`
          @font-face {
            font-family: '${fontFamily}';
            src: url('${fontUrl}');
            font-style: normal;
          }
          .stroke span {
            position: relative;
            color: ${textColor};
          }
          .stroke span::after {
            content: attr(data-char);
            position: absolute;
            left: 0;
            top: 0;
            color: transparent;
            z-index: -1;
            -webkit-text-stroke-width: ${strokeWidth}px;
            -webkit-text-stroke-color: ${strokeColor};
          }
        `}</style>
    );
  }, [fontFamily, fontUrl, textColor, strokeColor, strokeWidth]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-transparent">
      {styleElement}
      <h1
        ref={titleRef}
        className={`text-pressure-title ${className} ${
          flex ? 'flex justify-between' : ''
        } ${stroke ? 'stroke' : ''} uppercase text-center`}
        style={{
          fontFamily,
          fontSize: fontSize,
          lineHeight,
          transform: `scale(1, ${scaleY})`,
          transformOrigin: 'center top',
          margin: 0,
          fontWeight: 100,
          color: stroke ? undefined : textColor
        }}>
        {chars.map((char, i) => (
          <span
            key={i}
            ref={el => (spansRef.current[i] = el)}
            data-char={char}
            className="inline-block">
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default TextPressure;
