"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Button from "./ui/Button";
import { scaleIn } from "@/lib/animations";
import { MapPin, Heart, Wallet } from "lucide-react";

export default function PackageGeneratorSection() {
  const [destination, setDestination] = useState("");
  const [vibe, setVibe] = useState("");
  const [budget, setBudget] = useState("");

  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="rounded-3xl bg-white border border-brand-sand/30 p-8 shadow-sm md:p-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scaleIn}
        >
          <div className="mb-8 text-center">
            <span className="mb-4 inline-block rounded-full border border-brand-sand/50 bg-brand-sand/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-accent">
              AI Builder
            </span>
            <h2 className="mb-3 font-serif text-4xl font-bold text-brand-text md:text-5xl tracking-tight">
              Dream Trip Builder
            </h2>
            <p className="mx-auto max-w-lg text-lg text-brand-text/60">
              Tell us your vision, and our AI will craft the perfect itinerary.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-text/70">
                <MapPin className="h-3.5 w-3.5 text-brand-accent" />
                Destination
              </label>
              <input
                type="text"
                placeholder="Where do you want to go?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="neu-input w-full rounded-2xl px-4 py-3 text-brand-text placeholder-brand-text/35 transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-text/70">
                <Heart className="h-3.5 w-3.5 text-brand-accent" />
                Travel Vibe
              </label>
              <select
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="neu-input w-full rounded-2xl px-4 py-3 text-brand-text transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              >
                <option value="">Choose your style</option>
                <option value="relaxation">Relaxation & Wellness</option>
                <option value="adventure">Adventure & Thrill</option>
                <option value="cultural">Cultural Immersion</option>
                <option value="luxury">Luxury & Comfort</option>
                <option value="budget">Budget-Friendly</option>
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-text/70">
                <Wallet className="h-3.5 w-3.5 text-brand-accent" />
                Budget (INR)
              </label>
              <input
                type="text"
                placeholder="e.g., ₹20,000 or ₹15,000-₹30,000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="neu-input w-full rounded-2xl px-4 py-3 text-brand-text placeholder-brand-text/35 transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              />
            </div>

            <Button variant="primary" className="mt-6 w-full">
              Generate Package
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
