"use client";

import { motion } from "framer-motion";
import GlassCard from "./ui/GlassCard";
import Button from "./ui/Button";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "Up to 3 trips",
      "Basic expense tracking",
      "AI chat assistant (10 msgs/day)",
      "Standard itinerary builder",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Family Pack",
    price: "$12",
    period: "per month",
    features: [
      "Unlimited trips",
      "Advanced expense splitting",
      "Unlimited AI chat",
      "Smart itinerary optimization",
      "Real-time collaboration",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Corporate",
    price: "$49",
    period: "per month",
    features: [
      "Everything in Family Pack",
      "Team management dashboard",
      "Company expense reports",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guaranteed uptime",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingSection() {
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
          <h2 className="mb-4 text-4xl font-black text-white md:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-white/70">
            Choose the plan that fits your travel needs.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {plans.map((plan, index) => (
            <motion.div key={index} variants={staggerItem}>
              <GlassCard
                className={`relative h-full p-8 ${
                  plan.highlighted
                    ? "border-2 border-brand-accent shadow-[0_0_30px_rgba(239,236,7,0.35)]"
                    : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-accent px-4 py-1 text-sm font-bold text-brand-bg">
                    Most Popular
                  </div>
                )}

                <h3 className="mb-2 text-2xl font-bold text-white">
                  {plan.name}
                </h3>

                <div className="mb-6">
                  <span className="text-5xl font-black text-white">
                    {plan.price}
                  </span>
                  <span className="text-white/60">/{plan.period}</span>
                </div>

                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/80">
                      <span className="mt-1 text-brand-accent">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlighted ? "primary" : "outline"}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
