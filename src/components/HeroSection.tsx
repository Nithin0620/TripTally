"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Button from "./ui/Button";
import { fadeIn, fadeInUp, slideUp } from "@/lib/animations";
import { useState, useRef } from "react";

export default function HeroSection() {
  const [destination, setDestination] = useState("");
  const [style, setStyle] = useState("");
  const [budget, setBudget] = useState("");

  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-24"
    >
      <motion.div
        style={{ opacity }}
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div
          className="h-full z-50 w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/30 via-brand-bg/20 to-brand-surface/30" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Hero Text */}
          <motion.h1
            className="mb-6 text-5xl font-black text-[#0F172A] md:text-7xl"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            Travel Smarter.
            <br />
            <span className="text-brand-accent">Not Harder.</span>
          </motion.h1>

          <motion.p
            className="mb-8 text-xl text-[#64748B] md:text-2xl"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            AI-powered trip planning that handles budgets, itineraries, and
            group expenses in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mb-16 flex flex-wrap justify-center gap-4"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <Button variant="primary" href="/register">
              Start Planning
            </Button>
            <Button variant="secondary">View Demo</Button>
          </motion.div>

          {/* Floating Search Card */}
          <motion.div
            className="glass-card mx-auto max-w-4xl rounded-3xl p-8 shadow-2xl"
            variants={slideUp}
            initial="hidden"
            animate="visible"
          >
            <h3 className="mb-6 text-2xl font-bold text-[#0F172A]">
              Generate Your Dream Trip
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#475569]">
                  Where To?
                </label>
                <input
                  type="text"
                  placeholder="e.g., Manali, Goa"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="neu-input w-full rounded-xl px-4 py-3 text-[#0F172A] placeholder-slate-400 transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#475569]">
                  Travel Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="neu-input w-full rounded-xl px-4 py-3 text-[#0F172A] transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                >
                  <option value="">Select style</option>
                  <option value="adventure">Adventure</option>
                  <option value="luxury">Luxury</option>
                  <option value="budget">Budget</option>
                  <option value="cultural">Cultural</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#475569]">
                  Budget Range
                </label>
                <input
                  type="text"
                  placeholder="e.g., ₹15,000-₹30,000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="neu-input w-full rounded-xl px-4 py-3 text-[#0F172A] placeholder-slate-400 transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                />
              </div>
            </div>

            <Button variant="primary" className="mt-6 w-full">
              Generate Package
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
