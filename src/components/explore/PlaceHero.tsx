'use client';

import { motion } from 'framer-motion';
import { useUnsplashImage } from '@/hooks/useUnsplashImage';

interface PlaceHeroProps {
  name: string;
  state: string;
  category: string;
  heroImage: string;
  description: string;
}

export default function PlaceHero({
  name,
  state,
  category,
  heroImage,
  description,
}: PlaceHeroProps) {
  const { image, loading } = useUnsplashImage(name, heroImage);

  return (
    <div className="relative w-full h-screen min-h-[500px] overflow-hidden">
      {/* Hero Image with Parallax */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        viewport={{ once: true }}
      >
        {loading ? (
          <div className="w-full h-full bg-gray-800 animate-pulse" />
        ) : (
          <img
            src={image?.url || heroImage}
            alt={image?.alt || name}
            className="w-full h-full object-cover"
          />
        )}
      </motion.div>

      {/* Gradient Overlay - Enhanced for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#02131B] via-[#02131B]/60 to-transparent" />

      {/* Additional diagonal accent gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#02131B]/80 via-transparent to-transparent" />

      {/* Content - Positioned at bottom */}
      <div className="absolute inset-0 flex flex-col justify-end">
        <motion.div
          className="px-6 md:px-12 lg:px-16 pb-16 md:pb-20 lg:pb-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          {/* Category Badge */}
          <motion.div
            className="inline-block mb-4 bg-[#EFEC07]/20 border border-[#EFEC07]/50 backdrop-blur-sm px-4 py-2 rounded-full"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <span className="text-[#EFEC07] text-sm font-semibold">{category}</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {name}
          </motion.h1>

          {/* Location + Description */}
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 text-lg text-gray-300">
              <span className="text-2xl">📍</span>
              <span className="text-sm md:text-base">{state}, India</span>
            </div>

            <p className="max-w-2xl text-gray-200 text-sm md:text-base leading-relaxed line-clamp-3">
              {description.substring(0, 200)}...
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Photographer Credit */}
      {image && image.photographer !== 'Unknown' && (
        <div className="absolute bottom-4 right-4 z-10">
          <a
            href={image.photographerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/60 hover:text-white/90 transition-colors backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-full"
          >
            📷 {image.photographer}
          </a>
        </div>
      )}

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs font-medium">Scroll to explore</span>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
