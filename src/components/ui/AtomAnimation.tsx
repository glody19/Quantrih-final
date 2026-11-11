import React, { useEffect, useRef } from "react";

type RGB = [number, number, number];

// Three-colour palettes; the sphere cross-fades from one to the next and jumps on click.
const DARK_PALETTES: [RGB, RGB, RGB][] = [
  [[45, 212, 191], [56, 189, 248], [236, 254, 255]], // teal, sky, ice
  [[139, 124, 246], [96, 165, 250], [240, 240, 255]], // violet, blue, white
  [[52, 211, 153], [226, 184, 79], [255, 251, 235]], // emerald, gold, cream
  [[244, 114, 182], [167, 139, 250], [255, 241, 250]], // pink, lilac, white
];
const LIGHT_PALETTES: [RGB, RGB, RGB][] = [
  [[13, 148, 136], [37, 99, 235], [30, 41, 59]],
  [[91, 75, 219], [14, 116, 144], [30, 27, 75]],
  [[5, 150, 105], [180, 138, 46], [41, 37, 36]],
  [[190, 24, 93], [109, 40, 217], [49, 46, 129]],
];

const DEPTH_LEVELS = 5;
const SYMBOLS = ["$", "€", "%", "£", "¥"];

interface Spike {
  x: number; y: number; z: number; // unit direction
  len: number;    // relative length
  phase: number;  // breathing phase
  color: 0 | 1 | 2;
  char: string;
  kick: number;   // extra extension from click / cursor, decays
}

/**
 * A dense sphere of numbers carried on radial spikes (sea-urchin look) that rotates in 3D,
 * breathes, cycles through three-colour palettes and bursts when clicked.
 */
