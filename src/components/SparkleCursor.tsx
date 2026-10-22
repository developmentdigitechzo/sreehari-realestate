'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
}

const SPARKLE_COLORS = [
  '#D61F69', // Brand Rose Pink
  '#F59E0B', // Golden Amber
  '#006452', // Emerald Green
  '#F43F5E', // Vivid Pink
  '#FBBF24', // Warm Gold
  '#FFFFFF'  // Bright White Diamond
];

export default function SparkleCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lotusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 1. Accessibility Checks: Disable on touch devices or if reduced motion is requested
    if (typeof window === 'undefined') return;

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) {
      return;
    }

    const canvas = canvasRef.current;
    const lotus = lotusRef.current;
    if (!canvas || !lotus) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const MAX_PARTICLES = 36;

    let mouseX = -100;
    let mouseY = -100;
    let lotusX = -100;
    let lotusY = -100;
    let lastSpawnTime = 0;
    let isHoveringInteractive = false;
    let isMouseDown = false;

    // Helper: draw a 4-point sparkle star
    function drawSparkleStar(
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number,
      rotation: number
    ) {
      let rot = (Math.PI / 2) * 3 + rotation;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      context.beginPath();
      context.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
      context.lineTo(cx, cy - outerRadius);
      context.closePath();
      context.fill();
    }

    // Spawn sparkles along cursor trail
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (lotus.style.opacity !== '1') {
        lotus.style.opacity = '1';
      }

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        isHoveringInteractive = Boolean(
          target.closest('a, button, input, select, textarea, [role="button"], .cursor-pointer')
        );
      }

      const now = performance.now();
      if (now - lastSpawnTime > 40 && particles.length < MAX_PARTICLES) {
        lastSpawnTime = now;

        const count = Math.random() > 0.5 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.4 + Math.random() * 1.2;

          particles.push({
            x: mouseX + (Math.random() - 0.5) * 12,
            y: mouseY + (Math.random() - 0.5) * 12,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.3, // gentle rise
            size: 3.5 + Math.random() * 4.5,
            color,
            alpha: 1,
            life: 0,
            maxLife: 26 + Math.floor(Math.random() * 16),
            rotation: Math.random() * Math.PI,
            rotationSpeed: (Math.random() - 0.5) * 0.12
          });
        }
      }
    };

    const handleMouseDown = () => {
      isMouseDown = true;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleMouseLeave = () => {
      if (lotus) lotus.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      if (lotus) lotus.style.opacity = '1';
    };

    // Click burst: radiate little celebration sparkles
    const handleClick = (e: MouseEvent) => {
      const clickX = e.clientX;
      const clickY = e.clientY;
      const burstCount = 12;

      for (let i = 0; i < burstCount; i++) {
        if (particles.length >= MAX_PARTICLES + 12) break;
        const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.4;
        const speed = 1.4 + Math.random() * 2.4;
        const color = SPARKLE_COLORS[i % SPARKLE_COLORS.length];

        particles.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 4 + Math.random() * 4.5,
          color,
          alpha: 1,
          life: 0,
          maxLife: 30 + Math.floor(Math.random() * 15),
          rotation: Math.random() * Math.PI,
          rotationSpeed: (Math.random() - 0.5) * 0.18
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Animation Loop
    const render = () => {
      // 1. Smoothly interpolate lotus cursor position
      if (mouseX > -50 && mouseY > -50) {
        // Fast, fluid spring follow
        lotusX += (mouseX - lotusX) * 0.55;
        lotusY += (mouseY - lotusY) * 0.55;

        const scale = isMouseDown ? 0.85 : isHoveringInteractive ? 1.25 : 1.0;
        lotus.style.transform = `translate3d(${lotusX}px, ${lotusY}px, 0) scale(${scale})`;
      }

      // 2. Render sparkle particles on canvas
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.life >= p.maxLife || p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;

        // Draw glittering diamond sparkle
        drawSparkleStar(ctx, p.x, p.y, 4, p.size, p.size * 0.32, p.rotation);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[99998] select-none"
      />

      {/* Brand Lotus Cursor Emblem (Prominent Size, Crisp & Clean) */}
      <div
        ref={lotusRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[99999] -translate-x-1/2 -translate-y-1/2 will-change-transform opacity-0 transition-opacity duration-200 select-none"
        style={{
          width: '48px',
          height: '48px',
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Subtle Ambient Aura (Reduced Pink Fog) */}
          <div className="absolute inset-0 bg-[#D61F69]/10 rounded-full blur-[3px] pointer-events-none" />

          {/* Crisp Official Pink Lotus Emblem */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/lotus_icon.png"
            alt=""
            className="w-full h-full object-contain drop-shadow-[0_1px_4px_rgba(0,0,0,0.18)] relative z-10"
          />
        </div>
      </div>
    </>
  );
}
