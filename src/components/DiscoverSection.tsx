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
          <span className="mb-4 inline-block rounded-full border border-brand-sand/50 bg-brand-sand/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-accent">
            Destinations
          </span>
          <h2 className="mb-4 font-serif text-4xl font-bold text-brand-text md:text-5xl tracking-tight">
            Discover Popular Destinations
          </h2>
          <p className="mx-auto max-w-xl text-lg text-brand-text/60">
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
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeFilter === filter
                  ? "bg-brand-accent text-white shadow-sm"
                  : "border border-brand-sand/60 bg-white/60 text-brand-text/70 hover:border-brand-accent/40 hover:text-brand-text backdrop-blur-sm"
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
              className="group overflow-hidden rounded-3xl bg-white border border-brand-sand/30 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="relative h-64 overflow-hidden">
                <motion.div
                  className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${destination.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <h3 className="font-serif text-2xl font-bold text-white drop-shadow-sm">
                    {destination.name}
                  </h3>
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-brand-accent backdrop-blur-sm border border-white/50">
                  {destination.price}
                </div>
              </div>
              <div className="p-5">
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