export const AtomAnimation: React.FC<{ className?: string; fullScreen?: boolean; isHovered?: boolean; variant?: "dark" | "light" }> = ({ className, isHovered, variant = "dark" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef(isHovered);
  useEffect(() => { hoverRef.current = isHovered; }, [isHovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    const palettes = variant === "light" ? LIGHT_PALETTES : DARK_PALETTES;
    let width = 0, height = 0, raf = 0;
    let spikes: Spike[] = [];
    const mouse = { x: -9999, y: -9999, active: false };

    const setup = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(width, height) < 420 ? 800 : 1900;
      const golden = Math.PI * (3 - Math.sqrt(5));
      spikes = Array.from({ length: count }, (_, i) => {
        // Fibonacci sphere: even coverage without clumps
        const y = 1 - (i / (count - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const a = golden * i;
        return {
          x: Math.cos(a) * r, y, z: Math.sin(a) * r,
          len: 0.74 + Math.random() * 0.32,
          phase: Math.random() * Math.PI * 2,
          color: (i % 7 === 0 ? 2 : i % 2) as 0 | 1 | 2,
          char: String(Math.floor(Math.random() * 10)),
          kick: 0,
        };
      });
    };

    let angleY = 0, angleX = 0.35;
    let palette = 0, nextPalette = 1, mix = 0;
    let burst = 0;
    let t0 = performance.now();

    // Percent figures that drift in from outside and sink into the nucleus.
    // Mostly gains (green), now and then a loss (burgundy), like a real market.
    type Flow = { a: number; b: number; d: number; txt: string; up: boolean; speed: number };
    const flows: Flow[] = [];
    let spawnIn = 0;
    const spawn = () => {
      const up = Math.random() < 0.72;
      const v = up ? 0.2 + Math.random() * 4.8 : 0.2 + Math.random() * 3.2;
      flows.push({ a: Math.random() * Math.PI * 2, b: (Math.random() - 0.5) * 1.4, d: 1.32, txt: (up ? "+" : "-") + v.toFixed(2) + "%", up, speed: 0.0042 + Math.random() * 0.003 });
    };

    // Buckets reused every frame: [depth][colour] -> flat coordinate list
    const lineBuckets: number[][][] = Array.from({ length: DEPTH_LEVELS }, () => [[], [], []]);
    const textBuckets: { x: number; y: number; c: string }[][][] = Array.from({ length: DEPTH_LEVELS }, () => [[], [], []]);

    const frame = (now: number) => {
      const dt = Math.min(50, now - t0) / 16.67;
      t0 = now;
      const time = now / 1000;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2, cy = height / 2;
      const R = Math.min(width, height) * 0.35;
      const inner = R * 0.56;
      const speed = hoverRef.current ? 2.2 : 1;
      angleY += (0.0032 + burst * 0.02) * speed * dt;
      angleX += (0.0011 + burst * 0.008) * speed * dt;
      burst = Math.max(0, burst - 0.018 * dt);

      mix += (0.0022 + burst * 0.03) * dt;
      if (mix >= 1) { mix = 0; palette = nextPalette; nextPalette = (nextPalette + 1) % palettes.length; }
      const colors = [0, 1, 2].map((i) => {
        const a = palettes[palette][i], b = palettes[nextPalette][i];
        return `${Math.round(a[0] + (b[0] - a[0]) * mix)},${Math.round(a[1] + (b[1] - a[1]) * mix)},${Math.round(a[2] + (b[2] - a[2]) * mix)}`;
      });

      const cosY = Math.cos(angleY), sinY = Math.sin(angleY), cosX = Math.cos(angleX), sinX = Math.sin(angleX);
      for (let d = 0; d < DEPTH_LEVELS; d++) for (let c = 0; c < 3; c++) { lineBuckets[d][c].length = 0; textBuckets[d][c].length = 0; }

      for (const s of spikes) {
        const x1 = s.x * cosY - s.z * sinY;
        const z1 = s.z * cosY + s.x * sinY;
        const y1 = s.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + s.y * sinX; // -1 (near) .. 1 (far)

        // breathing wave + click burst + cursor push
        const wave = 1 + 0.07 * Math.sin(time * 1.4 + s.phase) + 0.05 * Math.sin(time * 0.6 + s.x * 4 + s.y * 3);
        const persp = 1 / (1 + z2 * 0.28);
        const burstExt = burst * 0.5 * (0.5 + 0.5 * Math.sin(s.phase * 3));
        if (mouse.active) {
          const e0 = s.len * wave + s.kick + burstExt;
          const dx = cx + x1 * R * e0 * persp - mouse.x, dy = cy + y1 * R * e0 * persp - mouse.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 150 * 150) s.kick = Math.min(0.45, s.kick + (1 - Math.sqrt(dist2) / 150) * 0.06);
        }
        s.kick *= 0.94;
        const ext = s.len * wave + s.kick + burstExt;

        const depth = Math.min(DEPTH_LEVELS - 1, Math.max(0, Math.floor(((1 - z2) / 2) * DEPTH_LEVELS))); // 0 far .. 4 near
        lineBuckets[depth][s.color].push(cx + x1 * inner * persp, cy + y1 * inner * persp, cx + x1 * R * ext * persp, cy + y1 * R * ext * persp);
        if (burst > 0.2 && Math.random() < burst * 0.08) s.char = SYMBOLS[(Math.random() * SYMBOLS.length) | 0];
        else if (Math.random() < 0.002) s.char = String((Math.random() * 10) | 0);
        textBuckets[depth][s.color].push({ x: cx + x1 * R * (ext + 0.035) * persp, y: cy + y1 * R * (ext + 0.035) * persp, c: s.char });
      }

      // soft core glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.75);
      glow.addColorStop(0, `rgba(${colors[0]},${variant === "light" ? 0.1 : 0.16})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // back to front: spikes then digits for each depth slice
      ctx.lineCap = "round";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let d = 0; d < DEPTH_LEVELS; d++) {
        const k = d / (DEPTH_LEVELS - 1); // 0 far .. 1 near
        ctx.lineWidth = 0.6 + k * 1.9;
        for (let c = 0; c < 3; c++) {
          const seg = lineBuckets[d][c];
          if (!seg.length) continue;
          ctx.strokeStyle = `rgba(${colors[c]},${(0.14 + k * 0.5).toFixed(2)})`;
          ctx.beginPath();
          for (let i = 0; i < seg.length; i += 4) { ctx.moveTo(seg[i], seg[i + 1]); ctx.lineTo(seg[i + 2], seg[i + 3]); }
          ctx.stroke();
        }
        ctx.font = `500 ${Math.round(7 + k * 7)}px "JetBrains Mono", ui-monospace, monospace`;
        for (let c = 0; c < 3; c++) {
          const items = textBuckets[d][c];
          if (!items.length) continue;
          // near digits use the lightest palette colour so they stand out against the spikes
          ctx.fillStyle = `rgba(${k > 0.6 ? colors[2] : colors[c]},${(0.25 + k * 0.75).toFixed(2)})`;
          for (const it of items) ctx.fillText(it.c, it.x, it.y);
        }
      }

      // percent figures on their way to the core
      spawnIn -= dt;
      if (spawnIn <= 0 && flows.length < 12) { spawn(); spawnIn = 22 + Math.random() * 26; }
      const light = variant === "light";
      ctx.font = `600 ${Math.max(11, Math.round(R * 0.075))}px "JetBrains Mono", ui-monospace, monospace`;
      for (let i = flows.length - 1; i >= 0; i--) {
        const f = flows[i];
        f.d -= f.speed * dt;
        f.a += 0.0015 * dt;
        if (f.d <= 0.12) { flows.splice(i, 1); continue; }
        const x = cx + Math.cos(f.a) * R * f.d;
        const y = cy + Math.sin(f.a) * R * f.d * 0.82 + f.b * R * 0.15 * f.d;
        const alpha = Math.min(1, (1.32 - f.d) * 4) * Math.min(1, (f.d - 0.12) * 2.2);
        const col = f.up ? (light ? "5,150,105" : "52,211,153") : (light ? "159,18,57" : "225,29,72");
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = `rgba(${col},0.8)`;
        ctx.shadowBlur = 10;
        ctx.fillStyle = `rgb(${col})`;
        const k = 0.55 + 0.45 * f.d;
        ctx.translate(x, y);
        ctx.scale(k, k);
        ctx.fillText(f.txt, 0, 0);
        ctx.restore();
      }

      if (onScreen && !document.hidden) raf = requestAnimationFrame(frame);
      else running = false;
    };

    // Pause when off-screen or when the tab is hidden
    let onScreen = true, running = false;
    const start = () => {
      if (running || !onScreen || document.hidden) return;
      running = true;
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver((entries) => { onScreen = entries.some((e) => e.isIntersecting); if (onScreen) start(); });
    io.observe(canvas);
    const onVisibility = () => { if (!document.hidden) start(); };
    document.addEventListener("visibilitychange", onVisibility);

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      // the canvas may be CSS-scaled by its parents: map back to canvas coordinates
      mouse.x = ((e.clientX - r.left) / r.width) * width;
      mouse.y = ((e.clientY - r.top) / r.height) * height;
      mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; };
    const onClick = () => {
      burst = 1;
      mix = 0;
      palette = nextPalette;
      nextPalette = (nextPalette + 1) % palettes.length;
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("click", onClick);

    const ro = new ResizeObserver(() => setup());
    ro.observe(canvas);
    setup();
    start();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, [variant]);

  return (
    <div className={"relative w-full h-full flex items-center justify-center " + (className || "")}>
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer" aria-hidden="true" />
    </div>
  );
};
