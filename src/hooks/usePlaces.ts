import { useState, useCallback } from 'react';
import { Place, PlacesApiResponse } from '@/types';

/**
 * Hook for managing place fetching with pagination
 *
 * Usage:
 * const { places, loading, error, hasMore, loadMore } = usePlacesFetcher('Cities');
 */
export function usePlacesFetcher(category: string) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchPlaces = useCallback(
    async (initialFetch = true) => {
      setLoading(true);
      setError(null);

      try {
        const currentOffset = initialFetch ? 0 : offset;
        const response = await fetch(
          `/api/explore/places?category=${encodeURIComponent(category)}&offset=${currentOffset}&limit=4`
        );

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          throw new Error(errorData.error || 'Failed to fetch places');
        }

        const data = (await response.json()) as PlacesApiResponse;

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch places');
        }

        if (initialFetch) {
          setPlaces(data.data || []);
          setOffset(data.pagination?.limit || 4);
        } else {
          setPlaces((prev) => [...prev, ...data.data]);
          setOffset((prev) => prev + (data.pagination?.limit || 4));
        }

        setHasMore(data.pagination?.hasMore ?? false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        console.error(`[usePlacesFetcher] Error fetching ${category}:`, err);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [category, offset]
  );

  const loadMore = useCallback(async () => {
    await fetchPlaces(false);
  }, [fetchPlaces]);

  return {
    places,
    loading,
    error,
    hasMore,
    loadMore,
    fetchPlaces,
    offset,
  };
}

/**
 * Hook for managing search with database-first, AI-fallback
 *
 * Usage:
 * const { results, loading, error, search } = usePlacesSearch();
 */
export function usePlacesSearch() {
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'database' | 'ai' | null>(null);

  const search = useCallback(async (query: string, categoryHint?: string) => {
    if (!query.trim()) {
      setError('Search query is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const params = new URLSearchParams({ q: query });
      if (categoryHint) {
        params.append('category', categoryHint);
      }

      const response = await fetch(`/api/explore/search?${params.toString()}`);

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || 'Search failed');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.data || []);
      setSource(data.source);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('[usePlacesSearch] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
    setSource(null);
  }, []);

  return {
    results,
    loading,
    error,
    source,
    search,
    clear,
  };
}
