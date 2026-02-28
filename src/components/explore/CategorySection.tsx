'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Place } from '@/types';
import PlaceCard from './PlaceCard';
import { Loader2 } from 'lucide-react';

interface CategorySectionProps {
  category: string;
  places: Place[];
  onLoadMore?: (category: string) => Promise<Place[]>;
}

export default function CategorySection({
  category,
  places,
  onLoadMore,
}: CategorySectionProps) {
  const [displayedPlaces, setDisplayedPlaces] = useState(places);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = async () => {
    if (!onLoadMore) return;

    setIsLoading(true);
    try {
      const newPlaces = await onLoadMore(category);
      setDisplayedPlaces((prev) => [...prev, ...newPlaces]);
    } catch (error) {
      console.error('Failed to load more places:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get emoji for category
  const getCategoryEmoji = (cat: string) => {
    const emojis: Record<string, string> = {
      Beaches: '🏖️',
      Mountains: '⛰️',
      Cities: '🏙️',
      Spiritual: '🙏',
      Luxury: '✨',
    };
    return emojis[cat] || '📍';
  };

  return (
    <section className="py-16 md:py-24">
      {/* Category Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center gap-3">
          <span className="text-3xl">{getCategoryEmoji(category)}</span>
          {category}
        </h2>
        <div className="w-12 h-1 bg-gradient-to-r from-[#EFEC07] to-transparent rounded-full" />
      </motion.div>

      {/* Places Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
          hidden: {},
        }}
      >
        <AnimatePresence mode="popLayout">
          {displayedPlaces.map((place, idx) => (
            <motion.div
              key={place.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              layout
            >
              <PlaceCard place={place} isAI={idx >= places.length} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* See More Button */}
      {onLoadMore && displayedPlaces.length <= places.length + 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="relative group px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#EFEC07]/30 rounded-full text-white font-semibold transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                See More {category}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </>
            )}
          </button>
        </motion.div>
      )}
    </section>
  );
}
