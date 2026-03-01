'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Place } from '@/types';
import PlaceCard from './PlaceCard';
import { Loader2 } from 'lucide-react';

interface CategorySectionProps {
  category: string;
  places: Place[];
  onLoadMore?: (category: string, offset: number) => Promise<Place[]>;
}

export default function CategorySection({
  category,
  places,
  onLoadMore,
}: CategorySectionProps) {
  const [displayedPlaces, setDisplayedPlaces] = useState(places);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Sync displayedPlaces with places prop when it changes
  useEffect(() => {
    setDisplayedPlaces(places);
  }, [places]);

  // Auto-load more places on initial mount
  useEffect(() => {
    const autoLoadMore = async () => {
      if (initialLoadDone || !onLoadMore) {
        return;
      }

      console.log(`[${category}] Auto-loading more places. Current count: ${places.length}`);
      setIsLoading(true);
      try {
        const newPlaces = await onLoadMore(category, places.length);
        console.log(`[${category}] Fetched ${newPlaces?.length || 0} new places`);
        
        if (!newPlaces || newPlaces.length === 0) {
          console.log(`[${category}] No new places returned, but keeping hasMore=true for manual load`);
          // Don't set hasMore to false here - let user manually try to load more
        } else {
          setDisplayedPlaces((prev) => [...prev, ...newPlaces]);
        }
      } catch (error) {
        console.error(`[${category}] Failed to auto-load more places:`, error);
      } finally {
        setIsLoading(false);
        setInitialLoadDone(true);
      }
    };

    autoLoadMore();
  }, [category, onLoadMore, initialLoadDone, places.length]);

  const handleLoadMore = async () => {
    if (!onLoadMore) return;

    setIsLoading(true);
    try {
      // Pass the current displayed places length as the offset
      const newPlaces = await onLoadMore(category, displayedPlaces.length);
      
      // If no new places returned, hide the button
      if (!newPlaces || newPlaces.length === 0) {
        setHasMore(false);
      } else {
        setDisplayedPlaces((prev) => [...prev, ...newPlaces]);
      }
    } catch (error) {
      console.error('Failed to load more places:', error);
      setHasMore(false); // Hide button on error too
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
              <PlaceCard place={place} isAI={place.id.startsWith('ai-')} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Debug info - shows count */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 text-center mb-4">
          Showing {displayedPlaces.length} places ({places.length} from DB)
        </div>
      )}

      {/* Auto-loading indicator */}
      {isLoading && !initialLoadDone && (
        <div className="flex justify-center items-center gap-3 py-8 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <p>Loading more {category.toLowerCase()}...</p>
        </div>
      )}

      {/* See More Button - Always show after initial load completes */}
      {onLoadMore && hasMore && (
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
