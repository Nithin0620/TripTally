'use client';

import { motion } from 'framer-motion';
import { Hotel } from '@/types';
import { MapPin, DollarSign } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
  index?: number;
}

export default function HotelCard({ hotel, index = 0 }: HotelCardProps) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="mb-12"
    >
      <div
        className={`flex flex-col ${
          isEven ? 'md:flex-row' : 'md:flex-row-reverse'
        } gap-8 items-center`}
      >
        {/* Image */}
        <motion.div
          className="w-full md:w-1/2"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-80 object-cover rounded-3xl shadow-2xl"
            loading="lazy"
          />
        </motion.div>

        {/* Content */}
        <div className="w-full md:w-1/2">
          <motion.div
            initial={{ opacity: 0, x: isEven ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
            viewport={{ once: true }}
          >
            {/* Price Badge */}
            <div className="inline-flex items-center gap-2 bg-[#EFEC07]/10 border border-[#EFEC07]/30 rounded-full px-4 py-2 mb-4">
              <DollarSign size={16} className="text-[#EFEC07]" />
              <span className="text-[#EFEC07] font-semibold text-sm">
                {hotel.price_range}
              </span>
            </div>

            {/* Name */}
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {hotel.name}
            </h3>

            {/* Description */}
            <p className="text-gray-300 text-base leading-relaxed mb-6">
              {hotel.description}
            </p>

            {/* Highlights */}
            <ul className="space-y-3 mb-6">
              {[
                '✓ Premium Amenities',
                '✓ World-Class Service',
                '✓ Authentic Experiences',
              ].map((highlight, idx) => (
                <li
                  key={idx}
                  className="text-gray-200 text-sm flex items-center gap-2"
                >
                  <span className="text-[#EFEC07]">{highlight.split(' ')[0]}</span>
                  {highlight.substring(2)}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button className="group px-8 py-3 bg-[#EFEC07] text-[#02131B] rounded-full font-bold transition-all duration-300 hover:shadow-xl hover:shadow-[#EFEC07]/30 hover:scale-105 flex items-center gap-2">
              Learn More
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
