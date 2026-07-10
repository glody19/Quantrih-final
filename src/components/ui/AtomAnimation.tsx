import React, { useEffect, useRef } from 'react';

export const AtomAnimation: React.FC<{ className?: string, fullScreen?: boolean, isHovered?: boolean }> = ({ className, fullScreen, isHovered }) => {
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const mouseRef = useRef({ x: -1000, y: -1000, active: false });

 // Use a ref to feed isHovered into the loop cleanly
 const globalHoverRef = useRef(isHovered);
 useEffect(() => { globalHoverRef.current = isHovered; }, [isHovered]);

 useEffect(() => {
 const canvas = canvasRef.current;
 if (!canvas) return;

 const ctx = canvas.getContext('2d', { alpha: true });
 if (!ctx) return;

 
 let animationFrameId: number;
 let width = 0;
 let height = 0;
 
 // Scale for High-DPI screens
 const setupCanvas = () => {
 const dpr = window.devicePixelRatio || 1;
 width = canvas.offsetWidth;
 height = canvas.offsetHeight;
 canvas.width = width * dpr;
 canvas.height = height * dpr;
 ctx.scale(dpr, dpr);
 };
 setupCanvas();


 class Node {
 x: number;
 y: number;
 z: number;
 baseX: number;
 baseY: number;
 baseZ: number;
 colorType: number;
 val: string;

 constructor(x: number, y: number, z: number, colorType: number, val: string) {
 this.baseX = x;
 this.baseY = y;
 this.baseZ = z;
 this.x = x;
 this.y = y;
 this.z = z;
 this.colorType = colorType;
 this.val = val;
 }
 }

 class GravityParticle {
 x: number;
 y: number;
 z: number;
 val: string;
 speed: number;
 opacity: number;
 glow: boolean;
 color: string;
 
 constructor(cx: number, startY: number, containerWidth: number) {
 // Spawn from the full width of the plateau (plateau is 70% of max 950px, but scaled by container width)
 const plateauWidth = Math.min(containerWidth, 950) * 0.7;
 this.x = cx + (Math.random() - 0.5) * plateauWidth * 0.9; // 90% of plateau width to not exceed
 this.y = startY + Math.random() * 20;
 this.z = (Math.random() - 0.5) * 200; // tighter depth
 
 const isPositive = Math.random() > 0.1; // 90% green
 const randNum = Math.random();
 
 const baseNum = (Math.random() * 15).toFixed(2);
 const twentyNum = (20 + Math.random() * 9.99).toFixed(2);
 const thirtyNum = (30 + Math.random() * 9.99).toFixed(2);
 let numberStr = baseNum;
 
 if (isPositive) {
 if (randNum < 0.1) {
 numberStr = thirtyNum;
 } else if (randNum < 0.3) {
 numberStr = twentyNum;
 }
 }
 
 this.val = isPositive ? `+${numberStr}%` : `-${numberStr}%`;
 this.color = isPositive ? 'rgba(34, 197, 94, ' : 'rgba(239, 68, 68, '; 
 
 this.speed = 0.5 + Math.random() * 1.5; // Slower basic speed
 this.opacity = 0;
 this.glow = Math.random() > 0.5;
 }
 }

 let nodes: Node[] = [];
 let gravityParticles: GravityParticle[] = [];
 
 const init = () => {
 nodes = [];
 gravityParticles = [];
 const numNodes = 1000; // Optimized for fluidity
 const radius = Math.min(width, height) * 0.42; // Adequate atom size
 const cx = width / 2;
 
 // Initialize Gravity Particles
 for (let i = 0; i < 20; i++) {
 gravityParticles.push(new GravityParticle(cx, height, width));
 }

 
 const phi = Math.PI * (3 - Math.sqrt(5));

 for (let i = 0; i < numNodes; i++) {
 const y = 1 - (i / (numNodes - 1)) * 2;
 const r = Math.sqrt(1 - y * y);
 const theta = phi * i;

 const actualRadius = radius * (0.8 + Math.random() * 0.2);

 const x = Math.cos(theta) * r * actualRadius;
 const z = Math.sin(theta) * r * actualRadius;
 const yScaled = y * actualRadius;
 
 let colorType = 0;
 if (Math.random() > 0.7) colorType = 1;
 if (Math.random() > 0.9) colorType = 2;

 const val = Math.floor(Math.random() * 10).toString();
 nodes.push(new Node(x, yScaled, z, colorType, val));
 
 if (Math.random() > 0.4) {
 const innerRadius = actualRadius * (0.2 + Math.random() * 0.6);
 const ix = Math.cos(theta) * r * innerRadius;
 const iz = Math.sin(theta) * r * innerRadius;
 const iy = y * innerRadius;
 nodes.push(new Node(ix, iy, iz, colorType, Math.floor(Math.random() * 10).toString()));
 }
 }
 };

 let angleY = 0;
 let angleX = 0;

 let quantumBurst = 0;
 const financeSymbols = ['$', '€', '£', '¥', '∞', 'Δ', 'Σ', 'Φ', '1', '0'];

 let colorIndex = 0;
 let nextColorIndex = 1;
 let colorProgress = 0;
 let hoverScale = 1;

 const palettes = [
 [ [6, 182, 212], [59, 130, 246], [255, 255, 255] ],
 [ [34, 197, 94], [16, 185, 129], [255, 255, 255] ],
 [ [255, 255, 255], [200, 200, 200], [150, 150, 150] ],
 [ [59, 130, 246], [37, 99, 235], [255, 255, 255] ],
 [ [168, 85, 247], [139, 92, 246], [255, 255, 255] ]
 ];

 const animate = () => {
 ctx.clearRect(0, 0, width, height);

 const cx = width / 2;
 const cy = height / 2;
 
 const targetHoverScale = globalHoverRef.current ? 1.05 : 1; // Slight hover zoom
 hoverScale += (targetHoverScale - hoverScale) * 0.05;

 angleY += (0.0035 + (quantumBurst * 0.005)) * (globalHoverRef.current ? 3.5 : 1);
 angleX += (0.0015 + (quantumBurst * 0.005)) * (globalHoverRef.current ? 3.5 : 1);

 if (quantumBurst > 0) {
 quantumBurst -= 0.02;
 if (quantumBurst < 0) quantumBurst = 0;
 }

 colorProgress += 0.003 + (quantumBurst * 0.02);
 if (colorProgress >= 1) {
 colorProgress -= 1;
 colorIndex = nextColorIndex;
 nextColorIndex = (nextColorIndex + 1) % palettes.length;
 }

 const currentColors = [0, 1, 2].map(i => {
 const c1 = palettes[colorIndex][i];
 const c2 = palettes[nextColorIndex][i];
 const r = Math.round(c1[0] + (c2[0] - c1[0]) * colorProgress);
 const g = Math.round(c1[1] + (c2[1] - c1[1]) * colorProgress);
 const b = Math.round(c1[2] + (c2[2] - c1[2]) * colorProgress);
 return `${r}, ${g}, ${b}`;
 });

 
 
 const titleEl = document.getElementById('hero-gradient-title');
 if (titleEl) {
 titleEl.style.backgroundImage = `linear-gradient(to right, rgb(${currentColors[0]}), rgb(${currentColors[1]}))`;
 }

 const cosY = Math.cos(angleY);
 const sinY = Math.sin(angleY);
 const cosX = Math.cos(angleX);
 const sinX = Math.sin(angleX);
 const fov = 1000;

 const projectedNodes = nodes.map(node => {
 let x1 = node.baseX * cosY - node.baseZ * sinY;
 let z1 = node.baseZ * cosY + node.baseX * sinY;
 
 let y1 = node.baseY * cosX - z1 * sinX;
 let z2 = z1 * cosX + node.baseY * sinX;
 
 const scale = fov / (fov + z2);
 
 return {
 nodeRef: node,
 x: cx + x1 * scale * hoverScale,
 y: cy + y1 * scale * hoverScale,
 scale: scale * hoverScale,
 z2: z2,
 colorType: node.colorType
 };
 });
 
 projectedNodes.sort((a, b) => b.z2 - a.z2);

 const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.12);
 coreGradient.addColorStop(0, `rgba(${currentColors[0]}, 0.15)`);
 coreGradient.addColorStop(1, 'transparent');
 ctx.fillStyle = coreGradient;
 ctx.fillRect(0, 0, width, height);

 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 
 let currentFont = "";
 let currentFillStyle = "";
 let currentStrokeStyle = "";

 const mx = mouseRef.current.x;
 const my = mouseRef.current.y;
 const mActive = mouseRef.current.active;

 projectedNodes.forEach(pNode => {
 if (pNode.z2 < -fov + 50) return;
 
 let finalX = pNode.x;
 let finalY = pNode.y;
 let interactScale = 0;

 // Quantum Burst Value Shift
 if (quantumBurst > 0) {
 if (Math.random() < quantumBurst) {
 pNode.nodeRef.val = financeSymbols[Math.floor(Math.random() * financeSymbols.length)];
 }
 }

 if (mActive) {
 const dx = finalX - mx;
 const dy = finalY - my;
 const dist = Math.sqrt(dx * dx + dy * dy);
 if (dist < 180) {
 interactScale = (180 - dist) / 180;
 // Repel effect
 finalX += (dx / dist) * interactScale * 60;
 finalY += (dy / dist) * interactScale * 60;
 
 // Matrix glitch effect: rapidly change numbers near cursor
 if (Math.random() < 0.2) {
 pNode.nodeRef.val = Math.floor(Math.random() * 10).toString();
 }
 }
 }

 const rawOpacity = Math.max(0.1, Math.min(1, 1 - (pNode.z2 + 200) / 600));
 // Quantize opacity and scale to reduce CSS string generation and state changes
 const opacity = Math.round(rawOpacity * 10) / 10;
 const fontSize = Math.max(6, Math.floor(10 * pNode.scale + (interactScale * 4)));
 const rgb = currentColors[pNode.colorType];
 
 // Draw Ray
 const rayOpacity = Math.round(opacity * 0.3 * 10) / 10;
 const newStrokeStyle = `rgba(${rgb}, ${rayOpacity})`;
 if (currentStrokeStyle !== newStrokeStyle) {
 ctx.strokeStyle = newStrokeStyle;
 currentStrokeStyle = newStrokeStyle;
 }
 ctx.lineWidth = interactScale > 0 ? 1 + interactScale * 2 : 0.5;
 ctx.beginPath();
 ctx.moveTo(cx, cy);
 ctx.lineTo(finalX, finalY);
 ctx.stroke();

 // Connect to mouse if very close
 if (mActive && interactScale > 0.4) {
 ctx.beginPath();
 ctx.moveTo(finalX, finalY);
 ctx.lineTo(mx, my);
 ctx.stroke();
 }

 // Draw Digit
 const textOpacity = Math.min(1, opacity + interactScale);
 const newFillStyle = `rgba(${rgb}, ${textOpacity})`;
 if (currentFillStyle !== newFillStyle) {
 ctx.fillStyle = newFillStyle;
 currentFillStyle = newFillStyle;
 }

 const newFont = `300 ${fontSize}px "Space Grotesk", "JetBrains Mono", monospace`;
 if (currentFont !== newFont) {
 ctx.font = newFont;
 currentFont = newFont;
 }

 ctx.fillText(pNode.nodeRef.val, finalX, finalY);
 });

 // Update and draw gravity particles
 gravityParticles.forEach(p => {
 p.y -= p.speed; // move up
 
 const dx = cx - p.x;
 const dy = cy - p.y;
 
 // Gravitational pull logic strongly affecting elements when they pass certain heights
 if (p.y < height * 0.9) {
 p.x += dx * (0.004 + p.speed * 0.002); // Pull horizontally towards center X in a curved manner
 p.speed += 0.015; // Accelerate upwards progressively
 }

 p.opacity = Math.min(1, p.opacity + 0.02);

 // Absorption logic (Disappear at middle point)
 if (p.y <= cy) { 
 // Reset particle at bottom
 const plateauWidth = Math.min(width, 950) * 0.7;
 p.x = cx + (Math.random() - 0.5) * plateauWidth * 0.9;
 p.y = height + Math.random() * 20;
 p.z = (Math.random() - 0.5) * 200;
 
 const isPositive = Math.random() > 0.1;
 const randNum = Math.random();
 const baseNum = (Math.random() * 15).toFixed(2);
 let numberStr = baseNum;
 if (isPositive) {
 if (randNum < 0.1) numberStr = (30 + Math.random() * 9.99).toFixed(2);
 else if (randNum < 0.3) numberStr = (20 + Math.random() * 9.99).toFixed(2);
 }
 p.val = isPositive ? `+${numberStr}%` : `-${numberStr}%`;
 p.color = isPositive ? 'rgba(34, 197, 94, ' : 'rgba(239, 68, 68, ';
 
 p.speed = 0.5 + Math.random() * 1.5;
 p.opacity = 0;
 
 // Minor quantum burst response on absorption
 if (p.glow) quantumBurst = Math.min(1.0, quantumBurst + 0.005);
 }

 // Simple projection for gravity text
 const scale = fov / (fov + Math.max(-fov/1.5, p.z));
 const projectedX = cx + (p.x - cx) * scale;
 const projectedY = cy + (p.y - cy) * scale;

 const baseOpacity = Math.max(0, 1 - Math.abs(p.z) / 400) * p.opacity;
 if (baseOpacity <= 0) return;

 const fontSize = Math.max(9, Math.floor(13 * scale));
 
 if (p.glow) {
 ctx.fillStyle = p.color + baseOpacity + ')';
 ctx.shadowBlur = 15;
 ctx.shadowColor = p.color + baseOpacity + ')';
 } else {
 ctx.fillStyle = p.color + (baseOpacity * 0.5) + ')';
 ctx.shadowBlur = 0;
 }

 ctx.font = `600 ${fontSize}px "Space Grotesk", monospace`;
 ctx.fillText(p.val, projectedX, projectedY);
 });
 
 // Draw Central Sun / Core - micro and stylish
 const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5; // 0 to 1
 
 // Core center - micro
 ctx.beginPath();
 ctx.arc(cx, cy, 0.4 + pulse * 0.6, 0, Math.PI * 2);
 ctx.fillStyle = `rgba(255, 255, 255, ${0.9 + pulse * 0.1})`;
 ctx.shadowBlur = 8 + pulse * 10;
 ctx.shadowColor = '#06b6d4';
 ctx.fill();
 
 // Inner subtle glow
 ctx.beginPath();
 ctx.arc(cx, cy, 1.5 + pulse * 1.5, 0, Math.PI * 2);
 ctx.fillStyle = `rgba(6, 182, 212, ${0.4 - pulse * 0.1})`;
 ctx.shadowBlur = 0;
 ctx.fill();
 
 // Secondary tiny orbiting quantum particles (micro stylistic rings)
 for(let j=0; j<3; j++) {
 const orbitAngle = Date.now() * (0.0015 + j*0.0005) + (j * Math.PI * 2 / 3);
 const orbitRadius = 6 + j * 2.5; // Tighter orbits
 ctx.beginPath();
 ctx.arc(cx + Math.cos(orbitAngle) * orbitRadius, cy + Math.sin(orbitAngle) * orbitRadius, 0.3 + Math.random()*0.3, 0, Math.PI * 2);
 ctx.fillStyle = j === 0 ? '#3b82f6' : (j===1 ? '#a855f7' : '#06b6d4');
 ctx.shadowBlur = 3;
 ctx.shadowColor = j === 0 ? '#3b82f6' : (j===1 ? '#a855f7' : '#06b6d4');
 ctx.fill();
 }
 
 ctx.shadowBlur = 0;

 animationFrameId = requestAnimationFrame(animate);
 };

 const handleResize = () => {
 setupCanvas();
 init();
 };

 const handleMouseMove = (e: MouseEvent) => {
 const rect = canvas.getBoundingClientRect();
 mouseRef.current = {
 x: e.clientX - rect.left,
 y: e.clientY - rect.top,
 active: true
 };
 };

 const handleMouseLeave = () => {
 mouseRef.current.active = false;
 };

 const handleMouseClick = () => {
 quantumBurst = 1.0;
 
 // Play dramatic quantum effect - force all values to finance symbols momentarily
 nodes.forEach(n => {
 if (Math.random() > 0.5) {
 n.val = financeSymbols[Math.floor(Math.random() * financeSymbols.length)];
 }
 });
 };

 const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length > 0) {
   const rect = canvas.getBoundingClientRect();
   const touch = e.touches[0];
   mouseRef.current = {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
    active: true
   };
   handleMouseClick();
  }
 };

 const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length > 0) {
   e.preventDefault();
   const rect = canvas.getBoundingClientRect();
   const touch = e.touches[0];
   mouseRef.current = {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
    active: true
   };
  }
 };

 const handleTouchEnd = () => {
  mouseRef.current.active = false;
 };

 canvas.addEventListener('mousemove', handleMouseMove);
 canvas.addEventListener('mouseleave', handleMouseLeave);
 canvas.addEventListener('mousedown', handleMouseClick);
 canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
 canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
 canvas.addEventListener('touchend', handleTouchEnd);

 const resizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
   const { width: entryWidth, height: entryHeight } = entry.contentRect;
   if (entryWidth > 0 && entryHeight > 0) {
    handleResize();
   }
  }
 });
 resizeObserver.observe(canvas);

 init();
 animate();

 return () => {
 cancelAnimationFrame(animationFrameId);
 resizeObserver.disconnect();
 canvas.removeEventListener('mousemove', handleMouseMove);
 canvas.removeEventListener('mouseleave', handleMouseLeave);
 canvas.removeEventListener('mousedown', handleMouseClick);
 canvas.removeEventListener('touchstart', handleTouchStart);
 canvas.removeEventListener('touchmove', handleTouchMove);
 canvas.removeEventListener('touchend', handleTouchEnd);
 };
 }, []);

 return (
 <div className={"w-full h-full flex flex-col items-center justify-center relative " + (className || "")}>
 {/* Ambient glowing background aura */}
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#06b6d4]/5 to-transparent blur-3xl pointer-events-none" />
 
 {/* Interactive 3D Canvas */}
 <canvas 
 ref={canvasRef} 
 className={"w-full h-full cursor-crosshair z-10 " + (fullScreen ? "" : "max-w-[950px] max-h-[950px] min-h-[480px]")}
 />
 {/* Flat discreet base shadow */}
 <div className="absolute -bottom-[2%] left-1/2 -translate-x-1/2 w-[60%] h-1.5 pointer-events-none z-0">
 <div className="w-full h-full rounded-[50%] opacity-20"
 style={{ 
 background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.4) 0%, transparent 70%)', 
 boxShadow: '0 0px 8px 0px rgba(6, 182, 212, 0.2)' 
 }} />
 </div>
 </div>
 );
};

