import React, { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";

/**
 * Number that counts up to its value the first time it scrolls into view.
 * The final text is exactly the formatted value, so nothing differs once the animation ends.
 */
export function CountUp({ value, decimals = 2, prefix = "", suffix = "", sign = false, delay = 0, duration = 1.6, locale = "en-US" }: {
  value: number; decimals?: number; prefix?: string; suffix?: string; sign?: boolean; delay?: number; duration?: number; locale?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [v, setV] = useState(0);
  const ok = Number.isFinite(value);
  useEffect(() => {
    if (!inView || !ok) return;
    const c = animate(0, value, { duration, delay, ease: [0.16, 1, 0.3, 1], onUpdate: setV });
    return () => c.stop();
  }, [inView, value, delay, duration, ok]);
  if (!ok) return <span ref={ref}>-</span>;
  const shown = inView ? v : 0;
  const text = Math.abs(shown).toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const s = shown < 0 ? "-" : sign && value > 0 ? "+" : "";
  return <span ref={ref} className="tabular-nums">{s}{prefix}{text}{suffix}</span>;
}
