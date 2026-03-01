"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const trips = [
  {
    id: 1,
    name: "Tokyo Adventure",
    destination: "Tokyo, Japan",
    dates: "May 15-22, 2026",
    members: 4,
    budget: "$10,000",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
  },
  {
    id: 2,
    name: "Paris Getaway",
    destination: "Paris, France",
    dates: "June 10-17, 2026",
    members: 2,
    budget: "$6,000",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
  },
  {
    id: 3,
    name: "Bali Retreat",
    destination: "Bali, Indonesia",
    dates: "July 1-10, 2026",
    members: 6,
    budget: "$8,000",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-brand-surface/90 p-6 backdrop-blur-lg">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white">
            <span className="text-brand-accent">Trip</span>Tally
          </h2>
        </div>

        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="block rounded-xl bg-white/10 px-4 py-3 font-medium text-white transition hover:bg-white/20"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/dashboard/trips"
            className="block rounded-xl px-4 py-3 font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            ✈️ My Trips
          </Link>
          <Link
            href="/dashboard/expenses"
            className="block rounded-xl px-4 py-3 font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            💰 Expenses
          </Link>
          <Link
            href="/dashboard/templates"
            className="block rounded-xl px-4 py-3 font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            📋 Templates
          </Link>
          <Link
            href="/dashboard/settings"
            className="block rounded-xl px-4 py-3 font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            ⚙️ Settings
          </Link>
        </nav>

        <div className="mt-8 border-t border-white/10 pt-8">
          <Link
            href="/login"
            className="block rounded-xl px-4 py-3 font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            🚪 Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-black text-white">
              Welcome back, John!
            </h1>
            <p className="mt-2 text-white/70">
              You have {trips.length} active trips
            </p>
          </div>
          <Button variant="primary" href="/dashboard/trips/new">
            + Create Trip
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mb-8 grid gap-6 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItem}>
            <GlassCard className="p-6">
              <p className="mb-2 text-sm text-white/60">Total Trips</p>
              <p className="text-3xl font-bold text-white">{trips.length}</p>
            </GlassCard>
          </motion.div>
          <motion.div variants={staggerItem}>
            <GlassCard className="p-6">
              <p className="mb-2 text-sm text-white/60">Total Budget</p>
              <p className="text-3xl font-bold text-white">$24,000</p>
            </GlassCard>
          </motion.div>
          <motion.div variants={staggerItem}>
            <GlassCard className="p-6">
              <p className="mb-2 text-sm text-white/60">Total Members</p>
              <p className="text-3xl font-bold text-white">12</p>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Trips Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <h2 className="mb-6 text-2xl font-bold text-white">Your Trips</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip, index) => (
              <motion.div key={trip.id} variants={staggerItem}>
                <GlassCard className="group overflow-hidden p-0">
                  <div className="relative h-48 overflow-hidden">
                    <motion.div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${trip.image})` }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-bg to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-bold text-white">
                      {trip.name}
                    </h3>
                    <p className="mb-1 text-sm text-white/70">
                      📍 {trip.destination}
                    </p>
                    <p className="mb-1 text-sm text-white/70">
                      📅 {trip.dates}
                    </p>
                    <p className="mb-1 text-sm text-white/70">
                      👥 {trip.members} members
                    </p>
                    <p className="mb-4 text-sm text-white/70">
                      💰 {trip.budget}
                    </p>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
