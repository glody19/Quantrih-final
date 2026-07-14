import React, { useState, useEffect, useRef } from "react";
import datacenterBg from "../../assets/images/datacenter_background_1783804486565.jpg";

interface OrbitItem {
  id: string;
  label: string;
  accent: string;
  active: boolean;
  imageUrl: string;
}

const ORBIT_ITEMS: OrbitItem[] = [
  { 
    label: "PORTFOLIO\nBACKTEST", 
    accent: "#ef4444", 
    active: true, 
    id: "portfolio-backtest",
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80"
  },
  { 
    label: "ASSET\nALLOCATION", 
    accent: "#3b82f6", 
    active: false, 
    id: "asset-allocation",
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=300&q=80"
  },
  { 
    label: "MONTE\nCARLO", 
    accent: "#22c55e", 
    active: true, 
    id: "montecarlo",
    imageUrl: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=300&q=80"
  },
  { 
    label: "MARKET\nEQUITY", 
    accent: "#38bdf8", 
    active: false, 
    id: "market",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=300&q=80"
  },
  { 
    label: "ETF\nSCREENER", 
    accent: "#06b6d4", 
    active: true, 
    id: "etf-overview",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80"
  },
  { 
    label: "TACTICAL\nALLOCATION", 
    accent: "#fb923c", 
    active: false, 
    id: "tactical-allocation",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80"
  },
  { 
    label: "EDUCATION\nHUB", 
    accent: "#2dd4bf", 
    active: false, 
    id: "education",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80"
  },
  { 
    label: "BROKER\nPLATFORMS", 
    accent: "#c084fc", 
    active: false, 
    id: "platforms",
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=300&q=80"
  },
  { 
    label: "SUPPORT\nQUANTRIH", 
    accent: "#f472b6", 
    active: false, 
    id: "donate",
    imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=300&q=80"
  },
];

