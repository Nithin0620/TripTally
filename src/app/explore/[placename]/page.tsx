'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import PlaceHero from '@/components/explore/PlaceHero';
import HotelCard from '@/components/explore/HotelCard';
import RestaurantCard from '@/components/explore/RestaurantCard';
import TravelInfoSection from '@/components/explore/TravelInfoSection';
import { getPlaceByName } from '@/lib/explore-db';
import { Place } from '@/types';

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
  image,
  imagePosition = 'left',
  index,
}: {
  title: string;
  content: string;
  image: string;
  imagePosition?: 'left' | 'right';
  index: number;
}) {
  const isLeft = imagePosition === 'left';

  return (
    <motion.section
      className="py-16 md:py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div
        className={`flex flex-col ${
          isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
        } gap-10 items-center`}
      >
        {/* Image */}
        <motion.div
          className="w-full md:w-1/2"
          initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
        >
          <img
            src={image}
            alt={title}
            className="w-full h-96 object-cover rounded-3xl shadow-2xl"
            loading="lazy"
          />
        </motion.div>

        {/* Text */}
        <motion.div
          className="w-full md:w-1/2"
          initial={{ opacity: 0, x: isLeft ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {title}
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            {content}
          </p>
          <div className="flex items-center gap-2 text-[#EFEC07] font-semibold">
            <span>Explore this section</span>
            <svg
              className="w-5 h-5 group-hover:translate-x-2 transition-transform"
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
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

/**
 * Attractions Grid Section
 */
function AttractionsGrid({
  attractions,
  images,
}: {
  attractions: string[];
  images: string[];
}) {
  return (
    <section className="py-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
          🏛️ Must-Visit Attractions
        </h2>
        <div className="w-12 h-1 bg-gradient-to-r from-[#EFEC07] to-transparent rounded-full" />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          visible: {
            transition: { staggerChildren: 0.1 },
          },
          hidden: {},
        }}
      >
        {attractions.map((attraction, idx) => (
          <motion.div
            key={idx}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -8 }}
            className="group"
          >
            <div className="relative rounded-2xl overflow-hidden h-64 mb-4">
              <img
                src={images[idx % images.length]}
                alt={attraction}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-[#EFEC07] transition-colors">
              {attraction}
            </h3>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/**
 * Async Place Detail Content
 */
async function PlaceDetailContent({ placename }: { placename: string }) {
  const place = await getPlaceByName(placename);

  if (!place) {
    notFound();
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
        <motion.section
          className="py-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Discover the Magic
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              {place.description}
            </p>
          </div>
        </motion.section>

        {/* Content Sections with Images */}
        {place.gallery_images && place.gallery_images.length > 0 && (
          <div className="space-y-12">
            <ContentSection
              title="History & Heritage"
              content={`${place.name} is steeped in rich history and cultural significance. The region has been shaped by centuries of tradition, architectural marvels, and stories that span generations. From ancient temples to historic monuments, every corner tells a tale of the past that continues to inspire visitors from around the world.`}
              image={place.gallery_images[0]}
              imagePosition="left"
              index={0}
            />

            <ContentSection
              title="Culture & Traditions"
              content={`The vibrant culture of ${place.name} is reflected in its festivals, arts, and everyday life. Local traditions passed down through generations create a unique atmosphere that blends ancient wisdom with contemporary energy. Experience authentic cultural performances, traditional cuisine, and the warm hospitality of the local people.`}
              image={place.gallery_images[1] || place.gallery_images[0]}
              imagePosition="right"
              index={1}
            />

            {place.gallery_images[2] && (
              <ContentSection
                title="Unique Experiences"
                content={`Beyond the typical tourist attractions, ${place.name} offers unique experiences that connect you deeply with the destination. From sunrise rituals at sacred sites to adventure activities in pristine nature, every moment is crafted to create lasting memories and genuine connections with the place and its people.`}
                image={place.gallery_images[2]}
                imagePosition="left"
                index={2}
              />
            )}
          </div>
        )}

        {/* Attractions Grid */}
        <AttractionsGrid
          attractions={['Rock Climbing', 'Paragliding', 'Trekking', 'Cultural Tours', 'Photography', 'Meditation']}
          images={place.gallery_images || [place.hero_image]}
        />

        {/* Hotels Section */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
              🏨 Best Hotels to Stay
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-[#EFEC07] to-transparent rounded-full" />
          </motion.div>

          <div className="space-y-12">
            {place.hotels.map((hotel, idx) => (
              <HotelCard key={idx} hotel={hotel} index={idx} />
            ))}
          </div>
        </section>

        {/* Restaurants Section */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
              🍽️ Best Restaurants
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-[#EFEC07] to-transparent rounded-full" />
          </motion.div>

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
        <motion.section
          className="py-20 md:py-32 text-center border-t border-white/10"
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
            Plan Your Trip to {place.name}
          </motion.h2>

          <motion.p
            className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Create a collaborative trip plan with friends, manage shared expenses, and
            make unforgettable memories together.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
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
          </motion.div>
        </motion.section>
      </div>
    </>
  );
}

/**
 * Main Page Component
 */
export default function PlaceDetailPage({ params }: PlaceDetailPageProps) {
  return (
    <main className="min-h-screen bg-[#02131B] text-white">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#EFEC07] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading destination details...</p>
            </div>
          </div>
        }
      >
        <PlaceDetailContent placename={params.placename} />
      </Suspense>
    </main>
  );
}
