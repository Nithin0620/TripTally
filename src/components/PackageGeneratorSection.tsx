"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Button from "./ui/Button";
import { scaleIn } from "@/lib/animations";

export default function PackageGeneratorSection() {
  const [destination, setDestination] = useState("");
  const [vibe, setVibe] = useState("");
  const [budget, setBudget] = useState("");

  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="glass-card rounded-3xl p-8 md:p-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scaleIn}
        >
          <h2 className="mb-6 text-center text-4xl font-black text-white md:text-5xl">
            Dream Trip Builder
          </h2>
          <p className="mb-8 text-center text-xl text-white/70">
            Tell us your vision, and our AI will craft the perfect itinerary.
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Destination
              </label>
              <input
                type="text"
                placeholder="Where do you want to go?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-brand-surface/85 px-4 py-3 text-white placeholder-white/50 backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Travel Vibe
              </label>
              <select
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-brand-surface/85 px-4 py-3 text-white backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
              >
                <option value="" className="bg-brand-surface">
                  Choose your style
                </option>
                <option value="relaxation" className="bg-brand-surface">
                  Relaxation & Wellness
                </option>
                <option value="adventure" className="bg-brand-surface">
                  Adventure & Thrill
                </option>
                <option value="cultural" className="bg-brand-surface">
                  Cultural Immersion
                </option>
                <option value="luxury" className="bg-brand-surface">
                  Luxury & Comfort
                </option>
                <option value="budget" className="bg-brand-surface">
                  Budget-Friendly
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Budget (USD)
              </label>
              <input
                type="text"
                placeholder="e.g., $3000 or $1000-$2000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-brand-surface/85 px-4 py-3 text-white placeholder-white/50 backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
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
