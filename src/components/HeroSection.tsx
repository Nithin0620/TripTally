"use client";

import { motion } from "framer-motion";
import Button from "./ui/Button";
import { fadeIn, fadeInUp, slideUp } from "@/lib/animations";
import { useState } from "react";

export default function HeroSection() {
  const [destination, setDestination] = useState("");
  const [style, setStyle] = useState("");
  const [budget, setBudget] = useState("");

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div
          className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/90 via-brand-bg/70 to-brand-surface/90" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Hero Text */}
          <motion.h1
            className="mb-6 text-5xl font-black text-white md:text-7xl"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            Travel Smarter.
            <br />
            <span className="text-brand-accent">Not Harder.</span>
          </motion.h1>

          <motion.p
            className="mb-8 text-xl text-white/80 md:text-2xl"
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
            <h3 className="mb-6 text-2xl font-bold text-white">
              Generate Your Dream Trip
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Where To?
                </label>
                <input
                  type="text"
                  placeholder="e.g., Tokyo, Paris"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-brand-surface/85 px-4 py-3 text-white placeholder-white/50 backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Travel Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-brand-surface/85 px-4 py-3 text-white backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                >
                  <option value="" className="bg-brand-surface">
                    Select style
                  </option>
                  <option value="adventure" className="bg-brand-surface">
                    Adventure
                  </option>
                  <option value="luxury" className="bg-brand-surface">
                    Luxury
                  </option>
                  <option value="budget" className="bg-brand-surface">
                    Budget
                  </option>
                  <option value="cultural" className="bg-brand-surface">
                    Cultural
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Budget Range
                </label>
                <input
                  type="text"
                  placeholder="e.g., $2000-$5000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-brand-surface/85 px-4 py-3 text-white placeholder-white/50 backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
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
