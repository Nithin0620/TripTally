import Link from 'next/link';
import { Suspense } from 'react';
import PlaceHero from '@/components/explore/PlaceHero';
import HotelCard from '@/components/explore/HotelCard';
import RestaurantCard from '@/components/explore/RestaurantCard';
import TravelInfoSection from '@/components/explore/TravelInfoSection';
import PlaceCard from '@/components/explore/PlaceCard';
import { Place } from '@/types';
import { getOrGeneratePlace, slugToPlaceName } from '@/services/explore.service';
import ContentSection from '@/components/explore/ContentSection';
import AttractionsSection from '@/components/explore/AttractionsSection';

interface PlaceDetailPageProps {
  params: {
    placename: string;
  };
}

/**
 * Loading Skeleton Component
 */
function PlaceLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#F6FBF8]">
      {/* Hero Skeleton */}
      <div className="h-96 bg-gray-800 animate-pulse" />
      
      {/* Content Skeleton */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="space-y-4">
              <div className="h-12 bg-gray-800 animate-pulse rounded-lg w-1/3" />
              <div className="h-32 bg-gray-800 animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Error Component
 */
function PlaceErrorState({ placeName }: { placeName: string }) {
  return (
    <main className="min-h-screen bg-[#F6FBF8] flex items-center justify-center">
      <div className="text-center px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-[#163427] mb-4">
          Unable to Load Destination
        </h2>
        <p className="text-[#5f7a6c] text-lg mb-8 max-w-2xl">
          We couldn't find or generate details for "{placeName}". Please try searching for another destination.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/explore">
            <button className="px-8 py-4 bg-[#EFEC07] text-[#163427] rounded-full font-bold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#EFEC07]/40 hover:scale-105">
              Back to Explore
            </button>
          </Link>
          <Link href="/map">
            <button className="px-8 py-4 bg-white/90 border border-[#cfe0d7] text-[#163427] rounded-full font-bold text-lg transition-all duration-300 hover:border-[#EFEC07]/50 hover:bg-white">
              View on Map
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}

/**
 * Related Destinations Grid Component
 * Fetches and displays places from the same category
 */
async function RelatedDestinationsGrid({
  placeName,
  category,
}: {
  placeName: string;
  category: string;
}) {
  try {
    const response = await fetch(
      `/api/explore/places?category=${encodeURIComponent(category)}&offset=0`,
      { cache: 'revalidate' }
    );

    if (!response.ok) {
      return (
        <div className="text-center py-12">
          <p className="text-[#4f6f5e]">Unable to load related destinations</p>
        </div>
      );
    }

    const places: Place[] = await response.json();
    
    // Filter out the current place and get up to 4
    const relatedPlaces = places.filter((p) => p.name !== placeName).slice(0, 4);

    if (relatedPlaces.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-[#4f6f5e]">No related destinations found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedPlaces.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error fetching related destinations:', error);
    return (
      <div className="text-center py-12">
        <p className="text-[#4f6f5e]">Failed to load related destinations</p>
      </div>
    );
  }
}

/**
 * Place Detail Page Content - Server Side
 */
async function PlaceDetailContent({ placename }: { placename: string }) {
  const result = await getOrGeneratePlace(placename);

  if (!result.success || !result.place) {
    return <PlaceErrorState placeName={slugToPlaceName(placename)} />;
  }

  const place = result.place;

  return (
    <main className="min-h-screen bg-[#F6FBF8] text-[#163427]">
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
        {/* Rich Description Section */}
        <section className="py-20 animate-fadeIn">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold text-[#163427] mb-8">Discover the Magic</h2>
            <p className="text-[#4f6f5e] text-lg leading-relaxed mb-6">{place.description}</p>
          </div>
        </section>

        {/* Content Sections with Images - Alternating Layout */}
        <div className="space-y-12">
          <ContentSection
            title="History & Heritage"
            content={`${place.name} is steeped in rich history and cultural significance. The region has been shaped by centuries of tradition, architectural marvels, and stories that span generations. From ancient temples to historic monuments, every corner tells a tale of the past that continues to inspire visitors from around the world.`}
            imageUrl={place.gallery_images[0] || place.hero_image}
            imagePosition="left"
            index={0}
          />

          <ContentSection
            title="Culture & Traditions"
            content={`The vibrant culture of ${place.name} is reflected in its festivals, arts, and everyday life. Local traditions passed down through generations create a unique atmosphere that blends ancient wisdom with contemporary energy. Experience authentic cultural performances, traditional cuisine, and the warm hospitality of the local people.`}
            imageUrl={place.gallery_images[1] || place.gallery_images[0] || place.hero_image}
            imagePosition="right"
            index={1}
          />

          <ContentSection
            title="Unique Experiences"
            content={`Beyond the typical tourist attractions, ${place.name} offers unique experiences that connect you deeply with the destination. From sunrise rituals at sacred sites to adventure activities in pristine nature, every moment is crafted to create lasting memories and genuine connections with the place and its people.`}
            imageUrl={place.gallery_images[2] || place.gallery_images[0] || place.hero_image}
            imagePosition="left"
            index={2}
          />
        </div>

        {/* Attractions Section */}
        <AttractionsSection
          attractions={place.gallery_images.slice(0, 5).map((img, idx) => ({
            name: `Attraction ${idx + 1}`,
            description: 'A must-visit destination',
            image_placeholder: img,
          }))}
          placeName={place.name}
        />

        {/* Hotels Section */}
        <section className="py-20">
          <div className="mb-12 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold text-[#163427] mb-3">🏨 Best Hotels to Stay</h2>
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
          <div className="mb-12 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold text-[#163427] mb-3">🍽️ Best Restaurants</h2>
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

        {/* More Destinations Section - Related Places */}
        <section className="py-20 md:py-24 border-t border-[#d8e7df]">
          <div className="mb-12 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold text-[#163427] mb-3">
              ✨ More Destinations to Explore
            </h2>
            <p className="text-[#4f6f5e] text-lg mb-6">
              Discover other amazing places in the {place.category} category
            </p>
            <div className="w-12 h-1 bg-gradient-to-r from-[#EFEC07] to-transparent rounded-full" />
          </div>

          {/* Destinations Grid - Same as Explore Page */}
          <RelatedDestinationsGrid placeName={place.name} category={place.category} />
        </section>

        {/* Final CTA Section */}
        <section className="py-20 md:py-32 text-center border-t border-[#d8e7df] animate-fadeIn">
          <h2 className="text-4xl md:text-5xl font-bold text-[#163427] mb-6">Plan Your Trip to {place.name}</h2>
          <p className="text-[#4f6f5e] text-lg mb-8 max-w-2xl mx-auto">
            Create a collaborative trip plan with friends, manage shared expenses, and make unforgettable memories together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <button className="px-8 py-4 bg-[#EFEC07] text-[#163427] rounded-full font-bold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#EFEC07]/40 hover:scale-105">
                Create Trip
              </button>
            </Link>
            <Link href="/explore">
              <button className="px-8 py-4 bg-white/90 border border-[#cfe0d7] text-[#163427] rounded-full font-bold text-lg transition-all duration-300 hover:border-[#EFEC07]/50 hover:bg-white">
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

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </main>
  );
}

/**
 * Main Page Component with Suspense
 */
export default function PlaceDetailPage({ params }: PlaceDetailPageProps) {
  return (
    <Suspense fallback={<PlaceLoadingSkeleton />}>
      <PlaceDetailContent placename={params.placename} />
    </Suspense>
  );
}
