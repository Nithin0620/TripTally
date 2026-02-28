'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Place } from '@/types';
import { ArrowRight } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  isAI?: boolean;
}

export default function PlaceCard({ place, isAI = false }: PlaceCardProps) {
  const slug = place.name.toLowerCase().replace(/\s+/g, '-');

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group"
    >
      <Link href={`/explore/${slug}`}>
        <div className="relative rounded-3xl overflow-hidden bg-gray-900 cursor-pointer h-96">
          {/* Image with ratio maintenance */}
          <img
            src={place.hero_image}
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300" />

          {/* AI Badge */}
          {isAI && (
            <div className="absolute top-4 right-4 bg-[#EFEC07]/20 backdrop-blur-sm border border-[#EFEC07] text-[#EFEC07] px-3 py-1.5 rounded-full text-xs font-semibold">
              AI Generated
            </div>
          )}

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            {/* Title */}
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {place.name}
            </h3>

            {/* State + Category */}
            <p className="text-sm text-gray-300 mb-3 flex items-center gap-2">
              <span className="text-[#EFEC07]">📍</span>
              {place.state} • {place.category}
            </p>

            {/* Preview Description */}
            <p className="text-gray-200 text-sm line-clamp-2 mb-4">
              {place.description.substring(0, 120)}...
            </p>

            {/* CTA Button */}
            <div className="flex items-center gap-2 text-[#EFEC07] font-semibold text-sm group-hover:gap-3 transition-all duration-300">
              <span>Explore More</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
            </div>
          </div>

          {/* Glow Effect on Hover */}
          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 20px rgba(239, 236, 7, 0.2)',
            }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
