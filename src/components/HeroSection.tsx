"use client";

import { motion } from "framer-motion";
import Button from "./ui/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Sparkles, ArrowRight, ShieldCheck, Users, Zap, Compass } from "lucide-react";
import ParallaxJourney from "@/components/ParallaxJourney";

export default function HeroSection() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [travelStyle, setTravelStyle] = useState("Adventure");
  const [budget, setBudget] = useState("Moderate");

  const handleQuickPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim()) {
      router.push(`/ai-planner?destination=${encodeURIComponent(destination)}&style=${encodeURIComponent(travelStyle)}&budget=${encodeURIComponent(budget)}`);
    } else {
      router.push("/ai-planner");
    }
  };

  return (
    <section className="relative h-[200vh]">
      {/* Pinned constant video — stays fixed for the first 2 screens */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="sticky top-0 z-0 h-screen overflow-hidden"
      >
        <video
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: "translate3d(0,0,0)", willChange: "transform" }}
          src="/bg-iceland-canyon.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </motion.div>

      {/* Screen 1 — hero content over the video */}
      <div className="relative z-10 -mt-[100vh] flex h-screen flex-col justify-center px-4 pt-20 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
        
        {/* Eyebrow Tag */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/95 px-4 py-1.5 text-xs font-bold text-blue-800 shadow-sm mb-6"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
          <span>Next-Gen Collaborative Travel & AI Itineraries</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[1.08] mb-6"
        >
          Plan epic journeys. <br />
          <span className="text-gradient">Split costs effortlessly.</span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-600 font-medium mb-10 leading-relaxed"
        >
          The all-in-one platform combining autonomous <strong>AI itineraries</strong>, interactive <strong>3D routes</strong>, and automated <strong>debt-simplifying group expenses</strong>.
        </motion.p>

        {/* Quick Launch Generator Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mx-auto max-w-3xl rounded-3xl bg-white/95 border border-slate-200/90 p-4 sm:p-6 shadow-2xl shadow-slate-900/10 mb-12"
        >
          <form onSubmit={handleQuickPlan} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                Destination
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 h-4 w-4 text-blue-600 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Swiss Alps, Tokyo"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
            </div>

            <div className="relative text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                Travel Style
              </label>
              <div className="relative flex items-center">
                <Compass className="absolute left-3.5 h-4 w-4 text-blue-600 pointer-events-none" />
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition appearance-none cursor-pointer"
                >
                  <option value="Adventure">🏔️ Mountain Adventure</option>
                  <option value="Relaxation">🏖️ Beach & Leisure</option>
                  <option value="Culture">🏛️ Cultural & Heritage</option>
                  <option value="Backpacker">🎒 Backpacker & Budget</option>
                  <option value="Luxury">✨ Luxury & Fine Dining</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1 opacity-0 hidden sm:block">
                Action
              </label>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 hover:shadow-lg transition-all"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Generate AI Trip</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </motion.div>

        {/* Feature Badges / Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-600"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>AI Itinerary in &lt; 5 Seconds</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Multi-User Realtime Sync</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Smart Debt Minimizer</span>
          </div>
        </motion.div>

        {/* Scroll Journey Prompt Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-14 inline-flex flex-col items-center gap-2"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Scroll to begin your journey
          </span>
          <div className="w-5 h-9 rounded-full border-2 border-slate-400/80 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="w-1.5 h-2 rounded-full bg-blue-600"
            />
          </div>
        </motion.div>

      </div>
      </div>

      {/* Screen 2 — parallax travel animations over the same video */}
      <ParallaxJourney />
    </section>
  );
}
