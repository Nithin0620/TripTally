"use client";

import React from "react";

export default function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Dynamic Animated Ambient Orbs */}
      <div className="absolute -top-40 -left-40 h-[550px] w-[550px] rounded-full bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-transparent blur-[120px] animate-pulse duration-10000" />
      <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-amber-500/12 via-rose-500/8 to-transparent blur-[140px] animate-pulse duration-7000 delay-1000" />
      <div className="absolute -bottom-40 left-1/3 h-[650px] w-[650px] rounded-full bg-gradient-to-t from-emerald-500/10 via-teal-500/8 to-transparent blur-[150px] animate-pulse duration-9000 delay-2000" />

      {/* Topographic Contour Lines SVG Pattern */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.035] stroke-slate-900"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <path d="M0,100 C150,200 350,0 500,100 C650,200 850,50 1000,150 L1000,0 L0,0 Z" fill="none" strokeWidth="1.5" />
        <path d="M0,250 C200,350 400,150 600,280 C800,400 900,200 1000,300" fill="none" strokeWidth="1.5" />
        <path d="M0,450 C250,550 450,350 700,500 C850,600 950,450 1000,520" fill="none" strokeWidth="1.5" />
        <path d="M0,650 C180,750 380,550 620,700 C820,820 920,680 1000,740" fill="none" strokeWidth="1.5" />
        <path d="M0,850 C220,950 480,780 720,900 C880,980 960,880 1000,920" fill="none" strokeWidth="1.5" />
      </svg>

      {/* Subtle Dot Grid */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(#0f172a 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}
