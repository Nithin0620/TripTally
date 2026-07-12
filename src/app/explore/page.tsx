'use client';

import Link from 'next/link';
import CategorySection from '@/components/explore/CategorySection';
import PlaceCard from '@/components/explore/PlaceCard';
import { ExploreCategory, Place, PlacesApiResponse, SearchApiResponse } from '@/types';
import { useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

/**
 * Hero Section Component
 */
function ExploreHero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/70 to-transparent pointer-events-none" />

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
          className="text-5xl md:text-7xl font-bold text-[#0F172A] mb-6 leading-tight animate-fadeInUp"
          style={{ animationDelay: '0.1s' }}
        >
          Explore India's
          <br />
          <span className="bg-gradient-to-r from-[#EFEC07] to-yellow-300 bg-clip-text text-transparent">
            Most Magical Destinations
          </span>
        </h1>

        <p
          className="text-lg md:text-xl text-[#64748B] max-w-3xl mx-auto mb-8 leading-relaxed animate-fadeInUp"
          style={{ animationDelay: '0.2s' }}
        >
          From serene beaches to majestic mountains, spiritual retreats to luxurious escapes—
          discover handpicked destinations that match your travel style and dreams.
        </p>

        {/* Feature Pills */}
        <div
          className="flex flex-wrap justify-center gap-4 animate-fadeInUp"
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
              className="px-4 py-2 neu-glass rounded-full hover:border-[#3B82F6]/30 transition-colors cursor-pointer hover:scale-105"
            >
              <span className="text-sm text-[#64748B]">{pill}</span>
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
        className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6 animate-fadeInUp"
      >
        Ready to Plan Your Next Adventure?
      </h2>

      <p className="text-[#64748B] text-lg mb-8 max-w-2xl mx-auto">
        Use our AI-powered planner to create personalized itineraries, manage
        budgets, and split expenses with your travel companions.
      </p>

      <div
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <button className="px-8 py-4 bg-[#EFEC07] text-[#0F172A] rounded-full font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#EFEC07]/40 hover:scale-105">
          Start Planning
        </button>
        <button className="px-8 py-4 neu-glass border border-slate-200 text-[#0F172A] rounded-full font-bold text-lg transition-all duration-300 hover:border-[#3B82F6]/50 hover:bg-white">
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [searchMessage, setSearchMessage] = useState('');
  const [searchSource, setSearchSource] = useState<'database' | 'ai' | null>(null);

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

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      setSearchMessage('Please enter at least 2 characters.');
      return;
    }

    setSearchLoading(true);
    setSearchMessage('');

    try {
      const response = await fetch(`/api/explore/search?q=${encodeURIComponent(trimmedQuery)}`);
      const data = (await response.json()) as SearchApiResponse;

      if (!response.ok || !data.success) {
        setSearchResults([]);
        setSearchSource(null);
        setSearchMessage(data.error || 'Search failed. Please try again.');
        return;
      }

      setSearchResults(data.data || []);
      setSearchSource(data.source || null);
      setSearchMessage(data.message || (data.data?.length ? 'Search complete.' : 'No places found.'));
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setSearchSource(null);
      setSearchMessage('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-bg text-[#0F172A]">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Hero */}
        <div className="py-8">
          <ExploreHero />
        </div>

        {/* Sticky Search Section */}
        <section className="sticky top-0 z-50 mb-10 -mx-4 md:-mx-6 lg:-mx-8 bg-brand-bg/90 backdrop-blur-md px-4 md:px-6 lg:px-8 py-6 shadow-sm">
          <div className="neu-glass rounded-2xl p-4 md:p-6">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search places by name or description"
                className="w-full rounded-full neu-input px-4 py-3 text-[#0F172A] placeholder-slate-400 focus:border-[#3B82F6] focus:outline-none"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0F172A] px-5 py-3 font-semibold text-white disabled:opacity-60 whitespace-nowrap hover:bg-[#1E293B] transition-colors"
              >
                {searchLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </form>

            {searchMessage && (
              <p className="mt-3 text-sm text-[#64748B]">
                {searchSource === 'ai' ? '🤖 ' : ''}
                {searchMessage}
              </p>
            )}

            {searchResults.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {searchResults.map((place) => (
                  <PlaceCard key={place.id} place={place} isAI={searchSource === 'ai'} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Categories */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block">
              <div className="w-12 h-12 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[#475569]">Loading amazing destinations...</p>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-3">
                No Places Found
              </h2>
              <p className="text-[#475569] mb-6">
                We're working on loading amazing destinations for you.
              </p>
              <Link href="/map">
                <button className="px-8 py-4 bg-[#EFEC07] text-[#0F172A] rounded-full font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#EFEC07]/40 hover:scale-105">
                  View on Map
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12">
            {categories.map((categoryData) => (
              <CategorySection
                key={categoryData.category}
                category={categoryData.category}
                places={categoryData.places}
                hasMore={categoryData.hasMore}
                onLoadMore={async (category, offset) => {
                  const response = await fetch(
                    `/api/explore/places?category=${encodeURIComponent(category)}&offset=${offset}`
                  );
                  if (!response.ok) {
                    console.error('API returned error:', response.status);
                    return { places: [], hasMore: false };
                  }

                  const payload = (await response.json()) as PlacesApiResponse;
                  if (!payload.success) {
                    return { places: [], hasMore: false };
                  }

                  return {
                    places: payload.data || [],
                    hasMore: payload.pagination?.hasMore ?? false,
                  };
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
