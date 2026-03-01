'use client';

import { motion } from 'framer-motion';
import { Calendar, Banknote, Clock } from 'lucide-react';

interface TravelInfoSectionProps {
  budget: string;
  duration: string;
  bestTime: string;
}

export default function TravelInfoSection({
  budget,
  duration,
  bestTime,
}: TravelInfoSectionProps) {
  const infoItems = [
    {
      icon: Banknote,
      label: 'Average Budget',
      value: budget,
      color: 'from-[#EFEC07]/20 to-[#EFEC07]/5',
      borderColor: 'border-[#EFEC07]/30',
    },
    {
      icon: Clock,
      label: 'Travel Duration',
      value: duration,
      color: 'from-blue-500/20 to-blue-500/5',
      borderColor: 'border-blue-500/30',
    },
    {
      icon: Calendar,
      label: 'Best Time to Visit',
      value: bestTime,
      color: 'from-emerald-500/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/30',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="py-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Travel Information
        </h2>
        <div className="w-12 h-1 bg-gradient-to-r from-[#EFEC07] to-transparent rounded-full" />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {infoItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`relative rounded-2xl border ${item.borderColor} bg-gradient-to-br ${item.color} backdrop-blur-sm p-8 overflow-hidden group cursor-default`}
              >
                {/* Glowing background effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(600px at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(239, 236, 7, 0.15), transparent 80%)`,
                  }}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm"
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon size={24} className="text-[#EFEC07]" />
                  </motion.div>

                  {/* Label */}
                  <p className="text-sm text-gray-400 font-medium mb-2">
                    {item.label}
                  </p>

                  {/* Value */}
                  <p className="text-2xl md:text-3xl font-bold text-white break-words">
                    {item.value}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
