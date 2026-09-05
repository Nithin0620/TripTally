'use client';

import Link from 'next/link';
import CategorySection from '@/components/explore/CategorySection';
import PlaceCard from '@/components/explore/PlaceCard';
import { ExploreCategory, Place, PlacesApiResponse, SearchApiResponse } from '@/types';
import { useEffect, useState } from 'react';
import { Search, Loader2, Sparkles, Compass, MapPin, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';

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
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Editorial Hero Header */}
      <div className="pb-10 border-b border-slate-200/80 mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-bold text-blue-700 mb-3">
              <Compass className="h-3.5 w-3.5 text-blue-600" />
              <span>Curated Destination Atlas</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Explore Extraordinary Places
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              From alpine mountain passes to secluded coastal retreats. Discover handpicked destinations with AI-generated travel guides.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" href="/map" className="text-xs py-2.5 px-4 gap-1.5 border-slate-200">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>Explore Map</span>
            </Button>
            <Button variant="primary" href="/ai-planner" className="text-xs py-2.5 px-4 gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Plan Trip with AI</span>
            </Button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="mt-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any destination worldwide (e.g., Zermatt, Kyoto, Amalfi)..."
                className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-xs font-bold text-white hover:bg-blue-600 disabled:opacity-60 transition shadow-sm shrink-0"
            >
              {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span>{searchLoading ? 'Searching...' : 'Search Atlas'}</span>
            </button>
          </form>

          {searchMessage && (
            <p className="mt-3 text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              {searchSource === 'ai' && <span className="text-amber-600 font-bold">⚡ AI Generated Result:</span>}
              <span>{searchMessage}</span>
            </p>
          )}

          {/* Search Results Display */}
          {searchResults.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Search Results ({searchResults.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {searchResults.map((place) => (
                  <PlaceCard key={place.id} place={place} isAI={searchSource === 'ai'} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Destination Categories Stream */}
      {loading ? (
        <div className="space-y-12">
          {[1, 2].map((n) => (
            <div key={n} className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((c) => (
                  <Skeleton key={c} className="h-64 rounded-2xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border border-dashed border-slate-200 bg-white/60 p-12">
          <Compass className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Destinations Loading</h2>
          <p className="text-xs text-slate-500 mb-6">Explore our interactive globe or search destinations directly.</p>
          <Button variant="primary" href="/map" className="text-xs py-2 px-5">
            Open Map Explorer
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
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

      {/* Bottom Editorial Callout */}
      <div className="mt-20 rounded-3xl border border-slate-200/90 bg-white/90 p-8 sm:p-12 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
            Personalized Travel Generation
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Ready to turn inspiration into an itinerary?
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Our AI planner takes your chosen destination, budget, and travel dates to generate an optimized route with real-time expense calculations.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <Button variant="primary" href="/ai-planner" className="text-xs py-3 px-6 gap-2">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>Generate Itinerary</span>
          </Button>
          <Button variant="secondary" href="/dashboard" className="text-xs py-3 px-6">
            Go to My Trips
          </Button>
        </div>
      </div>

    </main>
  );
}
