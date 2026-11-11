import React, { useEffect, useRef } from "react";

/**
 * Floating bundle of optical fibres with glowing tips, drawn on a canvas.
 * Decorative background: pauses when off-screen or when the tab is hidden.
 */
export function FiberBackground({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let w = 0, h = 0, raf = 0, running = false, onScreen = true;

    type Strand = { a: number; len: number; bend: number; phase: number; speed: number; hue: number; size: number; bundle: number };
    let strands: Strand[] = [];

    const setup = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = Math.max(1, Math.round(w * dpr)); canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = w < 700 ? 150 : 320;
      strands = Array.from({ length: n }, (_, i) => {
        const bundle = i % 2; // two sprays leaving the knot in opposite directions
        return {
          a: (bundle ? Math.PI : 0) + (Math.random() - 0.5) * 1.5,
          len: 0.35 + Math.random() * 0.65,
          bend: (Math.random() - 0.5) * 0.9,
          phase: Math.random() * Math.PI * 2,
          speed: 0.25 + Math.random() * 0.5,
          hue: 215 + Math.random() * 45,
          size: 1 + Math.random() * 2.2,
          bundle,
        };
      });
    };

    const frame = (now: number) => {
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);
      // the knot drifts slowly so the whole bundle floats
      const kx = w * (0.56 + 0.05 * Math.sin(t * 0.21)), ky = h * (0.5 + 0.08 * Math.sin(t * 0.17 + 1));
      const reach = Math.max(w, h) * 0.75;
      ctx.lineCap = "round";
      for (const s of strands) {
        const sway = Math.sin(t * s.speed + s.phase);
        const a = s.a + sway * 0.12;
        const L = reach * s.len * (1 + 0.04 * Math.sin(t * 0.6 + s.phase));
        const tx = kx + Math.cos(a) * L, ty = ky + Math.sin(a) * L * 0.62;
        const cxp = kx + Math.cos(a + s.bend + sway * 0.25) * L * 0.5, cyp = ky + Math.sin(a + s.bend + sway * 0.25) * L * 0.4;
        ctx.strokeStyle = `hsla(${s.hue - 190}, 30%, 62%, 0.16)`; // warm copper core
        ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(kx, ky); ctx.quadraticCurveTo(cxp, cyp, tx, ty); ctx.stroke();
        const pulse = 0.55 + 0.45 * Math.sin(t * 1.6 + s.phase * 2);
        ctx.fillStyle = `hsla(${s.hue}, 90%, 68%, ${0.14 * pulse})`;
        ctx.beginPath(); ctx.arc(tx, ty, s.size * 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `hsla(${s.hue}, 95%, ${70 + pulse * 20}%, ${0.55 + 0.45 * pulse})`;
        ctx.beginPath(); ctx.arc(tx, ty, s.size, 0, Math.PI * 2); ctx.fill();
      }
      if (onScreen && !document.hidden) raf = requestAnimationFrame(frame); else running = false;
    };
    const start = () => { if (running || !onScreen || document.hidden) return; running = true; raf = requestAnimationFrame(frame); };
    const io = new IntersectionObserver((e) => { onScreen = e.some((x) => x.isIntersecting); if (onScreen) start(); });
    io.observe(canvas);
    const vis = () => { if (!document.hidden) start(); };
    document.addEventListener("visibilitychange", vis);
    const ro = new ResizeObserver(setup); ro.observe(canvas);
    setup(); start();
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); document.removeEventListener("visibilitychange", vis); };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={"absolute inset-0 w-full h-full pointer-events-none " + (className || "")} />;
}
