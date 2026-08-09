import React, { useEffect, useRef } from 'react';

export const BrainAnimation: React.FC = () => {
 const canvasRef = useRef<HTMLCanvasElement>(null);

 useEffect(() => {
 const canvas = canvasRef.current;
 if (!canvas) return;
 const ctx = canvas.getContext('2d');
 if (!ctx) return;

 let animationFrameId: number;
 let width = (canvas.width = canvas.offsetWidth * 2);
 let height = (canvas.height = canvas.offsetHeight * 2);
 ctx.scale(2, 2);
 let cssWidth = width / 2;
 let cssHeight = height / 2;

 class Node {
 x: number;
 y: number;
 z: number;
 baseX: number;
 baseY: number;
 baseZ: number;
 size: number;
 color: string;
 connections: Node[];
 activity: number;
 val: string;

 constructor(x: number, y: number, z: number, color: string) {
 this.baseX = x;
 this.baseY = y;
 this.baseZ = z;
 this.x = x;
 this.y = y;
 this.z = z;
 this.size = Math.random() * 1.5 + 0.5;
 this.color = color;
 this.connections = [];
 this.activity = Math.random() * Math.PI * 2;
 this.val = Math.random() > 0.5 ? '0' : '1';
 }
 }

 let nodes: Node[] = [];
 let signalParticles: { source: Node; target: Node; progress: number; speed: number; color: string }[] = [];

 const init = () => {
 nodes = [];
 signalParticles = [];
 const numNodes = 220;

 // Generate nodes in an intricate dual-hemisphere layout
 for (let i = 0; i < numNodes; i++) {
 const theta = Math.random() * Math.PI * 2;
 const phi = Math.acos(Math.random() * 2 - 1);

 let r = 140 + Math.random() * 60; // Spread out a bit

 // Spherical/Ellipsoid structure
 let x = r * Math.sin(phi) * Math.cos(theta) * 1.1;
 let y = r * Math.sin(phi) * Math.sin(theta) * 0.9;
 let z = r * Math.cos(phi) * 1.1;

 // Create a central gap to mimic hemispheres
 if (x > 0) x += 15;
 else x -= 15;

 // Colors centered around institutional blues and slates
 const colorPool = ['#3b82f6', '#1d4ed8', '#0ea5e9', '#6366f1', '#64748b'];
 const color = colorPool[Math.floor(Math.random() * colorPool.length)];

 nodes.push(new Node(x, y, z, color));
 }

 // Add a structural inner core (dense computational center)
 for (let i = 0; i < 80; i++) {
 const theta = Math.random() * Math.PI * 2;
 const phi = Math.acos(Math.random() * 2 - 1);
 let r = 30 + Math.random() * 40;
 let x = r * Math.sin(phi) * Math.cos(theta);
 let y = r * Math.sin(phi) * Math.sin(theta);
 let z = r * Math.cos(phi);
 nodes.push(new Node(x, y, z, '#38bdf8')); // Bright core nodes
 }

 // Establish constrained network topology (synapses)
 for (let i = 0; i < nodes.length; i++) {
 let nearest: { node: Node; dist: number }[] = [];
 for (let j = 0; j < nodes.length; j++) {
 if (i === j) continue;
 const dx = nodes[i].baseX - nodes[j].baseX;
 const dy = nodes[i].baseY - nodes[j].baseY;
 const dz = nodes[i].baseZ - nodes[j].baseZ;
 const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
 nearest.push({ node: nodes[j], dist });
 }

 // Connect only to the 3-5 closest neighbors to keep it clean and performant
 nearest.sort((a, b) => a.dist - b.dist);
 for (let k = 0; k < Math.floor(Math.random() * 3) + 2; k++) {
 if (nearest[k] && nearest[k].dist < 100) {
 nodes[i].connections.push(nearest[k].node);
 }
 }
 }
 };

 let angleY = 0;
 let angleX = 0;
 let cameraZOffset = -800;

 const animate = () => {
 // Motion blur effect instead of clearRect
 ctx.fillStyle = 'rgba(7, 11, 20, 0.2)';
 ctx.fillRect(0, 0, cssWidth, cssHeight);

 const cx = cssWidth / 2;
 const cy = cssHeight / 2;

 angleY += 0.002;
 angleX = Math.sin(Date.now() * 0.0002) * 0.1;
 cameraZOffset += (0 - cameraZOffset) * 0.02;

 const cosY = Math.cos(angleY);
 const sinY = Math.sin(angleY);
 const cosX = Math.cos(angleX);
 const sinX = Math.sin(angleX);
 const fov = 900;

 // Project 3D to 2D
 const projectedNodes = nodes.map((node) => {
 // Rotate Y
 let x1 = node.baseX * cosY - node.baseZ * sinY;
 let z1 = node.baseZ * cosY + node.baseX * sinY;

 // Rotate X
 let y1 = node.baseY * cosX - z1 * sinX;
 let z2 = z1 * cosX + node.baseY * sinX;

 node.activity += 0.02;
 const pulse = Math.sin(node.activity) * 3;

 let finalZ = z2 + cameraZOffset;
 const scale = fov / (fov + finalZ);

 return {
 ...node,
 refNode: node, // reference to original
 x: cx + x1 * scale,
 y: cy + (y1 + pulse) * scale,
 scale: scale,
 z2: finalZ,
 };
 });

 // Sort back to front for proper rendering overlap
 projectedNodes.sort((a, b) => b.z2 - a.z2);

 // Render Synapses (Lines)
 ctx.lineWidth = 0.5;
 projectedNodes.forEach((node) => {
 if (node.z2 < -fov + 100) return;

 node.connections.forEach((target) => {
 const tNode = projectedNodes.find((pn) => pn.refNode === target);
 if (tNode) {
 const opacity = Math.max(0, 0.25 - (node.z2 + 300) / 1200);
 ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
 ctx.beginPath();
 ctx.moveTo(node.x, node.y);
 ctx.lineTo(tNode.x, tNode.y);
 ctx.stroke();
 }
 });

 // Chance to spawn a signal
 if (Math.random() < 0.005 && node.connections.length > 0) {
 const target = node.connections[Math.floor(Math.random() * node.connections.length)];
 signalParticles.push({
 source: node.refNode,
 target: target,
 progress: 0,
 speed: 0.02 + Math.random() * 0.03,
 color: Math.random() > 0.5 ? '#60a5fa' : '#38bdf8',
 });
 }
 });

 // Render Signals
 for (let i = signalParticles.length - 1; i >= 0; i--) {
 let p = signalParticles[i];
 p.progress += p.speed;
 
 if (p.progress >= 1) {
 signalParticles.splice(i, 1);
 continue;
 }

 const sProj = projectedNodes.find((pn) => pn.refNode === p.source);
 const tProj = projectedNodes.find((pn) => pn.refNode === p.target);

 if (sProj && tProj) {
 const px = sProj.x + (tProj.x - sProj.x) * p.progress;
 const py = sProj.y + (tProj.y - sProj.y) * p.progress;
 const pz = sProj.z2 + (tProj.z2 - sProj.z2) * p.progress;

 if (pz > -fov + 100) {
 const pOpacity = Math.max(0, 1 - Math.abs(pz) / 500);
 ctx.fillStyle = `rgba(255, 255, 255, ${pOpacity})`;
 ctx.shadowBlur = 0;
 ctx.shadowColor = p.color;
 ctx.beginPath();
 ctx.arc(px, py, 1.5 * sProj.scale, 0, Math.PI * 2);
 ctx.fill();
 ctx.shadowBlur = 0;
 }
 }
 }

 // Render Nodes (with binary text data)
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';

 projectedNodes.forEach((node) => {
 if (node.z2 < -fov + 100) return;
 const opacity = Math.max(0.05, 0.8 - (node.z2 + 200) / 800);

 // Core data rendering
 if (opacity > 0.4 && Math.random() > 0.95) {
 node.refNode.val = Math.random() > 0.5 ? '0' : '1'; // occasionally glitch values
 }

 const isBright = Math.sin(node.activity * 3) > 0.9;
 const textColor = isBright ? `rgba(255, 255, 255, ${Math.min(1, opacity + 0.3)})` : node.color;
 
 ctx.fillStyle = textColor;
 if (isBright) {
 ctx.shadowBlur = 0;
 ctx.shadowColor = '#60a5fa';
 } else {
 ctx.shadowBlur = 0;
 }

 // Draw binary values instead of plain circles for an institutional/tech feel
 const fontSize = Math.max(6, 12 * node.scale);
 ctx.font = `${isBright ? 'bold' : 'normal'} ${fontSize}px 'JetBrains Mono', monospace`;
 
 // Render text, appending opacity hex safely by parsing rgba/hex is complex, so we just use the raw color if it's hex and we apply global alpha
 ctx.globalAlpha = opacity;
 ctx.fillText(node.val, node.x, node.y);
 ctx.globalAlpha = 1.0;
 ctx.shadowBlur = 0;
 });

 animationFrameId = requestAnimationFrame(animate);
 };

 const handleResize = () => {
 width = (canvas.width = canvas.offsetWidth * 2);
 height = (canvas.height = canvas.offsetHeight * 2);
 ctx.scale(2, 2);
 cssWidth = canvas.offsetWidth;
 cssHeight = canvas.offsetHeight;
 init();
 };

 init();
 animate();
 window.addEventListener('resize', handleResize);

 return () => {
 cancelAnimationFrame(animationFrameId);
 window.removeEventListener('resize', handleResize);
 };
 }, []);

 return (
 <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#070b14] rounded-3xl overflow-hidden border border-slate-800/60 shadow-2xl">
 {/* Background radial gradient mask for depth */}
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.6)_0%,rgba(7,11,20,1)_80%)] pointer-events-none" />

 {/* Corporate / Institutional Diagnostics Overlay */}
 <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none z-20">
 <div className="flex items-center gap-2 border border-blue-900/40 bg-blue-950/20 px-3 py-1.5 rounded-sm backdrop-blur-md">
 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
 <span className="text-blue-300 text-xs font-mono ">System Core Active</span>
 </div>
 <div className="pl-1">
 <span className="text-text text-xs font-mono leading-relaxed block ">
 NET_TOPOLOGY: NON-LINEAR<br />
 OP_MODE: BACKTEST_ENGINE<br />
 LATENCY: 1.02MS
 </span>
 </div>
 </div>

 <canvas
 ref={canvasRef}
 className="w-full h-full max-w-[950px] max-h-[950px] cursor-crosshair z-10 block"
 />

 <div className="absolute bottom-6 right-6 text-right pointer-events-none z-20">
 <span className="text-text/60 text-xs font-mono ">
 Quantrih Proprietary Engine &trade;
 </span>
 </div>
 
 {/* Sleek edge overlays for polish */}
 <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
 <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-500/20 to-transparent" />
 </div>
 );
};

