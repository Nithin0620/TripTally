"use client";

import { motion } from "framer-motion";
import NeuCard from "./ui/NeuCard";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { CreditCard, MessageSquareText, Route } from "lucide-react";

const features = [
  {
    title: "Smart Budget Tracker",
    description:
      "Automatically track group expenses, split bills fairly, and settle up with one tap. AI suggests optimal payment methods.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
    icon: CreditCard,
  },
  {
    title: "Real-Time Chat Assistant",
    description:
      "Get instant answers about your trip, weather updates, local tips, and translation help—all powered by AI.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80",
    icon: MessageSquareText,
  },
  {
    title: "AI Itinerary Builder",
    description:
      "Generate personalized day-by-day plans based on your interests, budget, and travel style. Optimize routes automatically.",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
    icon: Route,
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
          <span className="mb-4 inline-block rounded-full border border-brand-sand/50 bg-brand-sand/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-accent">
            Features
          </span>
          <h2 className="mb-4 font-serif text-4xl font-bold text-brand-text md:text-5xl tracking-tight">
            Every Step, Simplified
          </h2>
          <p className="mx-auto max-w-xl text-lg text-brand-text/60">
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
              <NeuCard className="group h-full overflow-hidden !p-0">
                <div className="relative h-48 overflow-hidden">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${feature.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="p-6">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-sand/40 text-brand-accent">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-3 font-serif text-xl font-bold text-brand-text">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-brand-text/60">{feature.description}</p>
                </div>
              </NeuCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
