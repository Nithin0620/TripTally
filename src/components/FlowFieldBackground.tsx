"use client";

import { useEffect, useRef } from "react";

const COLORS = ["76,147,222", "240,172,110", "139,194,220", "193,152,222", "236,205,158"];

function field(x: number, y: number, t: number) {
  return (
    Math.sin(x * 0.0022 + t * 0.35) +
    Math.sin(y * 0.0031 - t * 0.28) +
    Math.sin((x + y) * 0.0014 + t * 0.18)
  ) * Math.PI;
}

function rgba(rgb: string, alpha: number) {
  return `rgba(${rgb},${alpha})`;
}

interface FlowFieldBackgroundProps {
  className?: string;
}

export default function FlowFieldBackground({ className = "" }: FlowFieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const motes = Array.from({ length: 70 }, () => ({
      x: 0,
      y: 0,
      r: 1 + Math.random() * 2.2,
      phase: Math.random() * Math.PI * 2,
    }));

    const blobs = Array.from({ length: 4 }, () => ({
      x: 0,
      y: 0,
      r: 0,
      vx: 0,
      vy: 0,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      a: 0.10 + Math.random() * 0.06,
    }));

    let ribbons: { x: number; y: number; hist: { x: number; y: number }[]; c: string; speed: number }[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = width < 768 ? 22 : 34;
      ribbons = Array.from({ length: count }, () => {
        const r = { x: Math.random() * width, y: Math.random() * height, hist: [] as { x: number; y: number }[], c: COLORS[Math.floor(Math.random() * COLORS.length)], speed: 1 + Math.random() * 1.4 };
        for (let i = 0; i < 24; i++) r.hist.push({ x: r.x, y: r.y });
        return r;
      });

      motes.forEach((m) => {
        m.x = Math.random() * width;
        m.y = Math.random() * height;
      });

      blobs.forEach((b) => {
        b.r = Math.min(width, height) * (0.18 + Math.random() * 0.22);
        b.vx = (Math.random() - 0.5) * 0.35;
        b.vy = (Math.random() - 0.5) * 0.25;
        b.x = Math.random() * width;
        b.y = Math.random() * height;
      });
    };
    resize();
    window.addEventListener("resize", resize);

    const drawFrame = (t: number) => {
      ctx.clearRect(0, 0, width, height);

      // Soft drifting aurora blobs
      for (const b of blobs) {
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, rgba(b.c, b.a));
        grad.addColorStop(1, rgba(b.c, 0));
        ctx.fillStyle = grad;
        ctx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -b.r) b.x = width + b.r;
        if (b.x > width + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = height + b.r;
        if (b.y > height + b.r) b.y = -b.r;
      }

      // Flowfield ribbons
      for (const r of ribbons) {
        const a = field(r.x, r.y, t);
        r.x += Math.cos(a) * r.speed;
        r.y += Math.sin(a) * r.speed;
        if (r.x < -20) r.x = width + 20;
        if (r.x > width + 20) r.x = -20;
        if (r.y < -20) r.y = height + 20;
        if (r.y > height + 20) r.y = -20;

        r.hist.push({ x: r.x, y: r.y });
        r.hist.shift();

        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.strokeStyle = rgba(r.c, 0.28);
        ctx.beginPath();
        ctx.moveTo(r.hist[0].x, r.hist[0].y);
        for (const p of r.hist) ctx.lineTo(p.x, p.y);
        ctx.stroke();

        ctx.fillStyle = rgba(r.c, 0.5);
        ctx.beginPath();
        ctx.arc(r.x, r.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Twinkling travel dust
      ctx.globalCompositeOperation = "lighter";
      for (const m of motes) {
        m.y -= 0.15;
        if (m.y < -10) {
          m.y = height + 10;
          m.x = Math.random() * width;
        }
        const tw = 0.6 + 0.4 * Math.sin(t * 0.002 + m.phase);
        ctx.fillStyle = rgba("255,255,255", tw * 0.55);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    if (reduced) {
      drawFrame(0);
    } else {
      const loop = (time: number) => {
        drawFrame(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 z-0 pointer-events-none ${className}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
}