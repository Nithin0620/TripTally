"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const faqItems = [
  {
    question: "How does TripTally calculate settlements?",
    answer:
      "TripTally balances group expenses automatically by calculating who paid, who owes, and the shortest settlement path to clear dues.",
  },
  {
    question: "Can I scan receipts?",
    answer:
      "Yes. Receipt OCR support helps extract amounts and merchant details, then logs them directly into your shared expense timeline.",
  },
  {
    question: "Does it work offline?",
    answer:
      "Core trip details remain accessible with sync-friendly behavior, and updates are pushed once your connection is restored.",
  },
  {
    question: "Can I use templates?",
    answer:
      "Absolutely. You can pick from curated expedition templates and customize stops, activities, and budget flows for your group.",
  },
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section className="bg-[#FFF2E6] px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-center font-serif text-3xl text-[#4A2B32] sm:text-4xl">FAQ</h2>

        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = activeIndex === index;

            return (
              <article key={item.question} className="rounded-3xl bg-white p-5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setActiveIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="text-sm font-semibold text-[#4A2B32] sm:text-base">{item.question}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-[#9D5950]"
                  >
                    ▼
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-sm leading-6 text-[#6d5864]">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
