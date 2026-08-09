import React, { useState, useEffect, useRef } from "react";

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
    label: "PLATFORMS", 
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
    const timeRef = useRef<number>(0);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);
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
      
      timeRef.current += isHoveredRef.current ? 0.003 : 0.012;
      const t = timeRef.current;
      const size = 960;
      const cx = size / 2;
      const cy = size / 2;
      const r_base = window.innerWidth < 768 ? 210 : 360;

      ORBIT_ITEMS.forEach((_, index) => {
        const angleOffset = (index * 2 * Math.PI) / ORBIT_ITEMS.length;
        const theta = t + angleOffset;
        const x = cx + r_base * Math.cos(theta);
        const y = cy + r_base * Math.sin(theta);
        
        const line = lineRefs.current[index];
        if (line) {
          line.setAttribute('x2', x.toString());
          line.setAttribute('y2', y.toString());
        }

        const badge = badgeRefs.current[index];
        if (badge) {
          badge.style.left = `${x}px`;
          badge.style.top = `${y}px`;
        }
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
  

  return (
    <div className="w-full py-12 px-4 sm:px-8 relative flex flex-col items-center max-w-6xl mx-auto my-6 min-h-[550px] md:min-h-0 justify-center">
      
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
          background-image: linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(4,8,18,0.2));
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

      {/* RESPONSIVE SCALE CONTAINER FOR ORBIT SYSTEM */}
      <div className="flex items-center justify-center w-[960px] h-[960px] relative my-4 orbit-container z-20 origin-center transition-all duration-300 shrink-0">
        
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
            {ORBIT_ITEMS.map((item, i) => {
              const isHovered = hoveredIndex === i;
              return (
                <line
                  key={`line-${item.id}`}
                  ref={(el) => { if (el) lineRefs.current[i] = el; }}
                  x1={cx}
                  y1={cy}
                  x2={0}
                  y2={0}
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
          {ORBIT_ITEMS.map((item, i) => {
            const isHovered = hoveredIndex === i;
            const isDonate = item.id === "donate";
            // Hovered badge gets additional scale factor on top of 3D depth scale
            const finalScale = isHovered ? 1.16 : 1.0;

            return (
              <div
                key={item.id}
                ref={(el) => { if (el) badgeRefs.current[i] = el; }}
                style={{
                  position: "absolute",
                  left: '0px',
                  top: '0px',
                  width: "172px",
                  height: "172px",
                  transform: `translate(-50%, -50%) scale(${finalScale.toFixed(3)})`,
                  opacity: 1,
                  zIndex: 50,
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
