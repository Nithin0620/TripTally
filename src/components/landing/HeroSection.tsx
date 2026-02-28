"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import { fadeIn, fadeInUp, gentleFloat, staggerContainer } from "@/lib/animations";

const statCards = [
  "10,000+ Trips Planned",
  "Auto Expense Settlement",
  "AI-Powered Itineraries",
];

export default function HeroSection() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 28);
      setScrollY(window.scrollY);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-[#BE6853] via-[#6A446C] to-[#141a36] px-4 pb-20 pt-6 sm:px-6 lg:px-10">
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`mx-auto flex w-full max-w-6xl items-center justify-between rounded-3xl border border-white/20 px-4 py-3 transition duration-700 md:px-6 ${
          isScrolled
            ? "bg-[#2a2242]/55 backdrop-blur-lg"
            : "bg-transparent backdrop-blur-0"
        }`}
      >
        <Link
          href="/"
          className="text-base font-semibold tracking-wide text-[#F5E1A6] md:text-lg"
        >
          TripTally
        </Link>
        <div className="hidden items-center gap-4 text-sm text-white md:flex">
          <Link href="/templates" className="transition duration-500 hover:text-[#F5E1A6]">
            View Templates
          </Link>
          <Link href="/auth/login" className="transition duration-500 hover:text-[#F5E1A6]">
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="rounded-full bg-white/12 px-4 py-2 transition duration-500 hover:bg-white/20"
          >
            Create Account
          </Link>
        </div>
      </motion.nav>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55vh]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: -scrollY * 0.06 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute -bottom-28 left-[-8%] h-[48vh] w-[70%] rounded-[50%] bg-[#161f45]/70 blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: -scrollY * 0.1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute -bottom-32 right-[-10%] h-[46vh] w-[75%] rounded-[50%] bg-[#22295a]/75 blur-[2px]"
        />
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: -scrollY * 0.14 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.08 }}
          className="absolute -bottom-24 left-[12%] h-[40vh] w-[70%] rounded-[50%] bg-[#101533]/90"
        />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative mx-auto mt-14 flex w-full max-w-6xl flex-col gap-10 md:mt-20"
      >
        <motion.p
          variants={fadeIn}
          className="text-center text-xs font-medium uppercase tracking-[0.28em] text-[#F5E1A6]"
        >
          Calm Expedition Storytelling
        </motion.p>

        <motion.h1
          variants={fadeInUp}
          className="mx-auto max-w-4xl text-center font-serif text-5xl uppercase tracking-[0.08em] text-white sm:text-6xl md:text-7xl"
        >
          EXPEDITIONS
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="mx-auto max-w-2xl text-center text-base text-white/90 sm:text-lg"
        >
          Plan, track, and split every journey with clarity.
        </motion.p>

        <motion.div variants={fadeInUp} className="flex justify-center">
          <Button href="/dashboard" className="px-7 py-3.5 text-sm sm:text-base">
            Start Planning with TripTally →
          </Button>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative mx-auto grid w-full max-w-5xl gap-4 pb-10 md:grid-cols-3"
        >
          {statCards.map((card) => (
            <motion.div
              key={card}
              variants={gentleFloat}
              initial="rest"
              animate="animate"
              className="will-change-transform"
            >
              <GlassCard className="text-center text-sm font-medium text-white sm:text-base">
                {card}
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
