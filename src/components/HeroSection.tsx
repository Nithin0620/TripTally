"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Button from "./ui/Button";
import { fadeIn, fadeInUp, slideUp } from "@/lib/animations";
import { useState, useRef } from "react";
import { MapPin, Compass, Wallet, Sparkles } from "lucide-react";

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
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      >
        <div
          className="h-full z-50 w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/60 via-brand-bg/40 to-brand-bg/80" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Eyebrow Tag */}
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-sand/60 bg-white/70 px-5 py-2 text-sm font-medium text-brand-text/80 backdrop-blur-sm"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <Sparkles className="h-4 w-4 text-brand-accent" />
            AI-Powered Travel Planning
          </motion.div>

          {/* Hero Text */}
          <motion.h1
            className="mb-6 font-serif text-5xl font-black text-brand-text md:text-7xl lg:text-8xl tracking-tight"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            Travel Smarter.
            <br />
            <span className="text-brand-accent italic">Not Harder.</span>
          </motion.h1>

          <motion.p
            className="mx-auto mb-10 max-w-2xl text-lg text-brand-text/65 md:text-xl"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            Plan trips collaboratively with AI that handles budgets, itineraries,
            and group expenses — all in one beautiful platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mb-16 flex flex-wrap justify-center gap-4"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <Button variant="primary" href="/register" className="px-8 py-3.5 text-base">
              Start Planning
            </Button>
            <Button variant="outline" className="px-8 py-3.5 text-base">View Demo</Button>
          </motion.div>

          {/* Floating Search Card */}
          <motion.div
            className="mx-auto max-w-4xl rounded-3xl bg-white/80 border border-brand-sand/40 p-8 shadow-lg backdrop-blur-xl"
            variants={slideUp}
            initial="hidden"
            animate="visible"
          >
            <h3 className="mb-6 font-serif text-2xl font-bold text-brand-text">
              Generate Your Dream Trip
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-text/70">
                  <MapPin className="h-3.5 w-3.5 text-brand-accent" />
                  Where To?
                </label>
                <input
                  type="text"
                  placeholder="e.g., Manali, Goa"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="neu-input w-full rounded-2xl px-4 py-3 text-brand-text placeholder-brand-text/35 transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-text/70">
                  <Compass className="h-3.5 w-3.5 text-brand-accent" />
                  Travel Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="neu-input w-full rounded-2xl px-4 py-3 text-brand-text transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                >
                  <option value="">Select style</option>
                  <option value="adventure">Adventure</option>
                  <option value="luxury">Luxury</option>
                  <option value="budget">Budget</option>
                  <option value="cultural">Cultural</option>
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-text/70">
                  <Wallet className="h-3.5 w-3.5 text-brand-accent" />
                  Budget Range
                </label>
                <input
                  type="text"
                  placeholder="e.g., ₹15,000-₹30,000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="neu-input w-full rounded-2xl px-4 py-3 text-brand-text placeholder-brand-text/35 transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
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
