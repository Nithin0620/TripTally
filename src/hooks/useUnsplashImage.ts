'use client';

import { useState, useEffect } from 'react';

interface UnsplashImage {
  url: string;
  thumb: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
}

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

export function useUnsplashImage(placeName: string, fallbackImage?: string) {
  const [image, setImage] = useState<UnsplashImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!UNSPLASH_ACCESS_KEY) {
      setImage({
        url: fallbackImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        thumb: fallbackImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
        alt: placeName,
        photographer: 'Unknown',
        photographerUrl: '#',
      });
      setLoading(false);
      return;
    }

    const fetchImage = async () => {
      try {
        const query = `${placeName} India travel landscape`;
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&content_filter=high`,
          {
            headers: {
              Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch image');
        }

        const data = await response.json();
        const photo = data.results[0];

        if (photo) {
          setImage({
            url: photo.urls.regular,
            thumb: photo.urls.small,
            alt: photo.alt_description || `${placeName} travel image`,
            photographer: photo.user.name,
            photographerUrl: photo.user.links.html,
          });
        } else {
          // Use fallback if no image found
          setImage({
            url: fallbackImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
            thumb: fallbackImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
            alt: placeName,
            photographer: 'Unknown',
            photographerUrl: '#',
          });
        }
      } catch (err) {
        console.error('Error fetching Unsplash image:', err);
        setError(true);
        // Use fallback on error
        setImage({
          url: fallbackImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
          thumb: fallbackImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
          alt: placeName,
          photographer: 'Unknown',
          photographerUrl: '#',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [placeName, fallbackImage]);

  return { image, loading, error };
}
