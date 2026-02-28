'use client';

import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';

interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  launched: boolean;
}

// Memoized countdown unit to prevent unnecessary re-renders
const CountdownUnit = memo(({
  value,
  label,
  index,
}: {
  value: number;
  label: string;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{
      duration: 0.5,
      delay: index * 0.1,
      ease: 'easeOut',
    }}
    className="flex flex-col items-center group"
  >
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-[#EFEC07]/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#17394B] to-[#02131B] rounded-lg border border-[#EFEC07]/30 group-hover:border-[#EFEC07]/60 backdrop-blur-sm transition-colors duration-300" />

      {/* Number display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          key={value}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#EFEC07]"
        >
          {String(value).padStart(2, '0')}
        </motion.span>
      </div>
    </div>

    {/* Label */}
    <p className="mt-3 text-sm sm:text-base text-[#FFFFFF]/70 font-medium uppercase tracking-wider group-hover:text-[#EFEC07] transition-colors duration-300">
      {label}
    </p>
  </motion.div>
));

CountdownUnit.displayName = 'CountdownUnit';

export default function CountdownTimer() {
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [launched, setLaunched] = useState<boolean>(false);

  // Calculate target timestamp once on mount
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let targetDate = new Date(currentYear, currentMonth, 21, 0, 0, 0);

    if (now > targetDate) {
      targetDate = new Date(currentYear, currentMonth + 1, 21, 0, 0, 0);
    }

    const targetMs = targetDate.getTime();

    // Calculate initial remaining time
    const nowMs = now.getTime();
    const remaining = Math.max(0, targetMs - nowMs);
    setRemainingTime(remaining);

    if (remaining === 0) {
      setLaunched(true);
      return;
    }

    // Set up interval to update remaining time every second
    const interval = setInterval(() => {
      const nowMs = Date.now();
      const remaining = Math.max(0, targetMs - nowMs);
      setRemainingTime(remaining);

      if (remaining === 0) {
        setLaunched(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Derive countdown values from remaining time (no re-render unless values change)
  const countdownValues = useMemo(() => {
    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
    const seconds = Math.floor((remainingTime / 1000) % 60);

    return { days, hours, minutes, seconds };
  }, [remainingTime]);

  if (launched) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#EFEC07]">
          🚀 We're Live!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex justify-center gap-3 sm:gap-4 md:gap-6 flex-wrap"
    >
      <CountdownUnit value={countdownValues.days} label="Days" index={0} />
      <CountdownUnit value={countdownValues.hours} label="Hours" index={1} />
      <CountdownUnit value={countdownValues.minutes} label="Minutes" index={2} />
      <CountdownUnit value={countdownValues.seconds} label="Seconds" index={3} />
    </motion.div>
  );
}
