'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Place, SearchApiResponse } from '@/types';
import PlaceCard from './PlaceCard';

interface SearchPlacesProps {
  onSearchResults?: (places: Place[]) => void;
}

export default function SearchPlaces({ onSearchResults }: SearchPlacesProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Place[]>([]);
  const [source, setSource] = useState<'database' | 'ai' | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError('Please enter a search query');
      return;
    }

    if (trimmedQuery.length < 2) {
      setError('Search query must be at least 2 characters');
      return;
    }

    setIsSearching(true);
    setError('');
    setMessage('');
    setResults([]);

    try {
      const response = await fetch(`/api/explore/search?q=${encodeURIComponent(trimmedQuery)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || 'Search failed');
      }

      const data = (await response.json()) as SearchApiResponse;

      if (!data.success) {
        setError(data.error || 'Search failed');
        setResults([]);
      } else {
        setResults(data.data || []);
        setSource(data.source || null);
        setMessage(data.message || '');
        setHasSearched(true);

        if (onSearchResults) {
          onSearchResults(data.data || []);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('[SearchPlaces] Error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setError('');
    setMessage('');
    setHasSearched(false);
    setSource(null);
  };

  return (
    <section className="py-1 md:py-2 bg-gradient-to-br from-white via-blue-50/30 to-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-2">
            🔍 Discover Your Next Adventure
          </h2>
          <p className="text-[#475569]">
            Search for any place in India. If not found, we'll generate detailed information for you.
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <Search size={20} className="text-slate-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search attractions, cities, places..."
              disabled={isSearching}
              className="w-full pl-12 pr-4 py-3 md:py-4 neu-input rounded-full focus:outline-none focus:border-[#3B82F6] transition-colors duration-300 text-[#0F172A] placeholder-slate-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#0F172A] hover:bg-[#1E293B] text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span className="hidden sm:inline">Searching...</span>
                </>
              ) : (
                <span className="hidden sm:inline">Search</span>
              )}
            </button>
          </div>
        </motion.form>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {message && !error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <p className="text-blue-700 font-medium flex items-center gap-2">
                {source === 'ai' ? '🤖' : '💾'} {message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Results */}
        <AnimatePresence>
          {hasSearched && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#0F172A]">
                  {results.length} Result{results.length !== 1 ? 's' : ''} Found
                </h3>
                <button
                  onClick={handleClear}
                  className="text-sm text-slate-400 hover:text-[#0F172A] font-medium transition-colors"
                >
                  Clear Search ✕
                </button>
              </div>

              {/* Results Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                  hidden: {},
                }}
              >
                {results.map((place, idx) => (
                  <motion.div
                    key={place.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="relative">
                      {source === 'ai' && idx === 0 && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                          ✨ AI Generated
                        </div>
                      )}
                      <PlaceCard place={place} isAI={source === 'ai'} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results */}
        <AnimatePresence>
          {hasSearched && results.length === 0 && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="text-center py-12"
            >
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-2xl font-bold text-[#0F172A] mb-2">No Places Found</h3>
              <p className="text-[#475569] mb-6">
                No places are available for your search. Try a different query.
              </p>
              <button
                onClick={handleClear}
                className="px-6 py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-full font-semibold transition-colors"
              >
                Start Over
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Initial State */}
        {!hasSearched && results.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-12 text-slate-400"
          >
            <div className="text-4xl mb-3">📍</div>
            <p>Enter a location name to search for travel destinations</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
