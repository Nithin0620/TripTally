"use client";

import { motion } from "framer-motion";
import GlassCard from "./ui/GlassCard";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const features = [
  {
    title: "Smart Budget Tracker",
    description:
      "Automatically track group expenses, split bills fairly, and settle up with one tap. AI suggests optimal payment methods.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
    icon: "💰",
  },
  {
    title: "Real-Time Chat Assistant",
    description:
      "Get instant answers about your trip, weather updates, local tips, and translation help—all powered by AI.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80",
    icon: "💬",
  },
  {
    title: "AI Itinerary Builder",
    description:
      "Generate personalized day-by-day plans based on your interests, budget, and travel style. Optimize routes automatically.",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
    icon: "🗺️",
  },
];

export default function FeatureSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h2 className="mb-4 text-4xl font-black text-[#163427] md:text-5xl">
            Our AI Simplifies Every Step
          </h2>
          <p className="text-xl text-[#5f7a6c]">
            From planning to payment, we've got you covered.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={staggerItem}>
              <GlassCard className="h-full overflow-hidden p-0">
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${feature.image})` }}
                />
                <div className="p-6">
                  <div className="mb-3 text-4xl">{feature.icon}</div>
                  <h3 className="mb-3 text-2xl font-bold text-[#163427]">
                    {feature.title}
                  </h3>
                  <p className="text-[#5f7a6c]">{feature.description}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
