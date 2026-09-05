"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { CreditCard, Route, Sparkles, Receipt, MapPin, Zap, CheckCircle2 } from "lucide-react";

export default function FeatureSection() {
  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 z-10">
      <div className="mx-auto max-w-7xl">
        
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <span className="mb-3 inline-block rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            Intelligent Travel OS
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Everything your group needs in one place
          </h2>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 font-medium">
            Stop juggling 5 different apps, endless WhatsApp threads, and messy spreadsheets.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Bento 1: AI Itinerary (Large 2 Cols) */}
          <motion.div
            variants={staggerItem}
            className="md:col-span-2 clean-card p-8 bg-white/90 backdrop-blur-md border border-slate-200/80 relative overflow-hidden group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 mb-3">
                  <Route className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Autonomous AI Itineraries</h3>
                <p className="text-slate-600 text-sm mt-1">
                  Generates day-by-day activities, estimated durations, and travel tips tailored to your group's budget.
                </p>
              </div>
              <span className="self-start sm:self-auto px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
                ⚡ Powered by Groq 70B
              </span>
            </div>

            {/* Mock Timeline UI */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <span className="font-bold text-slate-800">Day 1: 09:00 AM — Mountain Valley Ascent</span>
                </div>
                <span className="text-slate-500 font-sans font-medium">2.5 hrs • $45 / person</span>
              </div>
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="font-bold text-slate-800">Day 1: 01:30 PM — Alpine Lodge Lunch & Rest</span>
                </div>
                <span className="text-slate-500 font-sans font-medium">1.5 hrs • $28 / person</span>
              </div>
            </div>
          </motion.div>

          {/* Bento 2: Smart Debt Simplifier */}
          <motion.div
            variants={staggerItem}
            className="clean-card p-8 bg-white/90 backdrop-blur-md border border-slate-200/80 relative overflow-hidden"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-3">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Debt Settlement</h3>
            <p className="text-slate-600 text-sm mb-6">
              Minimizes transactions across friends so settling a $5,000 trip takes only 2 direct payments instead of 10.
            </p>
            
            <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-4">
              <div className="text-xs font-bold text-emerald-900 mb-1">Optimized Settlement Result</div>
              <div className="text-sm font-bold text-emerald-700 flex items-center justify-between">
                <span>Alex owes Rahul</span>
                <span className="text-base font-extrabold">$142.50</span>
              </div>
            </div>
          </motion.div>

          {/* Bento 3: Interactive Maps */}
          <motion.div
            variants={staggerItem}
            className="clean-card p-8 bg-white/90 backdrop-blur-md border border-slate-200/80 relative overflow-hidden"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-3">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Mapbox Live Route</h3>
            <p className="text-slate-600 text-sm">
              Plot all activities directly on interactive high-res maps with waypoints and estimated travel legs.
            </p>
          </motion.div>

          {/* Bento 4: Receipt Scanning (2 Cols) */}
          <motion.div
            variants={staggerItem}
            className="md:col-span-2 clean-card p-8 bg-white/90 backdrop-blur-md border border-slate-200/80 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div className="max-w-md">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 mb-3">
                <Receipt className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Receipts & Multi-Currency</h3>
              <p className="text-slate-600 text-sm">
                Attach bills, invoices, and photos to every split expense. Supports live currency conversions for international trips.
              </p>
            </div>
            
            <div className="w-full sm:w-auto bg-slate-900 text-white rounded-2xl p-4 shadow-xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Receipt Verified</span>
              </div>
              <div className="text-slate-300">Dinner @ Matterhorn Grill</div>
              <div className="text-amber-300 font-mono font-bold text-sm">CHF 240.00 → $268.50 USD</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
