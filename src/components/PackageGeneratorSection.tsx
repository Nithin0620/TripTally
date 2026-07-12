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
          <h2 className="mb-6 text-center text-4xl font-black text-[#0F172A] md:text-5xl">
            Dream Trip Builder
          </h2>
          <p className="mb-8 text-center text-xl text-[#64748B]">
            Tell us your vision, and our AI will craft the perfect itinerary.
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#475569]">
                Destination
              </label>
              <input
                type="text"
                placeholder="Where do you want to go?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="neu-input w-full rounded-xl px-4 py-3 text-[#0F172A] placeholder-slate-400 transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#475569]">
                Travel Vibe
              </label>
              <select
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="neu-input w-full rounded-xl px-4 py-3 text-[#0F172A] transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
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
              <label className="mb-2 block text-sm font-medium text-[#475569]">
                Budget (INR)
              </label>
              <input
                type="text"
                placeholder="e.g., ₹20,000 or ₹15,000-₹30,000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="neu-input w-full rounded-xl px-4 py-3 text-[#0F172A] placeholder-slate-400 transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
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