export const HexBadgeOrbit: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [time, setTime] = useState<number>(0);
  const isHoveredRef = useRef<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    isHoveredRef.current = hoveredIndex !== null;
  }, [hoveredIndex]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Butter-smooth continuous RAF animation loop
  useEffect(() => {
    let animationFrameId: number;
    const update = () => {
      setTime((prev) => {
        // Fast, dynamic planetary rotation
        const increment = isHoveredRef.current ? 0.003 : 0.012;
        return prev + increment;
      });
      animationFrameId = requestAnimationFrame(update);
    };
    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleCenterClick = () => {
    const el = document.getElementById("hero-gradient-title");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const size = 960;
  const cx = size / 2;
  const cy = size / 2;

  // Perfect 2D Circular Planetary Configuration - Squeezed tightly on mobile for clustered effect
  const r_base = isMobile ? 210 : 360;

  // Calculate position along the horizontal planetary ring
  const itemsWithOrbits = ORBIT_ITEMS.map((item, index) => {
    const angleOffset = (index * 2 * Math.PI) / ORBIT_ITEMS.length;
    const theta = time + angleOffset;

    const x = cx + r_base * Math.cos(theta);
    const y = cy + r_base * Math.sin(theta);

    const scale = 1.0;
    const opacity = 1.0;
    const zIndex = 50;

    return {
      ...item,
      x,
      y,
      scale,
      opacity,
      zIndex
    };
  });

  return (
    <div className="w-full py-12 px-4 sm:px-8 relative overflow-hidden flex flex-col items-center rounded-[3rem] border border-slate-800/50 bg-[#02050c]/90 shadow-[inset_0_0_80px_rgba(0,0,0,0.95)] max-w-6xl mx-auto my-6 min-h-[550px] md:min-h-0 justify-center">
      
      {/* Real dedicated background showing datacenter for Orbit section */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-45 bg-cover bg-center grayscale-[15%] contrast-[1.05]"
        style={{ backgroundImage: `url(${datacenterBg})` }}
      />
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#02050c] via-transparent to-[#02050c]" />

      {/* Self-contained custom styles mimicking the user's premium circular badge system */}
      <style>{`
        :root {
          --badge-bg: #0d1b2e;
          --badge-border: #1e3a52;
        }

        @keyframes dash-flow {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }

        @keyframes dash-flow-slow {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
        }

        .animate-dash-flow-fast {
          stroke-dasharray: 6 8;
          animation: dash-flow 1.2s linear infinite;
        }

        .animate-dash-flow-slow {
          stroke-dasharray: 4 8;
          animation: dash-flow-slow 6s linear infinite;
        }

        .badge-vanta {
          position: absolute;
          width: 172px;
          height: 172px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 16px;
          z-index: 30;
          cursor: pointer;
          overflow: hidden;
          border: 2.5px solid var(--accent-color);
          box-shadow: 
            0 12px 32px rgba(0,0,0,0.9), 
            0 0 15px rgba(0,0,0,0.6),
            inset 0 1px 3px rgba(255,255,255,0.2),
            inset 0 -1px 3px rgba(0,0,0,0.7);
          transition: border-color 0.4s ease, box-shadow 0.4s ease;
        }

        .badge-vanta::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(4, 8, 18, 0.4);
          z-index: 1;
          transition: opacity 0.3s ease;
        }

        .badge-vanta::after {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; height: 50%;
          background: linear-gradient(to bottom, rgba(255,255,255,0.12), transparent);
          border-radius: 172px 172px 0 0;
          pointer-events: none;
          z-index: 2;
        }

        .badge-vanta:hover::before {
          background: rgba(4, 8, 18, 0.2);
        }

        .badge-vanta:hover {
          box-shadow: 
            0 24px 38px rgba(0,0,0,0.95), 
            0 0 35px var(--accent-color),
            inset 0 1px 4px rgba(255,255,255,0.35);
          border-color: #ffffff;
        }

        .badge-vanta.active {
          box-shadow: 
            0 15px 32px rgba(0,0,0,0.85),
            0 0 22px var(--accent-color);
        }

        .badge-vanta span {
          position: relative;
          z-index: 10;
          font-size: 12.5px;
          font-weight: 900;
          line-height: 1.3;
          letter-spacing: 0.8px;
          color: #ffffff;
          text-shadow: 0 2px 5px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.8);
          text-transform: uppercase;
        }

        .orbit-center-hub {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200px;
          height: 200px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(circle, #2a1b05 0%, #150f02 70%, #060b15 100%);
          box-shadow: 
            0 15px 40px rgba(0,0,0,0.95),
            0 0 65px rgba(234,179,8,0.5), 
            inset 0 0 35px rgba(234,179,8,0.25);
          border: 2px solid rgba(251,191,36,0.75);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 40;
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease;
        }

        .orbit-center-hub::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-image: linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(4,8,18,0.2)), url(${datacenterBg});
          background-size: 150%;
          background-position: center;
          z-index: 1;
          opacity: 1.0;
          animation: panImage 40s linear infinite alternate;
        }
        @keyframes panImage {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }

        .orbit-center-hub:hover {
          transform: translate(-50%, -50%) scale(1.08);
          box-shadow: 
            0 25px 50px rgba(0,0,0,0.95),
            0 0 85px rgba(251,191,36,0.75), 
            inset 0 0 45px rgba(251,191,36,0.45);
          border-color: rgba(251,191,36,1);
        }

        .orbit-center-hub span {
          position: relative;
          z-index: 10;
          font-weight: 900;
          font-size: 24px;
          letter-spacing: 1px;
          color: #f4d675;
          text-shadow: 0 0 18px rgba(244,214,117,0.4), 0 2px 4px rgba(0,0,0,0.9);
        }

        .orbit-center-hub small {
          position: relative;
          z-index: 10;
          color: #93a3b5;
          font-size: 9.5px;
          margin-top: 4px;
          letter-spacing: 1.8px;
          font-weight: 700;
          text-transform: uppercase;
          text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        }

        @media (max-width: 1024px) {
          .orbit-container {
            transform: scale(0.8) !important;
            margin-top: -60px !important;
            margin-bottom: -60px !important;
          }
        }

        @media (max-width: 768px) {
          .orbit-container {
            transform: scale(0.7) !important;
            margin-top: -110px !important;
            margin-bottom: -110px !important;
          }
        }
        @media (max-width: 480px) {
          .orbit-container {
            transform: scale(0.6) !important;
            margin-top: -170px !important;
            margin-bottom: -170px !important;
          }
        }
        @media (max-width: 390px) {
          .orbit-container {
            transform: scale(0.55) !important;
            margin-top: -200px !important;
            margin-bottom: -200px !important;
          }
        }
        @media (max-width: 360px) {
          .orbit-container {
            transform: scale(0.52) !important;
            margin-top: -215px !important;
            margin-bottom: -215px !important;
          }
        }
      `}</style>

      {/* Decorative dynamic ambient glow behind entire section */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-blue-500/5 blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-yellow-500/4 blur-[140px] pointer-events-none" />

      {/* RESPONSIVE SCALE CONTAINER FOR ORBIT SYSTEM */}
      <div className="flex items-center justify-center w-[960px] h-[960px] relative my-4 orbit-container z-20 origin-center transition-all duration-300 shrink-0">
        
        {/* Futuristic Quantum Celestial Background Disc */}
        <div className="absolute inset-[15px] rounded-full bg-gradient-to-br from-[#020617] via-[#050b1a] to-[#010204] border-2 border-dashed border-sky-500/10 shadow-[0_0_120px_rgba(0,0,0,0.95)] pointer-events-none z-0 overflow-hidden">
          {/* Animated concentric glowing rings for deep sci-fi complexity */}
          <div className="absolute inset-[30px] rounded-full border border-sky-500/10 animate-[spin_120s_linear_infinite]" />
          <div className="absolute inset-[70px] rounded-full border border-[#f4d675]/5 animate-[spin_80s_linear_infinite_reverse]" />
          <div className="absolute inset-[110px] rounded-full border border-dashed border-sky-400/5" />
          <div className="absolute inset-[150px] rounded-full border border-slate-500/5" />
          
          {/* Data Center Server Racks Stack Visual Grid */}
          <div className="hidden sm:flex absolute inset-[40px] opacity-[0.25] group-hover:opacity-[0.32] transition-opacity duration-700 flex-col justify-between overflow-hidden pointer-events-none z-0 px-12 py-10 font-mono">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between w-full border-b border-sky-500/10 py-1 text-[8px] tracking-widest text-sky-400/60">
                {/* Rack Mounting Screw Accent */}
                <div className="w-1.5 h-1.5 rounded-full border border-sky-500/20 bg-slate-900 flex items-center justify-center shrink-0">
                  <div className="w-0.5 h-0.5 bg-slate-400 rounded-full" />
                </div>
                
                {/* Server unit model tag */}
                <span className="opacity-40 select-none hidden sm:inline">Q-NODE_{String(18 - i).padStart(2, '0')}</span>
                
                {/* Cooling vent slits */}
                <div className="flex-1 mx-4 flex gap-1 justify-center opacity-35 overflow-hidden h-3">
                  {Array.from({ length: 24 }).map((_, j) => (
                    <div key={j} className="w-[1.5px] h-full bg-gradient-to-b from-sky-400 to-transparent shrink-0" />
                  ))}
                </div>

                {/* Status LED panels */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[6px] text-emerald-400/80 animate-pulse hidden md:inline">ONLINE</span>
                  <div className={`w-1 h-1 rounded-full ${i % 3 === 0 ? 'bg-amber-500 animate-ping' : i % 3 === 1 ? 'bg-emerald-500 animate-pulse' : 'bg-sky-500 animate-pulse'}`} style={{ animationDuration: `${1.5 + (i % 3) * 0.5}s` }} />
                  <div className="w-1 h-1 rounded-full bg-emerald-400/80 animate-pulse" style={{ animationDuration: '0.8s' }} />
                  <div className="w-1 h-1 rounded-full bg-sky-400/60 hidden sm:inline" />
                </div>

                {/* Network Ports / Activity Blinker */}
                <div className="flex gap-0.5 ml-4 shrink-0">
                  {Array.from({ length: 4 }).map((_, k) => (
                    <div 
                      key={k} 
                      className={`w-[3px] h-[3px] rounded-sm ${
                        (i + k) % 3 === 0 ? 'bg-amber-400' : (i + k) % 3 === 1 ? 'bg-emerald-400 animate-pulse' : 'bg-[#1e293b]'
                      }`} 
                    />
                  ))}
                </div>

                {/* Rack Mounting Screw Accent */}
                <div className="w-1.5 h-1.5 rounded-full border border-sky-500/20 bg-slate-900 flex items-center justify-center shrink-0 ml-4">
                  <div className="w-0.5 h-0.5 bg-slate-400 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Neon cosmic radial highlights */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.06)_0%,rgba(99,102,241,0.02)_45%,transparent_75%)]" />
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.04)_0%,transparent_50%)]" />
          {/* Elegant gold glowing orbit path accent ring border */}
          <div className="absolute inset-0 rounded-full border-2 border-amber-500/15" />
        </div>

        {/* SVG connection lines and elegant orbital traces */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <svg viewBox="0 0 960 960" className="w-full h-full opacity-85">
            {/* Draw single main planetary orbit track (sun gold-yellow glow) and nested helper tracks */}
            <circle
              cx={cx}
              cy={cy}
              r={r_base}
              fill="none"
              stroke="rgba(234, 179, 8, 0.28)"
              strokeWidth="2.5"
              className="animate-dash-flow-slow"
            />
            <circle
              cx={cx}
              cy={cy}
              r={r_base - 18}
              fill="none"
              stroke="rgba(148, 163, 184, 0.08)"
              strokeWidth="1.2"
            />
            <circle
              cx={cx}
              cy={cy}
              r={r_base + 18}
              fill="none"
              stroke="rgba(148, 163, 184, 0.08)"
              strokeWidth="1.2"
            />

            {/* Glowing dynamic connector rays connecting nucleus center to active badge electrons */}
            {itemsWithOrbits.map((item, i) => {
              const isHovered = hoveredIndex === i;
              return (
                <line
                  key={`line-${item.id}`}
                  x1={cx}
                  y1={cy}
                  x2={item.x}
                  y2={item.y}
                  stroke={isHovered ? item.accent : "rgba(148, 163, 184, 0.12)"}
                  strokeWidth={isHovered ? "4" : "1.6"}
                  strokeOpacity={isHovered ? 1.0 : "0.45"}
                  className={isHovered ? "animate-dash-flow-fast transition-all" : "animate-dash-flow-slow transition-all"}
                  style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
                />
              );
            })}
          </svg>
        </div>

        {/* Central Clickable Hub ("QUANTRIH" Nucleus) */}
        <div onClick={handleCenterClick} className="orbit-center-hub">
          <span>QUANTRIH</span>
          <small>Scroll Top</small>
        </div>

        {/* Outer 3D orbiting badges representing the Atom's electrons */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {itemsWithOrbits.map((item, i) => {
            const isHovered = hoveredIndex === i;
            const isDonate = item.id === "donate";
            // Hovered badge gets additional scale factor on top of 3D depth scale
            const finalScale = isHovered ? item.scale * 1.16 : item.scale;

            return (
              <div
                key={item.id}
                style={{
                  position: "absolute",
                  left: `${item.x}px`,
                  top: `${item.y}px`,
                  width: "172px",
                  height: "172px",
                  transform: `translate(-50%, -50%) scale(${finalScale.toFixed(3)})`,
                  opacity: item.opacity,
                  zIndex: item.zIndex,
                  pointerEvents: "auto",
                  transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease"
                }}
                className="flex items-center justify-center cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onNavigate(item.id)}
              >
                <div className="w-[172px] h-[172px] flex items-center justify-center">
                  <div
                    className={`badge-vanta ${item.active ? "active" : ""}`}
                    style={{ 
                      "--accent-color": item.accent,
                      backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.15), rgba(4, 8, 18, 0.2)), url(${item.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    } as React.CSSProperties}
                  >
                    <span className={isDonate ? "pt-2 text-[10px] leading-tight opacity-90" : ""}>
                      {item.label.split("\n").map((line, idx) => (
                        <React.Fragment key={idx}>
                          {line}
                          {idx !== item.label.split("\n").length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
