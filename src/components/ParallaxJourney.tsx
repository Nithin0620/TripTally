"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

const destinations = [
  { label: "Kyoto", sub: "Cherry-blossom season", emoji: "🗼", left: "8%", yFrom: -120, yTo: 60 },
  { label: "Santorini", sub: "Aegean sunsets", emoji: "🏝️", left: "62%", yFrom: 90, yTo: -140 },
  { label: "Banff", sub: "Glacier lakes", emoji: "🏔️", left: "70%", yFrom: -60, yTo: 120 },
  { label: "Bali", sub: "Rice terraces", emoji: "🌴", left: "14%", yFrom: 80, yTo: -80 },
];

function DriftCard({
  progress,
  from,
  to,
  left,
  children,
}: {
  progress: MotionValue<number>;
  from: number;
  to: number;
  left: string;
  children: ReactNode;
}) {
  const y = useTransform(progress, [0, 1], [from, to]);
  return (
    <motion.div style={{ y, left }} className="absolute z-30 hidden will-change-transform sm:block">
      {children}
    </motion.div>
  );
}

const chips = [
  { emoji: "💸", title: "Auto split", sub: "No awkward IOUs" },
  { emoji: "🤖", title: "AI itinerary", sub: "Fueled by your budget" },
  { emoji: "🗺️", title: "Live route sync", sub: "Everyone, same map" },
];

export default function ParallaxJourney() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const yTitle = useTransform(scrollYProgress, [0, 1], ["0vh", "-60vh"]);
  const yRoute = useTransform(scrollYProgress, [0, 1], [60, -200]);
  const routeDraw = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);
  const chipLift = useTransform(scrollYProgress, [0, 1], ["18vh", "-12vh"]);

  return (
    <section ref={ref} className="relative z-10 flex h-screen items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-10">
      {/* Central message */}
      <motion.div style={{ y: yTitle }} className="pointer-events-none relative z-20 mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.28em] text-blue-500"
        >
          The TripTally Way
        </motion.p>
        <h2 className="mt-3 font-serif text-4xl font-bold uppercase tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          One app.
          <br />
          Every journey.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
          Turn chaos into an adventure — itinerary, splitting, and memories in a single view
          that scrolls along with you.
        </p>
      </motion.div>

      {/* Animated route drawing across the band */}
      <motion.svg
        style={{ y: yRoute }}
        viewBox="0 0 1000 620"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-70"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="route-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4c93de" />
            <stop offset="55%" stopColor="#9d8ae6" />
            <stop offset="100%" stopColor="#f0ac6e" />
          </linearGradient>
        </defs>
        <motion.path
          d="M -40 540 C 180 470, 320 430, 430 320 S 620 210, 720 150 S 880 60, 1040 30"
          fill="none"
          stroke="url(#route-grad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="1 12"
          style={{ pathLength: routeDraw }}
        />
        {[
          { cx: 180, cy: 470 },
          { cx: 430, cy: 320 },
          { cx: 720, cy: 150 },
        ].map((p) => (
          <circle key={p.cx} cx={p.cx} cy={p.cy} r="12" fill="#fff" stroke="#4c93de" strokeWidth="4" />
        ))}
      </motion.svg>

      {/* Floating destination cards */}
      {destinations.map((d) => (
        <DriftCard key={d.label} progress={scrollYProgress} from={d.yFrom} to={d.yTo} left={d.left}>
          <div className="w-40 p-3 text-left rounded-2xl bg-white/90 border border-slate-200 shadow-lg backdrop-blur-md">
            <div className="text-2xl">{d.emoji}</div>
            <div className="mt-1 text-sm font-bold text-slate-900">{d.label}</div>
            <div className="text-xs text-slate-500">{d.sub}</div>
          </div>
        </DriftCard>
      ))}

      {/* Feature chips rising at the end of the band */}
      <motion.div style={{ y: chipLift }} className="absolute bottom-10 z-30 flex flex-wrap items-center justify-center gap-3 sm:bottom-6">
        {chips.map((c) => (
          <div key={c.title} className="flex items-center gap-2.5 px-4 py-2.5 text-sm rounded-2xl bg-white/90 border border-slate-200 shadow-sm backdrop-blur-md">
            <span className="text-lg">{c.emoji}</span>
            <span className="font-bold text-slate-900">{c.title}</span>
            <span className="hidden text-slate-500 sm:inline">· {c.sub}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}