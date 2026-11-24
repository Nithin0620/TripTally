'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PlaceDetailPageProps {
  params: {
    placename: string;
  };
}

export default function PlaceDetailPage({ params }: PlaceDetailPageProps) {
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadPlace = async () => {
      try {
        const response = await fetch('/api/explore/famous-places', { cache: 'no-store' });
        if (!response.ok) {
          setError(true);
          return;
        }

        const data = await response.json();
        const places = data.places || [];

        const slug = decodeURIComponent(params.placename);
        const foundPlace = places.find((p: any) => {
          const placeSlug = p.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
          return placeSlug === slug;
        });

        if (foundPlace) {
          setPlace(foundPlace);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error loading place:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadPlace();
  }, [params.placename]);

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-bg px-4 pb-5 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="w-16 h-16 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#475569]">Loading place details...</p>
        </div>
      </main>
    );
  }

  if (error || !place) {
    return (
      <main className="min-h-screen bg-brand-bg px-4 pb-5 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-3">Place Not Found</h2>
          <p className="text-[#475569] mb-6">The destination you're looking for doesn't exist.</p>
          <Link href="/map">
            <button className="px-8 py-4 bg-[#EFEC07] text-[#0F172A] rounded-full font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#EFEC07]/40 hover:scale-105">
              Back to Map
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-bg px-4 pb-10 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Link href="/map" className="text-[#475569] hover:text-[#0F172A] transition-colors">
            ← Back to Map
          </Link>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-4">{place.name}</h1>
          <p className="text-xl text-[#64748B] mb-6">{place.description}</p>

          {/* Coordinates Card */}
          <div className="neu-glass rounded-2xl p-6 shadow-sm mb-8">
            <h3 className="text-sm font-semibold text-[#475569] mb-3">Location Coordinates</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#475569]">Latitude</p>
                <p className="text-lg font-semibold text-[#0F172A]">{place.coordinates[1].toFixed(4)}°N</p>
              </div>
              <div>
                <p className="text-xs text-[#475569]">Longitude</p>
                <p className="text-lg font-semibold text-[#0F172A]">{place.coordinates[0].toFixed(4)}°E</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {/* Description Card */}
          <div className="neu-glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-4">About</h2>
            <p className="text-[#64748B] leading-relaxed">{place.description}</p>
          </div>

          {/* Quick Stats */}
          <div className="neu-glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Quick Info</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-[#475569]">Destination</p>
                <p className="text-lg text-[#0F172A] font-semibold">{place.name}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#475569]">Type</p>
                <p className="text-lg text-[#0F172A]">Tourist Destination</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#475569]">Region</p>
                <p className="text-lg text-[#0F172A]">India</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="neu-glass rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-[#0F172A] mb-4">View on Map</h2>
          <div className="bg-slate-100 rounded-xl h-96 flex items-center justify-center">
            <p className="text-[#475569]">
              <a 
                href={`/map`}
                className="text-[#3B82F6] hover:underline font-semibold"
              >
                Open Full Map
              </a>
              {' '}to explore this location
            </p>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-[#0F172A] mb-6">Explore More Destinations</h2>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/map">
              <button className="px-8 py-4 bg-[#EFEC07] text-[#0F172A] rounded-full font-bold hover:shadow-lg hover:shadow-[#EFEC07]/40 hover:scale-105 transition-all duration-300">
                Back to Map
              </button>
            </Link>
            <Link href="/explore">
              <button className="px-8 py-4 neu-glass text-[#0F172A] border border-slate-200 rounded-full font-bold hover:bg-white hover:shadow-lg transition-all duration-300">
                Explore More
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
