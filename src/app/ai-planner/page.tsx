"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import NeuInput from "@/components/ui/NeuInput";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { tripsApi, activitiesApi } from "@/lib/api";
import {
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
  ArrowRight,
  ChevronLeft,
  Clock,
  Compass,
  Lightbulb,
  CheckCircle2,
  Share2,
  Layers,
  Check
} from "lucide-react";

type Step = "destination" | "details" | "result";

interface Activity {
  time: string;
  title: string;
  description: string;
  location?: string;
  estimated_cost?: string;
}

interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
}

interface PlanResult {
  destination: string;
  duration: string;
  budget: string;
  overview: string;
  days: DayPlan[];
  tips: string[];
  estimated_total_budget: string;
}

const vibeOptions = [
  { value: "adventure", label: "Alpine & Trekking", emoji: "🏔️" },
  { value: "relaxation", label: "Seaside & Wellness", emoji: "🏖️" },
  { value: "cultural", label: "Heritage & Culture", emoji: "🏛️" },
  { value: "culinary", label: "Culinary & Wine", emoji: "🍷" },
  { value: "luxury", label: "Boutique Luxury", emoji: "✨" },
  { value: "budget", label: "Backpacker Discovery", emoji: "🎒" },
];

const popularDestinations = [
  "Swiss Alps, Switzerland",
  "Kyoto, Japan",
  "Amalfi Coast, Italy",
  "Reykjavik, Iceland",
  "Banff, Canada",
  "Goa, India"
];

