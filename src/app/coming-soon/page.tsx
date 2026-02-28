'use client';

import { motion } from 'framer-motion';
import CountdownTimer from '@/components/CountdownTimer';
import VisitorCounter from '@/components/VisitorCounter';
import WaitlistSection from '@/components/WaitlistSection';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#02131B] overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#EFEC07]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#17394B]/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <header className="min-h-screen flex flex-col items-center justify-center px-4 py-20 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl w-full"
          >
            {/* Logo/Brand */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-[#EFEC07] mb-2">
                TripTally
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-[#EFEC07] to-[#17394B] mx-auto" />
            </motion.div>

            {/* Main Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#FFFFFF] mb-6"
            >
              Launching Soon
            </motion.h2>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl sm:text-2xl text-[#FFFFFF]/80 mb-8 sm:mb-12"
            >
              TripTally goes live on the{' '}
              <span className="text-[#EFEC07] font-semibold">21st</span>
            </motion.p>

            {/* Countdown Timer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-16 sm:mb-20"
            >
              <CountdownTimer />
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="space-y-4 mb-12 sm:mb-16"
            >
              <p className="text-lg sm:text-xl text-[#FFFFFF]/70 max-w-2xl mx-auto">
                The all-in-one platform for group travel planning, itinerary management,
                and expense splitting with AI-powered recommendations.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base">
                <span className="flex items-center gap-2 text-[#EFEC07]">
                  <span className="text-lg">✨</span> Smart Planning
                </span>
                <span className="flex items-center gap-2 text-[#EFEC07]">
                  <span className="text-lg">💰</span> Easy Splitting
                </span>
                <span className="flex items-center gap-2 text-[#EFEC07]">
                  <span className="text-lg">🤖</span> AI Powered
                </span>
              </div>
            </motion.div>

            {/* Visitor Counter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="pt-8 border-t border-[#EFEC07]/10"
            >
              <VisitorCounter />
            </motion.div>
          </motion.div>
        </header>

        {/* Waitlist Section */}
        <WaitlistSection />

        {/* Footer */}
        <footer className="relative z-10 border-t border-[#EFEC07]/10 py-8 px-4">
          <div className="max-w-4xl mx-auto text-center text-[#FFFFFF]/50 text-sm">
            <p>© 2026 TripTally. All rights reserved.</p>
            <p className="mt-2">Coming to transform your travel experience.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
