'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { visitor } from '@/services/visitor.service';

export default function VisitorCounter() {
  const [count, setCount] = useState<number>(0);
  const [displayCount, setDisplayCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  // Initialize visitor registration and fetch count - only once
  useEffect(() => {
    if (hasInitialized) return;

    const initializeVisitor = async () => {
      try {
        if (typeof window === 'undefined') return;

        // Check if new visitor BEFORE creating ID
        if (visitor.isNewVisitor()) {
          // Create new visitor ID and register
          const newVisitorId = visitor.createVisitorId();
          if (newVisitorId) {
            await visitor.registerVisitor(newVisitorId);
          }
        }

        // Fetch total visitor count
        const totalCount = await visitor.getVisitorCount();
        setCount(totalCount);
      } catch {
        // Failsafe: set count to 0 if anything fails
        setCount(0);
      } finally {
        setLoading(false);
        setHasInitialized(true);
      }
    };

    initializeVisitor();
  }, [hasInitialized]);

  // Animate number counting when count changes
  useEffect(() => {
    if (count === 0) return;

    const duration = 2000; // 2 seconds animation
    const steps = 60;
    const increment = count / steps;
    let current = displayCount;

    const timer = setInterval(() => {
      current += increment;
      if (current >= count) {
        setDisplayCount(count);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [count, displayCount]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center gap-2"
      >
        <div className="w-2 h-2 bg-[#EFEC07]/50 rounded-full animate-pulse" />
        <span className="text-[#FFFFFF]/60">Loading explorers count...</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center group"
    >
      <div className="relative inline-block">
        {/* Accent glow background */}
        <div className="absolute -inset-4 bg-[#EFEC07]/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex items-center justify-center gap-3 flex-wrap p-6 rounded-2xl border border-[#EFEC07]/20 group-hover:border-[#EFEC07]/40 transition-colors duration-300">
          <motion.span
            key={displayCount}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-3xl sm:text-4xl font-bold text-[#EFEC07]"
          >
            {formatNumber(displayCount)}
          </motion.span>
          <span className="text-lg sm:text-xl text-[#FFFFFF]/80 font-medium">
            explorers waiting 🌍
          </span>
        </div>
      </div>
    </motion.div>
  );
}
