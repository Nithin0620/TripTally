import { Suspense } from 'react';
import { motion } from 'framer-motion';
import CategorySection from '@/components/explore/CategorySection';
import { getExploreCategories, getMorePlacesByCategory } from '@/lib/explore-db';
import { ExploreCategory } from '@/types';

// Metadata
export const metadata = {
  title: 'Explore - TripTally | Discover Your Next Adventure',
  description:
    'Explore premium travel destinations across India. Discover beaches, mountains, cities, spiritual sites, and luxury travels.',
};

/**
 * Category Section Component with Server-Side Data Loading
 */
async function ExploreContent() {
  let categories: ExploreCategory[] = [];

  try {
    categories = await getExploreCategories();
  } catch (error) {
    console.error('Failed to load categories:', error);
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            No Places Found
          </h2>
          <p className="text-gray-400">
            We're working on loading amazing destinations for you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12">
      {categories.map((categoryData) => (
        <CategorySection
          key={categoryData.category}
          category={categoryData.category}
          places={categoryData.places}
          onLoadMore={async (category) => {
            'use server';
            return await getMorePlacesByCategory(category, categoryData.places.length);
          }}
        />
      ))}
    </div>
  );
}

/**
 * Hero Section Component
 */
function ExploreHero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#17394B]/30 to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-5xl mx-auto text-center px-4 md:px-8"
      >
        <motion.div
          className="inline-block mb-4 bg-[#EFEC07]/10 border border-[#EFEC07]/30 rounded-full px-4 py-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="text-[#EFEC07] text-sm font-semibold">
            DISCOVER • EXPLORE • JOURNEY
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Explore India's
          <br />
          <span className="bg-gradient-to-r from-[#EFEC07] to-yellow-300 bg-clip-text text-transparent">
            Most Magical Destinations
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          From serene beaches to majestic mountains, spiritual retreats to luxurious escapes—
          discover handpicked destinations that match your travel style and dreams.
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          {[
            '🏖️ 40+ Beaches',
            '⛰️ Stunning Mountains',
            '🏙️ Vibrant Cities',
            '🙏 Spiritual Havens',
            '✨ Luxury Escapes',
          ].map((pill, idx) => (
            <motion.div
              key={idx}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm hover:border-[#EFEC07]/30 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-sm text-gray-300">{pill}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/**
 * Main Explore Page
 */
export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-[#02131B] text-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Hero */}
        <ExploreHero />

        {/* Categories with Suspense Boundary */}
        <Suspense
          fallback={
            <div className="py-20 text-center">
              <div className="inline-block">
                <div className="w-12 h-12 border-2 border-[#EFEC07] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-400">Loading amazing destinations...</p>
              </div>
            </div>
          }
        >
          <ExploreContent />
        </Suspense>

        {/* CTA Section */}
        <motion.section
          className="py-20 md:py-32 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Plan Your Next Adventure?
          </motion.h2>

          <motion.p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Use our AI-powered planner to create personalized itineraries, manage
            budgets, and split expenses with your travel companions.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <button className="px-8 py-4 bg-[#EFEC07] text-[#02131B] rounded-full font-bold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#EFEC07]/40 hover:scale-105">
              Start Planning
            </button>
            <button className="px-8 py-4 bg-white/10 border border-white/30 text-white rounded-full font-bold text-lg transition-all duration-300 hover:border-[#EFEC07]/50 hover:bg-white/20">
              Get Inspiration
            </button>
          </motion.div>
        </motion.section>
      </div>
    </main>
  );
}
