'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Place } from '@/types';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { useUnsplashImage } from '@/hooks/useUnsplashImage';

interface PlaceCardProps {
  place: Place;
  isAI?: boolean;
}

export default function PlaceCard({ place, isAI = false }: PlaceCardProps) {
  const slug = place.name.toLowerCase().replace(/\s+/g, '-');
  const { image, loading } = useUnsplashImage(place.name, place.hero_image);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/95 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all overflow-hidden"
    >
      <Link href={`/explore/${slug}`} className="block">
        {/* Photo Container */}
        <div className="relative h-48 overflow-hidden bg-slate-100">
          {loading ? (
            <div className="w-full h-full bg-slate-200 animate-pulse" />
          ) : (
            <img
              src={image?.url || place.hero_image}
              alt={image?.alt || place.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

          {isAI && (
            <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-md text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="h-3 w-3" />
              <span>AI Verified</span>
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="text-lg font-black leading-snug drop-shadow-sm group-hover:text-blue-200 transition-colors">
              {place.name}
            </h3>
            <p className="text-[11px] font-semibold text-slate-300 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-amber-400" />
              <span>{place.state || place.category}</span>
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4">
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {place.description}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
            <span>Explore Travel Guide</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
