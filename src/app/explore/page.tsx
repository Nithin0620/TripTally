'use client';

import CategorySection from '@/components/explore/CategorySection';
import { ExploreCategory } from '@/types';
import { useEffect, useState } from 'react';

/**
 * Hero Section Component
 */
function ExploreHero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#17394B]/30 to-transparent pointer-events-none" />

      <div
        className="relative z-10 max-w-5xl mx-auto text-center px-4 md:px-8 animate-fadeInUp"
      >
        <div
          className="inline-block mb-4 bg-[#EFEC07]/10 border border-[#EFEC07]/30 rounded-full px-4 py-2 animate-fadeInDown"
        >
          <span className="text-[#EFEC07] text-sm font-semibold">
            DISCOVER • EXPLORE • JOURNEY
          </span>
        </div>

        <h1
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fadeInUp"
          style={{ animationDelay: '0.1s' }}
        >
          Explore India's
          <br />
          <span className="bg-gradient-to-r from-[#EFEC07] to-yellow-300 bg-clip-text text-transparent">
            Most Magical Destinations
          </span>
        </h1>

        <p
          className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed animate-fadeInUp"
          style={{ animationDelay: '0.2s' }}
        >
          From serene beaches to majestic mountains, spiritual retreats to luxurious escapes—
          discover handpicked destinations that match your travel style and dreams.
        </p>

        {/* Feature Pills */}
        <div
          className="flex flex-wrap justify-center gap-4 mb-12 animate-fadeInUp"
          style={{ animationDelay: '0.3s' }}
        >
          {[
            '🏖️ 40+ Beaches',
            '⛰️ Stunning Mountains',
            '🏙️ Vibrant Cities',
            '🙏 Spiritual Havens',
            '✨ Luxury Escapes',
          ].map((pill, idx) => (
            <div
              key={idx}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm hover:border-[#EFEC07]/30 transition-colors cursor-pointer hover:scale-105"
            >
              <span className="text-sm text-gray-300">{pill}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
}

/**
 * CTA Section Component
 */
function ExploreCTA() {
  return (
    <section className="py-20 md:py-32 text-center">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .cta-section {
          opacity: 0;
        }

        .cta-section.visible {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>

      <h2
        className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fadeInUp"
      >
        Ready to Plan Your Next Adventure?
      </h2>

      <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
        Use our AI-powered planner to create personalized itineraries, manage
        budgets, and split expenses with your travel companions.
      </p>

      <div
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <button className="px-8 py-4 bg-[#EFEC07] text-[#02131B] rounded-full font-bold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#EFEC07]/40 hover:scale-105">
          Start Planning
        </button>
        <button className="px-8 py-4 bg-white/10 border border-white/30 text-white rounded-full font-bold text-lg transition-all duration-300 hover:border-[#EFEC07]/50 hover:bg-white/20">
          Get Inspiration
        </button>
      </div>
    </section>
  );
}

/**
 * Main Explore Page
 */
export default function ExplorePage() {
  const [categories, setCategories] = useState<ExploreCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/explore/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <main className="min-h-screen bg-[#02131B] text-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Hero */}
        <ExploreHero />

        {/* Categories */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block">
              <div className="w-12 h-12 border-2 border-[#EFEC07] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400">Loading amazing destinations...</p>
            </div>
          </div>
        ) : categories.length === 0 ? (
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
        ) : (
          <div className="space-y-8 md:space-y-12">
            {categories.map((categoryData) => (
              <CategorySection
                key={categoryData.category}
                category={categoryData.category}
                places={categoryData.places}
                onLoadMore={async (category, offset) => {
                  const response = await fetch(
                    `/api/explore/places?category=${encodeURIComponent(category)}&offset=${offset}`
                  );
                  if (!response.ok) {
                    console.error('API returned error:', response.status);
                    return [];
                  }
                  return await response.json();
                }}
              />
            ))}
          </div>
        )}

        {/* CTA Section */}
        <ExploreCTA />
      </div>
    </main>
  );
}
