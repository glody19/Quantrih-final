import React, { useEffect, useRef } from 'react';

export function ParticleBackground() {
 const canvasRef = useRef<HTMLCanvasElement>(null);

 useEffect(() => {
 const canvas = canvasRef.current;
 if (!canvas) return;

 const ctx = canvas.getContext('2d', { alpha: false });
 if (!ctx) return;

 let width = window.innerWidth;
 let height = window.innerHeight;
 canvas.width = width;
 canvas.height = height;

 const particles: Particle[] = [];
 const particleCount = Math.min(window.innerWidth > 768 ? 2000 : 800, 3000);

 class Particle {
 angle: number;
 baseRadius: number;
 radius: number;
 orbitSpeed: number;
 size: number;
 color: string;
 radialOffset: number;
 pulseSpeed: number;
 z: number;
 x: number;
 y: number;

 constructor() {
 // Distribute in a beautiful spiral / galaxy pattern
 this.angle = Math.random() * Math.PI * 2;
 
 // Concentrate near the center but allow full-screen spread
 const distRatio = Math.pow(Math.random(), 2.5);
 this.baseRadius = distRatio * (Math.max(width, height) * 0.7);
 this.radius = this.baseRadius;
 
 // Closer particles orbit much faster than outer ones (Keplerian-ish rotation)
 this.orbitSpeed = (Math.random() * 0.01 + 0.002) * (150 / (this.baseRadius + 50));
 
 this.size = Math.random() * 1.6 + 0.3;
 this.radialOffset = Math.random() * Math.PI * 2;
 this.pulseSpeed = 0.001 + Math.random() * 0.002;
 this.z = Math.random() * 2; // fake depth

 // Vibrant neon green, emerald green, and gold-green color variations
 const rand = Math.random();
 if (rand < 0.5) {
 // bright emerald
 this.color = `rgba(16, 185, 129, ${0.4 + Math.random() * 0.5})`;
 } else if (rand < 0.8) {
 // neon high green
 this.color = `rgba(52, 211, 153, ${0.5 + Math.random() * 0.5})`;
 } else if (rand < 0.95) {
 // bright mint / cyan-green
 this.color = `rgba(34, 211, 238, ${0.4 + Math.random() * 0.4})`;
 } else {
 // soft white-green core light
 this.color = `rgba(240, 253, 244, ${0.8 + Math.random() * 0.2})`;
 }

 this.x = width / 2;
 this.y = height / 2;
 }

 draw(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) {
 // Orbit dynamics
 this.angle += this.orbitSpeed;
 
 // Pulsing / breathing contraction-expansion shockwave from the video
 // We accumulate a dynamic radial wave across the whole canvas
 const wave = Math.sin(time * this.pulseSpeed * 10 + this.radialOffset) * (this.baseRadius * 0.12);
 this.radius = this.baseRadius + wave;

 // Position on 2D screen centered on canvas
 this.x = centerX + Math.cos(this.angle) * this.radius;
 this.y = centerY + Math.sin(this.angle) * this.radius * 0.75; // slightly elliptic for 3D perspective

 // Draw glowing particle
 ctx.fillStyle = this.color;
 ctx.beginPath();
 ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
 ctx.fill();

 // Extra glowing core halo for larger particles to simulate camera glare
 if (this.size > 1.2 && Math.random() > 0.95) {
 ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
 ctx.beginPath();
 ctx.arc(this.x, this.y, this.size * 5, 0, Math.PI * 2);
 ctx.fill();
 }
 }

 updateWithMouse(mouseX: number, mouseY: number, strength: number) {
 // Gently pull or push based on cursor proximity
 const dx = mouseX - this.x;
 const dy = mouseY - this.y;
 const dist = Math.sqrt(dx * dx + dy * dy);
 if (dist < 200 && dist > 10) {
 const force = (200 - dist) / 200;
 this.angle += force * 0.05 * strength; // spin faster under cursor
 this.baseRadius += (dx / dist) * force * 1.5; // pull inward
 }
 }
 }

 // Initialize
 for (let i = 0; i < particleCount; i++) {
 particles.push(new Particle());
 }

 let mouseX = width / 2;
 let mouseY = height / 2;
 let targetMouseX = width / 2;
 let targetMouseY = height / 2;

 const handleMouseMove = (e: MouseEvent) => {
 targetMouseX = e.clientX;
 targetMouseY = e.clientY;
 };

 const handleResize = () => {
 width = window.innerWidth;
 height = window.innerHeight;
 canvas.width = width;
 canvas.height = height;
 };

 window.addEventListener('mousemove', handleMouseMove);
 window.addEventListener('resize', handleResize);

 let animationFrameId: number;
 let lastTime = Date.now();

 const animate = () => {
 // Dark slate cosmic background filling
 ctx.fillStyle = '#070b14';
 ctx.fillRect(0, 0, width, height);

 // Smooth mouse interpolation
 mouseX += (targetMouseX - mouseX) * 0.08;
 mouseY += (targetMouseY - mouseY) * 0.08;

 const time = Date.now();
 const delta = time - lastTime;
 
 const centerX = width / 2;
 const centerY = height / 2;

 // Draw particle galaxy
 for (let i = 0; i < particles.length; i++) {
 particles[i].updateWithMouse(mouseX, mouseY, 1.0);
 particles[i].draw(ctx, centerX, centerY, time);
 }

 animationFrameId = requestAnimationFrame(animate);
 };

 animate();

 return () => {
 window.removeEventListener('mousemove', handleMouseMove);
 window.removeEventListener('resize', handleResize);
 cancelAnimationFrame(animationFrameId);
 };
 }, []);

 return (
 <canvas
 ref={canvasRef}
 className="absolute inset-0 w-full h-full pointer-events-none z-0"
 />
 );
}
