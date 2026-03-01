'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import PlaceHero from '@/components/explore/PlaceHero';
import HotelCard from '@/components/explore/HotelCard';
import RestaurantCard from '@/components/explore/RestaurantCard';
import TravelInfoSection from '@/components/explore/TravelInfoSection';
import { Place } from '@/types';
import { useUnsplashImage } from '@/hooks/useUnsplashImage';

interface PlaceDetailPageProps {
  params: {
    placename: string;
  };
}

/**
 * Content Section with Alternating Image/Text Layout
 */
function ContentSection({
  title,
  content,
  imageQuery,
  placeName,
  imagePosition = 'left',
  index,
}: {
  title: string;
  content: string;
  imageQuery: string;
  placeName: string;
  imagePosition?: 'left' | 'right';
  index: number;
}) {
  const isLeft = imagePosition === 'left';
  const { image, loading } = useUnsplashImage(`${placeName} ${imageQuery}`);

  return (
    <section
      className="py-16 md:py-24 animate-fadeIn"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div
        className={`flex flex-col ${
          isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
        } gap-10 items-center`}
      >
        {/* Image */}
        <div
          className="w-full md:w-1/2 animate-slideInLeft"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {loading ? (
            <div className="w-full h-96 bg-gray-800 animate-pulse rounded-3xl" />
          ) : (
            <img
              src={image?.url || '/placeholder-destination.jpg'}
              alt={title}
              className="w-full h-96 object-cover rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          )}
        </div>

        {/* Text */}
        <div
          className="w-full md:w-1/2 animate-slideInRight"
          style={{ animationDelay: `${(index + 1) * 0.1}s` }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {title}
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            {content}
          </p>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(`${placeName} ${title}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#EFEC07] font-semibold hover:gap-3 transition-all cursor-pointer"
          >
            <span>Explore this section</span>
            <svg
              className="w-5 h-5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * Attractions Grid Section
 */
function AttractionsGrid({
  attractions,
  placeName,
}: {
  attractions: string[];
  placeName: string;
}) {
  return (
    <section className="py-20">
      <div
        className="mb-12 animate-fadeIn"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
          🏛️ Must-Visit Attractions
        </h2>
        <div className="w-12 h-1 bg-gradient-to-r from-[#EFEC07] to-transparent rounded-full" />
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {attractions.map((attraction, idx) => (
          <AttractionCard
            key={idx}
            attraction={attraction}
            placeName={placeName}
            index={idx}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Individual Attraction Card with Unsplash Image
 */
function AttractionCard({
  attraction,
  placeName,
  index,
}: {
  attraction: string;
  placeName: string;
  index: number;
}) {
  const { image, loading } = useUnsplashImage(`${placeName} ${attraction}`);

  return (
    <div
      className="group animate-fadeInUp hover:-translate-y-2 transition-transform duration-300"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative rounded-2xl overflow-hidden h-64 mb-4">
        {loading ? (
          <div className="w-full h-full bg-gray-800 animate-pulse" />
        ) : (
          <>
            <img
              src={image?.url || '/placeholder-attraction.jpg'}
              alt={attraction}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        )}
      </div>
      <h3 className="text-xl font-bold text-white group-hover:text-[#EFEC07] transition-colors">
        {attraction}
      </h3>
    </div>
  );
}

/**
 * Place Detail Content
 */
function PlaceDetailContent({ placename }: { placename: string }) {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadPlace = async () => {
      try {
        const response = await fetch(`/api/explore/place/${placename}`);
        if (!response.ok) {
          setError(true);
          return;
        }
        const data = await response.json();
        setPlace(data);
      } catch (err) {
        console.error('Error loading place:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadPlace();
  }, [placename]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#EFEC07] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading destination details...</p>
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Place Not Found
          </h2>
          <p className="text-gray-400 mb-6">
            The destination you're looking for doesn't exist.
          </p>
          <Link href="/explore">
            <button className="px-8 py-4 bg-[#EFEC07] text-[#02131B] rounded-full font-bold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#EFEC07]/40 hover:scale-105">
              Back to Explore
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <PlaceHero
        name={place.name}
        state={place.state}
        category={place.category}
        heroImage={place.hero_image}
        description={place.description}
      />

      {/* Main Content Container */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Rich Description with Alternating Sections */}
        <section
          className="py-20 animate-fadeIn"
        >
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Discover the Magic
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              {place.description}
            </p>
          </div>
        </section>

        {/* Content Sections with Images */}
        <div className="space-y-12">
          <ContentSection
            title="History & Heritage"
            content={`${place.name} is steeped in rich history and cultural significance. The region has been shaped by centuries of tradition, architectural marvels, and stories that span generations. From ancient temples to historic monuments, every corner tells a tale of the past that continues to inspire visitors from around the world.`}
            imageQuery="historic monument heritage"
            placeName={place.name}
            imagePosition="left"
            index={0}
          />

          <ContentSection
            title="Culture & Traditions"
            content={`The vibrant culture of ${place.name} is reflected in its festivals, arts, and everyday life. Local traditions passed down through generations create a unique atmosphere that blends ancient wisdom with contemporary energy. Experience authentic cultural performances, traditional cuisine, and the warm hospitality of the local people.`}
            imageQuery="culture festival traditions"
            placeName={place.name}
            imagePosition="right"
            index={1}
          />

          <ContentSection
            title="Unique Experiences"
            content={`Beyond the typical tourist attractions, ${place.name} offers unique experiences that connect you deeply with the destination. From sunrise rituals at sacred sites to adventure activities in pristine nature, every moment is crafted to create lasting memories and genuine connections with the place and its people.`}
            imageQuery="travel experience adventure"
            placeName={place.name}
            imagePosition="left"
            index={2}
          />
        </div>

        {/* Attractions Grid */}
        <AttractionsGrid
          attractions={['Rock Climbing', 'Paragliding', 'Trekking', 'Cultural Tours', 'Photography', 'Meditation']}
          placeName={place.name}
        />

        {/* Hotels Section */}
        <section className="py-20">
          <div
            className="mb-12 animate-fadeIn"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
              🏨 Best Hotels to Stay
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-[#EFEC07] to-transparent rounded-full" />
          </div>

          <div className="space-y-12">
            {place.hotels.map((hotel, idx) => (
              <HotelCard key={idx} hotel={hotel} index={idx} />
            ))}
          </div>
        </section>

        {/* Restaurants Section */}
        <section className="py-20">
          <div
            className="mb-12 animate-fadeIn"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
              🍽️ Best Restaurants
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-[#EFEC07] to-transparent rounded-full" />
          </div>

          <div className="space-y-12">
            {place.restaurants.map((restaurant, idx) => (
              <RestaurantCard key={idx} restaurant={restaurant} index={idx} />
            ))}
          </div>
        </section>

        {/* Travel Info Section */}
        <TravelInfoSection
          budget={place.avg_budget}
          duration={place.travel_duration}
          bestTime={place.best_time_to_visit}
        />

        {/* Final CTA Section */}
        <section
          className="py-20 md:py-32 text-center border-t border-white/10 animate-fadeIn"
        >
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Plan Your Trip to {place.name}
          </h2>

          <p
            className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto"
          >
            Create a collaborative trip plan with friends, manage shared expenses, and
            make unforgettable memories together.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/dashboard">
              <button className="px-8 py-4 bg-[#EFEC07] text-[#02131B] rounded-full font-bold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#EFEC07]/40 hover:scale-105">
                Create Trip
              </button>
            </Link>
            <Link href="/explore">
              <button className="px-8 py-4 bg-white/10 border border-white/30 text-white rounded-full font-bold text-lg transition-all duration-300 hover:border-[#EFEC07]/50 hover:bg-white/20">
                Explore More
              </button>
            </Link>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

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

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </>
  );
}

/**
 * Main Page Component
 */
export default function PlaceDetailPage({ params }: PlaceDetailPageProps) {
  return (
    <main className="min-h-screen bg-[#02131B] text-white">
      <PlaceDetailContent placename={params.placename} />
    </main>
  );
}
