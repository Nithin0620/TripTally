"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const steps = [
  { id: "01", title: "Create Trip" },
  { id: "02", title: "Add Activities" },
  { id: "03", title: "Track Shared Expenses" },
  { id: "04", title: "Settle Instantly" },
];

export default function ProcessSection() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          className="mb-10 text-center font-serif text-3xl text-[#4A2B32] sm:text-4xl"
        >
          How It Works
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step) => (
            <motion.article
              key={step.id}
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="rounded-3xl bg-gradient-to-br from-[#BE6853] via-[#9D5950] to-[#6A446C] p-6 text-white shadow-lg shadow-[#9D5950]/20"
            >
              <p className="mb-5 text-sm font-semibold tracking-wide text-[#F5E1A6]">{step.id}</p>
              <h3 className="text-xl font-medium leading-snug">{step.title}</h3>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
