"use client";

import { motion } from "framer-motion";
import NeuCard from "./ui/NeuCard";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Travel Blogger",
    image: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    text: "TripTally transformed how I plan group trips. The AI budget tracker saved us from endless spreadsheet drama!",
  },
  {
    name: "Michael Chen",
    role: "Software Engineer",
    image: "https://i.pravatar.cc/150?img=13",
    rating: 5,
    text: "The itinerary builder is incredible. It planned our Tokyo trip better than any travel agent could.",
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Manager",
    image: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    text: "Real-time chat assistant answered all our questions instantly. Felt like having a local guide in our pocket.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h2 className="mb-4 text-4xl font-black text-[#0F172A] md:text-5xl">
            Loved by Travelers Worldwide
          </h2>
          <p className="text-xl text-[#64748B]">
            Join thousands of happy adventurers using TripTally.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={staggerItem}>
              <NeuCard className="h-full !p-8">
                {/* Rating Stars */}
                <div className="mb-4 flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-brand-accent">
                      ★
                    </span>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="mb-6 text-[#64748B]">{testimonial.text}</p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full border-2 border-blue-200"
                  />
                  <div>
                    <h4 className="font-bold text-[#0F172A]">{testimonial.name}</h4>
                    <p className="text-sm text-[#475569]">{testimonial.role}</p>
                  </div>
                </div>
              </NeuCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