export default function AIPlannerPage() {
  const [step, setStep] = useState<Step>("destination");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("5 days");
  const [budget, setBudget] = useState("Moderate (~$1,500)");
  const [vibe, setVibe] = useState("adventure");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creatingTrip, setCreatingTrip] = useState(false);

  const { user } = useAuth();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  const handleDestinationNext = () => {
    if (destination.trim().length >= 2) {
      setStep("details");
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          destination: destination.trim(),
          duration: duration || undefined,
          budget: budget || undefined,
          vibe: vibe || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate plan");
      }

      setResult(data.plan);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateTrip = async () => {
    if (!user) {
      router.push("/login?redirect=/ai-planner");
      return;
    }

    if (!result) return;

    setCreatingTrip(true);
    try {
      const today = new Date();
      const endDate = new Date(today);
      const dayMatch = result.duration.match(/(\d+)/);
      const numDays = dayMatch ? parseInt(dayMatch[1]) : (result.days?.length || 5);
      endDate.setDate(today.getDate() + numDays);

      const budgetMatch = result.estimated_total_budget.match(/(\d[\d,]*)/);
      const budgetAmount = budgetMatch
        ? parseFloat(budgetMatch[1].replace(/,/g, ""))
        : 2000;

      const response = await tripsApi.createTrip({
        title: `Trip to ${result.destination}`,
        description: result.overview,
        start_date: today.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        currency: "USD",
        budget_limit: budgetAmount,
      });

      if (response.error) {
        showToast(response.error, "error");
        return;
      }

      const tripId = response.data?.trip?.id;
      if (tripId) {
        // Auto-save generated activities to the newly created trip in DB
        if (result.days && result.days.length > 0) {
          for (const day of result.days) {
            const dayDate = new Date(today);
            dayDate.setDate(today.getDate() + (day.day - 1));
            const dateStr = dayDate.toISOString().split("T")[0];

            for (const activity of day.activities) {
              await activitiesApi.createActivity({
                trip_id: tripId,
                title: activity.title,
                notes: activity.description,
                activity_date: dateStr,
                location: activity.location || result.destination,
              }).catch(() => null);
            }
          }
        }

        showToast("Trip & activities saved! Opening itinerary...", "success");
        setTimeout(() => router.push(`/trips/${tripId}`), 800);
      }
    } catch {
      showToast("Failed to create trip", "error");
    } finally {
      setCreatingTrip(false);
    }
  };

  const handleStartOver = () => {
    setStep("destination");
    setDestination("");
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-bold text-blue-700 mb-4">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>Autonomous AI Itinerary Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Bespoke Itinerary Studio
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          Tell us where you want to go. Our AI crafts optimized daily routes, estimated budgets, and local gems in seconds.
        </p>
      </div>

      {/* Modern Stepper Indicator */}
      <div className="flex items-center justify-center gap-3 mb-10">
        {[
          { key: "destination", num: 1, label: "Destination" },
          { key: "details", num: 2, label: "Preferences" },
          { key: "result", num: 3, label: "Itinerary" },
        ].map((s, idx) => {
          const stepOrder = ["destination", "details", "result"];
          const isCurrent = step === s.key;
          const isCompleted = stepOrder.indexOf(step) > idx;

          return (
            <div key={s.key} className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-slate-900 text-white shadow-sm"
                    : isCompleted
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black">
                  {isCompleted ? <Check className="h-3 w-3 text-emerald-700" /> : s.num}
                </span>
                <span>{s.label}</span>
              </div>
              {idx < 2 && <div className="h-0.5 w-6 bg-slate-200" />}
            </div>
          );
        })}
      </div>

      {/* Step Content Container */}
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {/* STEP 1: Destination Selection */}
          {step === "destination" && (
            <motion.div
              key="destination"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 sm:p-8 shadow-xl backdrop-blur-md"
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Where are you heading?</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Type any city, region, or country in the world.
                </p>
              </div>

              <div className="mb-6">
                <NeuInput
                  icon={<MapPin className="h-4 w-4" />}
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Dolomite Mountains, Tokyo, Banff National Park..."
                  onKeyDown={(e) => e.key === "Enter" && handleDestinationNext()}
                  className="py-3 text-base"
                  autoFocus
                />
              </div>

              {/* Popular Destination Chips */}
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Trending Destinations
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularDestinations.map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => setDestination(dest)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                        destination === dest
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                <Button
                  variant="primary"
                  onClick={handleDestinationNext}
                  disabled={destination.trim().length < 2}
                  className="px-6 gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Preferences & Style */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 sm:p-8 shadow-xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Customize Expedition</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Destination: <strong className="text-slate-800">{destination}</strong></p>
                </div>
                <button
                  onClick={() => setStep("destination")}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Change</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NeuInput
                    label="Trip Duration"
                    icon={<Calendar className="h-4 w-4" />}
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 5 days, 1 week"
                  />
                  <NeuInput
                    label="Estimated Budget"
                    icon={<DollarSign className="h-4 w-4" />}
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. $1,500 total, moderate"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Travel Vibe & Focus
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {vibeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setVibe(opt.value)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          vibe === opt.value
                            ? "border-blue-600 bg-blue-50/70 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <span className="text-lg block mb-1">{opt.emoji}</span>
                        <span className="text-xs font-bold text-slate-900 block">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs font-semibold text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setStep("destination")}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2"
                >
                  Back
                </button>
                <Button
                  variant="primary"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-6 gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Synthesizing Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      <span>Generate Full Itinerary</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Generated Itinerary Result */}
          {step === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Executive Summary Card */}
              <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-8 shadow-xl backdrop-blur-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1.5">
                      ✓ AI Plan Generated
                    </span>
                    <h2 className="text-2xl font-black text-slate-900">
                      Expedition to {result.destination}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={handleStartOver} className="text-xs py-2 px-3">
                      Start Over
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleCreateTrip}
                      disabled={creatingTrip}
                      className="text-xs py-2 px-4 gap-1.5"
                    >
                      {creatingTrip ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Saving Trip...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                          <span>Save to Dashboard</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mt-4 leading-relaxed font-medium">
                  {result.overview}
                </p>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Duration</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">{result.duration}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Est. Budget</span>
                    <span className="text-sm font-bold text-emerald-700 mt-0.5 block">{result.estimated_total_budget || result.budget}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Activities</span>
                    <span className="text-sm font-bold text-blue-700 mt-0.5 block">
                      {result.days.reduce((acc, d) => acc + d.activities.length, 0)} stops
                    </span>
                  </div>
                </div>
              </div>

              {/* Day by Day Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  <span>Daily Itinerary Schedule</span>
                </h3>

                {result.days.map((day) => (
                  <div key={day.day} className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold">
                          D{day.day}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{day.title}</h4>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {day.activities.length} activities
                      </span>
                    </div>

                    <div className="space-y-3">
                      {day.activities.map((activity, aIdx) => (
                        <div
                          key={aIdx}
                          className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/70 transition"
                        >
                          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded shrink-0 mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{activity.time}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                                {activity.title}
                              </h5>
                              {activity.estimated_cost && (
                                <span className="text-[11px] font-bold text-emerald-700 shrink-0">
                                  {activity.estimated_cost}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {activity.description}
                            </p>
                            {activity.location && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-1.5">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                <span>{activity.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Travel Tips Card */}
              {result.tips && result.tips.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-3">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    <span>Curated Insider Tips</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-950 font-medium">
                    {result.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sticky Bottom Action */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button variant="secondary" onClick={handleStartOver} className="text-xs py-2.5 px-4">
                  Discard & Replan
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateTrip}
                  disabled={creatingTrip}
                  className="text-xs py-2.5 px-6 gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save Trip & Launch Itinerary</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </main>
  );
}
