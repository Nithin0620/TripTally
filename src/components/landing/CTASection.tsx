"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import { fadeInUp } from "@/lib/animations";

export default function CTASection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#6A446C] to-[#141a36] px-4 py-20 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="mx-auto mb-10 flex h-48 w-48 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.4, ease: "easeOut", repeat: Infinity }}
              className="h-20 w-20 rounded-full bg-[#F5E1A6]/70 blur-sm"
            />
            <span className="absolute mt-28 text-xs uppercase tracking-[0.18em] text-white/80">
              Campfire Placeholder
            </span>
          </motion.div>

          <GlassCard className="mx-auto max-w-2xl bg-white/10 p-8 text-center">
            <h3 className="mb-5 font-serif text-3xl text-white sm:text-4xl">
              Travel Smarter. Travel Together.
            </h3>
            <Button href="/dashboard" className="px-8 py-3 text-sm sm:text-base">
              Create Your First Trip
            </Button>
          </GlassCard>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#111735] px-4 py-20 sm:px-6 lg:px-10">
        <motion.div
          animate={{ y: -scrollY * 0.04 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-x-0 bottom-0 h-full"
        >
          <div className="absolute -bottom-28 left-[-8%] h-[40vh] w-[68%] rounded-[50%] bg-[#1a2452]/90" />
          <div className="absolute -bottom-32 right-[-8%] h-[42vh] w-[72%] rounded-[50%] bg-[#141c45]/85" />
          <div className="absolute -bottom-24 left-[14%] h-[34vh] w-[64%] rounded-[50%] bg-[#0f1430]" />
        </motion.div>

        <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="mb-8 font-serif text-4xl text-white sm:text-5xl"
          >
            Your Next Journey Starts Here
          </motion.h2>

          <Button href="/dashboard" className="px-8 py-3.5 text-sm sm:text-base">
            Explore TripTally
          </Button>
        </div>
      </section>
    </>
  );
}
