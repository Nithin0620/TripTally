"use client";

import { motion } from "framer-motion";
import ExpeditionCard from "@/components/landing/ExpeditionCard";
import { fadeInUp, slideInRight, staggerContainer } from "@/lib/animations";

const features = [
  "Smart Expense Splitting",
  "AI Itinerary Builder",
  "Interactive Route Mapping",
  "Receipt OCR + Digital Invoices",
  "Real-time Trip Collaboration",
];

const expeditions = [
  {
    title: "Goa Beach Escape",
    description:
      "Sunset shores, coastal cafés, and breezy plans tailored for your group.",
    duration: "5 Days",
  },
  {
    title: "Himalayan Basecamp",
    description:
      "Mountain trails, shared cabins, and smart budgeting for high-altitude memories.",
    duration: "8 Days",
  },
  {
    title: "Kerala Backwaters",
    description:
      "Houseboats, local cuisine, and synchronized day plans from one calm dashboard.",
    duration: "6 Days",
  },
];

export default function FeatureSection() {
  return (
    <>
      <section className="bg-[#FFF2E6] px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="mb-10 flex items-end justify-between gap-4"
          >
            <motion.h2
              variants={fadeInUp}
              className="font-serif text-3xl text-[#4A2B32] sm:text-4xl"
            >
              Upcoming Expeditions
            </motion.h2>
            <motion.p variants={fadeInUp} className="hidden text-sm text-[#7a646f] md:block">
              Curated templates to launch your next journey in minutes.
            </motion.p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {expeditions.map((trip) => (
              <ExpeditionCard key={trip.title} {...trip} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fff8f2] px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"
          >
            <motion.h3
              variants={fadeInUp}
              className="mb-8 font-serif text-3xl text-[#4A2B32] sm:text-4xl"
            >
              Built for Real Group Travel
            </motion.h3>
            <ul className="space-y-4">
              {features.map((item) => (
                <motion.li
                  key={item}
                  variants={fadeInUp}
                  className="border-b border-dashed border-[#d3bfb4] pb-4 text-sm text-[#6d5864] last:border-b-0"
                >
                  • {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={slideInRight}
            className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#f0d7cd] to-[#eac4b9]"
          >
            <motion.div
              animate={{ x: [0, 24, 0], y: [0, -24, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeOut" }}
              className="relative h-40 w-36 rounded-3xl bg-gradient-to-br from-[#BE6853] to-[#9D5950] shadow-xl"
            >
              <div className="absolute left-1/2 top-1/2 h-24 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 bg-white/20" />
            </motion.div>
            <p className="absolute bottom-5 text-xs uppercase tracking-[0.2em] text-[#7d5359]">
              Illustrated Skier Placeholder
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
