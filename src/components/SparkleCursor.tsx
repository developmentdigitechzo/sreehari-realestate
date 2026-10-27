'use client';

import React, { useEffect, useRef } from 'react';

interface PetalParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  aspectRatio: number;
  color: string;
  tipColor: string;
  baseColor: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
}

// Royal Lotus Blossom Petal Palette
const PETAL_THEMES = [
  { color: '#D61F69', tipColor: '#FDA4AF', baseColor: '#9F1239' }, // Sree Hari Signature Pink
  { color: '#E11D48', tipColor: '#FDE68A', baseColor: '#881337' }, // Deep Rose with Golden Pollen Tip
  { color: '#F472B6', tipColor: '#FFF1F2', baseColor: '#BE185D' }, // Soft Lotus Blossom
  { color: '#FB7185', tipColor: '#FEF08A', baseColor: '#9F1239' }, // Warm Sunset Pink
  { color: '#EC4899', tipColor: '#FDF2F8', baseColor: '#9D174D' }, // Pure Floral Magenta
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

    const particles: PetalParticle[] = [];
    const MAX_PARTICLES = 38;

    let mouseX = -100;
    let mouseY = -100;
    let lotusX = -100;
    let lotusY = -100;
    let lastSpawnTime = 0;
    let isHoveringInteractive = false;
    let isMouseDown = false;

    // Helper: draw an organic curved lotus petal
    function drawLotusPetal(
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      aspectRatio: number,
      rotation: number,
      color: string,
      tipColor: string,
      baseColor: string,
      alpha: number
    ) {
      context.save();
      context.translate(cx, cy);
      context.rotate(rotation);
      context.globalAlpha = Math.max(0, Math.min(1, alpha));

      const halfW = size * 0.52 * aspectRatio;
      const topH = -size;
      const botH = size * 0.82;

      // Curved organic lotus petal contour
      context.beginPath();
      context.moveTo(0, topH);
      // Right petal curve
      context.bezierCurveTo(halfW * 1.15, topH * 0.45, halfW * 0.95, botH * 0.55, 0, botH);
      // Left petal curve back to top tip
      context.bezierCurveTo(-halfW * 0.95, botH * 0.55, -halfW * 1.15, topH * 0.45, 0, topH);
      context.closePath();

      // Botanical petal gradient
      const grad = context.createLinearGradient(0, topH, 0, botH);
      grad.addColorStop(0, tipColor);
      grad.addColorStop(0.35, color);
      grad.addColorStop(1, baseColor);
      context.fillStyle = grad;
      context.fill();

      // Subtle translucent central petal vein
      context.beginPath();
      context.moveTo(0, topH * 0.72);
      context.lineTo(0, botH * 0.38);
      context.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      context.lineWidth = Math.max(0.7, size * 0.08);
      context.stroke();

      context.restore();
    }

    // Spawn floating lotus petals along cursor trail
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
      if (now - lastSpawnTime > 38 && particles.length < MAX_PARTICLES) {
        lastSpawnTime = now;

        const count = Math.random() > 0.4 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const theme = PETAL_THEMES[Math.floor(Math.random() * PETAL_THEMES.length)];
          const angle = Math.random() * Math.PI * 2;
          const driftSpeed = 0.3 + Math.random() * 0.8;

          particles.push({
            x: mouseX + (Math.random() - 0.5) * 14,
            y: mouseY + (Math.random() - 0.5) * 14,
            vx: Math.cos(angle) * driftSpeed * 0.6,
            vy: 0.4 + Math.random() * 0.7, // gentle downward floating breeze
            size: 5 + Math.random() * 4.5,
            aspectRatio: 0.8 + Math.random() * 0.4,
            color: theme.color,
            tipColor: theme.tipColor,
            baseColor: theme.baseColor,
            alpha: 1,
            life: 0,
            maxLife: 28 + Math.floor(Math.random() * 18),
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.07,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.08 + Math.random() * 0.06
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

    // Click burst: radiate a shower of blossoming petals
    const handleClick = (e: MouseEvent) => {
      const clickX = e.clientX;
      const clickY = e.clientY;
      const burstCount = 14;

      for (let i = 0; i < burstCount; i++) {
        if (particles.length >= MAX_PARTICLES + 14) break;
        const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.4;
        const speed = 1.2 + Math.random() * 2.2;
        const theme = PETAL_THEMES[i % PETAL_THEMES.length];

        particles.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed * 0.7 + 0.3,
          size: 5.5 + Math.random() * 4.5,
          aspectRatio: 0.75 + Math.random() * 0.5,
          color: theme.color,
          tipColor: theme.tipColor,
          baseColor: theme.baseColor,
          alpha: 1,
          life: 0,
          maxLife: 32 + Math.floor(Math.random() * 16),
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.12,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.09 + Math.random() * 0.07
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
        const dx = mouseX - lotusX;
        const dy = mouseY - lotusY;
        lotusX += dx * 0.55;
        lotusY += dy * 0.55;

        const tilt = Math.max(-12, Math.min(12, dx * 0.25));
        const scale = isMouseDown ? 0.88 : isHoveringInteractive ? 1.15 : 1.0;
        lotus.style.transform = `translate3d(${lotusX}px, ${lotusY}px, 0) scale(${scale}) rotate(${tilt}deg)`;
      }

      // 2. Render fluttering lotus petal particles on canvas
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * 0.65; // gentle fluttering breeze wave
        p.y += p.vy;                             // gentle drift
        p.rotation += p.rotationSpeed;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.life >= p.maxLife || p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        drawLotusPetal(
          ctx,
          p.x,
          p.y,
          p.size,
          p.aspectRatio,
          p.rotation,
          p.color,
          p.tipColor,
          p.baseColor,
          p.alpha
        );
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
      {/* Canvas for Floating Lotus Petals */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[99998] select-none"
      />

      {/* Brand Lotus Cursor Emblem (Clean, Crisp, Standalone with Zero Chain) */}
      <div
        ref={lotusRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[99999] -translate-x-1/2 -translate-y-1/2 will-change-transform opacity-0 transition-opacity duration-200 select-none"
        style={{
          width: '48px',
          height: '48px',
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center select-none">
          {/* Crisp Official Lotus Emblem with zero dark drop-shadow or blur */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/lotus_icon.png"
            alt=""
            className="w-full h-full object-contain select-none"
            draggable={false}
          />
        </div>
      </div>
    </>
  );
}
