import React, { useEffect, useRef } from "react";

/**
 * Bundle of optical fibres: thin strands twist through a knot and fan out, each ending in a
 * glowing blue point, with a few out-of-focus points in front and behind. Drawn on a canvas,
 * it drifts slowly. `light` is tuned for white backgrounds. Pauses off-screen.
 */
export function FiberBackground({ className, light = false, side = "right" }: { className?: string; light?: boolean; side?: "left" | "right" }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let w = 0, h = 0, raf = 0, running = false, onScreen = true;

    type Strand = { fan: number; len: number; curl: number; phase: number; speed: number; hue: number; size: number; blur: number; src: number };
    let strands: Strand[] = [];

    const setup = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = Math.max(1, Math.round(w * dpr)); canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = w < 700 ? 170 : 420;
      strands = Array.from({ length: n }, () => {
        const blurred = Math.random() < 0.14;
        return {
          fan: (Math.random() - 0.5) * 2,            // position inside the fan, -1..1
          len: 0.45 + Math.pow(Math.random(), 0.7) * 0.55,
          curl: (Math.random() - 0.5) * 0.5,
          phase: Math.random() * Math.PI * 2,
          speed: 0.2 + Math.random() * 0.45,
          hue: 218 + Math.random() * 34,              // blue to violet
          size: blurred ? 3.5 + Math.random() * 5 : 1.1 + Math.random() * 1.7,
          blur: blurred ? 1 : 0,
          src: Math.random(),                         // where on the incoming rope it starts
        };
      });
    };

    const frame = (now: number) => {
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);
      const dir = side === "right" ? 1 : -1;
      // rope enters from one edge, passes through a drifting knot, then fans out towards the other side
      const kx = w * (side === "right" ? 0.72 : 0.28) + Math.sin(t * 0.19) * w * 0.03;
      const ky = h * (0.48 + 0.07 * Math.sin(t * 0.15 + 1));
      const ox = side === "right" ? w * 1.06 : -w * 0.06;
      const oy = h * (0.9 + 0.04 * Math.sin(t * 0.2));
      const reach = Math.max(w * 0.6, h * 0.9);
      ctx.lineCap = "round";
      for (const s of strands) {
        const sway = Math.sin(t * s.speed + s.phase);
        const ang = Math.PI * (side === "right" ? 1 : 0) + dir * (s.fan * 0.95 + sway * 0.07) - 0.12;
        const L = reach * s.len;
        const tx = kx + Math.cos(ang) * L, ty = ky + Math.sin(ang) * L * 0.8;
        const c1x = ox + (kx - ox) * 0.55, c1y = oy + (ky - oy) * (0.2 + s.src * 0.5);
        const c2x = kx + Math.cos(ang + s.curl + sway * 0.18) * L * 0.45, c2y = ky + Math.sin(ang + s.curl + sway * 0.18) * L * 0.36;
        ctx.strokeStyle = light ? `rgba(120,88,70,${s.blur ? 0.06 : 0.2})` : `rgba(196,160,140,${s.blur ? 0.05 : 0.17})`;
        ctx.lineWidth = s.blur ? 1.2 : 0.7;
        ctx.beginPath();
        ctx.moveTo(ox, oy + (s.src - 0.5) * 30);
        ctx.quadraticCurveTo(c1x, c1y, kx, ky);
        ctx.quadraticCurveTo(c2x, c2y, tx, ty);
        ctx.stroke();
        const pulse = 0.6 + 0.4 * Math.sin(t * 1.5 + s.phase * 2);
        if (s.blur) {
          ctx.fillStyle = `hsla(${s.hue}, 85%, ${light ? 62 : 66}%, ${(light ? 0.16 : 0.2) * pulse})`;
          ctx.beginPath(); ctx.arc(tx, ty, s.size, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = `hsla(${s.hue}, 90%, 64%, ${(light ? 0.13 : 0.16) * pulse})`;
          ctx.beginPath(); ctx.arc(tx, ty, s.size * 3, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `hsla(${s.hue}, 92%, ${light ? 56 + pulse * 10 : 68 + pulse * 20}%, ${0.6 + 0.4 * pulse})`;
          ctx.beginPath(); ctx.arc(tx, ty, s.size, 0, Math.PI * 2); ctx.fill();
        }
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
  }, [light, side]);

  return <canvas ref={ref} aria-hidden="true" className={"absolute inset-0 w-full h-full pointer-events-none " + (className || "")} />;
}
