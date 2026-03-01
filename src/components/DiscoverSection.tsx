"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Button from "./ui/Button";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const destinations = [
  {
    name: "Bali, Indonesia",
    category: "beach",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
    price: "$1,200",
  },
  {
    name: "Tokyo, Japan",
    category: "city",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
    price: "$2,500",
  },
  {
    name: "Swiss Alps",
    category: "nature",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80",
    price: "$3,000",
  },
  {
    name: "Maldives",
    category: "luxury",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80",
    price: "$4,500",
  },
  {
    name: "Paris, France",
    category: "city",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
    price: "$2,200",
  },
  {
    name: "Iceland",
    category: "nature",
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&q=80",
    price: "$2,800",
  },
];

const filters = ["All", "Beach", "City", "Nature", "Luxury"];

export default function DiscoverSection() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredDestinations =
    activeFilter === "All"
      ? destinations
      : destinations.filter(
          (dest) => dest.category.toLowerCase() === activeFilter.toLowerCase()
        );

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h2 className="mb-4 text-4xl font-black text-white md:text-5xl">
            Discover Popular Destinations
          </h2>
          <p className="text-xl text-white/70">
            Handpicked packages curated by our AI travel experts.
          </p>
        </motion.div>

        {/* Filter Pills */}
        <motion.div
          className="mb-12 flex flex-wrap justify-center gap-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-6 py-2 font-medium transition ${
                activeFilter === filter
                  ? "bg-brand-accent text-brand-bg"
                  : "bg-brand-surface text-white backdrop-blur-md hover:border-brand-accent hover:shadow-[0_0_16px_rgba(239,236,7,0.2)]"
              }`}
            >
              {filter}
            </button>
          ))}
        </motion.div>

        {/* Destination Cards */}
        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          key={activeFilter}
        >
          {filteredDestinations.map((destination, index) => (
            <motion.div
              key={index}
              variants={staggerItem}
              className="glass-card group overflow-hidden rounded-3xl p-0"
            >
              <div className="relative h-64 overflow-hidden">
                <motion.div
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${destination.image})` }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-2xl font-bold text-white">
                    {destination.name}
                  </h3>
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-brand-accent px-4 py-2 text-sm font-bold text-brand-bg">
                  {destination.price}
                </div>
              </div>
              <div className="p-6">
                <Button variant="outline" className="w-full">
                  Explore
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
