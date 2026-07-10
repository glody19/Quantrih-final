import React, { useRef, useState, useEffect } from "react";

interface MobileZoomWrapperProps {
  children: React.ReactNode;
  scaleMobile: number; // e.g. 0.22, 0.25, 0.35
}

export function MobileZoomWrapper({ children, scaleMobile }: MobileZoomWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scaledHeight, setScaledHeight] = useState<number | string>("auto");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check if window is mobile size (sm is 640px in tailwind)
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile || !containerRef.current) {
      setScaledHeight("auto");
      return;
    }

    const updateHeight = () => {
      if (containerRef.current) {
        const originalHeight = containerRef.current.scrollHeight || containerRef.current.offsetHeight;
        setScaledHeight(originalHeight * scaleMobile);
      }
    };

    updateHeight();

    // Use ResizeObserver to detect internal changes (results loaded, graphs resizing, etc.)
    const observer = new ResizeObserver(() => {
      updateHeight();
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Fallback timer for delayed renders
    const timer = setTimeout(updateHeight, 300);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [isMobile, scaleMobile, children]);

  if (!isMobile) {
    return <>{children}</>;
  }

  const widthPercent = `${(100 / scaleMobile).toFixed(2)}%`;

  return (
    <div 
      style={{ 
        height: typeof scaledHeight === "number" ? `${scaledHeight}px` : scaledHeight, 
        overflow: "hidden",
        position: "relative",
        width: "100%"
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: widthPercent,
          transform: `scale(${scaleMobile})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
