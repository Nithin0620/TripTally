"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import NeuInput from "@/components/ui/NeuInput";
import Button from "@/components/ui/Button";
import NeuCard from "@/components/ui/NeuCard";
import Toast from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { tripsApi } from "@/lib/api";
import { fadeInUp } from "@/lib/animations";
import { Sparkles, MapPin, Calendar, DollarSign, Loader2, ArrowRight, ChevronLeft, Clock, IndianRupee, Lightbulb, CheckCircle } from "lucide-react";

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
  { value: "relaxation", label: "Relaxation & Wellness", emoji: "🧘" },
  { value: "adventure", label: "Adventure & Thrill", emoji: "🏔️" },
  { value: "cultural", label: "Cultural Immersion", emoji: "🏛️" },
  { value: "luxury", label: "Luxury & Comfort", emoji: "✨" },
  { value: "budget", label: "Budget-Friendly", emoji: "💰" },
  { value: "spiritual", label: "Spiritual Journey", emoji: "🙏" },
];

export default function AIPlannerPage() {
  const [step, setStep] = useState<Step>("destination");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [vibe, setVibe] = useState("");
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
      const numDays = dayMatch ? parseInt(dayMatch[1]) : 5;
      endDate.setDate(today.getDate() + numDays);

      const budgetMatch = result.estimated_total_budget.match(/(\d[\d,]*)/);
      const budgetInCents = budgetMatch
        ? Math.round(parseFloat(budgetMatch[1].replace(/,/g, "")) * 100)
        : undefined;

      const response = await tripsApi.createTrip({
        title: `Trip to ${result.destination}`,
        description: result.overview,
        start_date: today.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        currency: "INR",
        budget_limit: budgetInCents,
      });

      if (response.error) {
        showToast(response.error, "error");
        return;
      }

      const tripId = response.data?.trip?.id;
      if (tripId) {
        showToast("Trip created! Redirecting...", "success");
        setTimeout(() => router.push(`/trips/${tripId}`), 1000);
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
    setDuration("");
    setBudget("");
    setVibe("");
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-brand-bg py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-[#EFEC07]/10 border border-[#EFEC07]/30 rounded-full px-4 py-2 mb-6">
            <Sparkles size={16} className="text-[#EFEC07]" />
            <span className="text-[#EFEC07] text-sm font-semibold">AI-POWERED</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] mb-4">
            AI Trip Planner
          </h1>
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
            Let our AI craft the perfect trip plan tailored to your preferences. Just tell us your vision.
          </p>
        </motion.div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {(["destination", "details", "result"] as Step[]).map((s, idx) => (
            <div key={s} className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === s
                    ? "bg-[#EFEC07] text-[#0F172A] shadow-lg shadow-[#EFEC07]/30"
                    : idx < ["destination", "details", "result"].indexOf(step)
                    ? "bg-[#3B82F6] text-white"
                    : "neu-inset text-slate-400"
                }`}
              >
                {idx < ["destination", "details", "result"].indexOf(step) ? "✓" : idx + 1}
              </div>
              {idx < 2 && (
                <div
                  className={`w-16 h-0.5 rounded-full transition-all duration-300 ${
                    idx < ["destination", "details", "result"].indexOf(step)
                      ? "bg-[#3B82F6]"
                      : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Destination */}
            {step === "destination" && (
              <motion.div
                key="destination"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <NeuCard className="!p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <MapPin size={24} className="text-[#3B82F6]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#0F172A]">Where to?</h2>
                      <p className="text-sm text-[#64748B]">Enter your dream destination</p>
                    </div>
                  </div>

                  <NeuInput
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g., Manali, Goa, Rajasthan..."
                    onKeyDown={(e) => e.key === "Enter" && handleDestinationNext()}
                  />

                  <div className="mt-6 flex justify-end">
                    <Button
                      variant="primary"
                      onClick={handleDestinationNext}
                      disabled={destination.trim().length < 2}
                    >
                      Continue <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </NeuCard>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {step === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <NeuCard className="!p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Calendar size={24} className="text-[#3B82F6]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#0F172A]">Trip Details</h2>
                      <p className="text-sm text-[#64748B]">Customize your {destination} trip</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <NeuInput
                      label="Duration"
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g., 5 days, 1 week"
                    />

                    <NeuInput
                      label="Budget"
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g., ₹20,000, ₹15,000-₹30,000"
                    />

                    <div>
                      <label className="mb-3 block text-sm font-medium text-[#475569]">
                        Travel Style
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {vibeOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setVibe(vibe === option.value ? "" : option.value)}
                            className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                              vibe === option.value
                                ? "neu-inset text-[#0F172A] border border-[#3B82F6]/30"
                                : "neu-glass text-[#64748B] hover:text-[#0F172A] border border-transparent"
                            }`}
                          >
                            <span className="text-lg block mb-1">{option.emoji}</span>
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setStep("destination")}
                      disabled={generating}
                    >
                      <ChevronLeft size={16} className="mr-1" /> Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleGenerate}
                      disabled={generating}
                      className="flex-1"
                    >
                      {generating ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Generating Plan...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} className="mr-2" />
                          Generate Plan
                        </>
                      )}
                    </Button>
                  </div>
                </NeuCard>
              </motion.div>
            )}

            {/* Step 3: Result */}
            {step === "result" && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, type: "spring" }}
              >
                <NeuCard className="!p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#EFEC07]/20 flex items-center justify-center"
                    >
                      <Sparkles size={32} className="text-[#EFEC07]" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
                      Your Trip to {result.destination}
                    </h2>
                    <p className="text-[#64748B]">{result.overview}</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="neu-inset rounded-xl p-3 text-center">
                      <Calendar size={18} className="mx-auto mb-1 text-[#3B82F6]" />
                      <p className="text-xs text-[#64748B]">Duration</p>
                      <p className="font-semibold text-[#0F172A] text-sm">{result.duration}</p>
                    </div>
                    <div className="neu-inset rounded-xl p-3 text-center">
                      <IndianRupee size={18} className="mx-auto mb-1 text-[#3B82F6]" />
                      <p className="text-xs text-[#64748B]">Budget</p>
                      <p className="font-semibold text-[#0F172A] text-sm">{result.budget}</p>
                    </div>
                    <div className="neu-inset rounded-xl p-3 text-center">
                      <MapPin size={18} className="mx-auto mb-1 text-[#3B82F6]" />
                      <p className="text-xs text-[#64748B]">Days</p>
                      <p className="font-semibold text-[#0F172A] text-sm">{result.days.length}</p>
                    </div>
                  </div>

                  {/* Day-by-Day Itinerary */}
                  <div className="space-y-6 mb-8">
                    <h3 className="text-lg font-bold text-[#0F172A]">Day-by-Day Itinerary</h3>
                    {result.days.map((day) => (
                      <div key={day.day} className="border border-white/40 rounded-2xl overflow-hidden">
                        <div className="bg-[#3B82F6]/5 px-4 py-3 border-b border-white/30">
                          <h4 className="font-bold text-[#0F172A]">
                            Day {day.day}: {day.title}
                          </h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {day.activities.map((activity, idx) => (
                            <div key={idx} className="flex gap-3">
                              <div className="flex-shrink-0 w-16 text-center">
                                <div className="inline-flex items-center gap-1 text-xs font-medium text-[#3B82F6] bg-blue-50 rounded-full px-2 py-1">
                                  <Clock size={10} />
                                  {activity.time}
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-[#0F172A] text-sm">{activity.title}</p>
                                <p className="text-xs text-[#64748B] mt-0.5">{activity.description}</p>
                                <div className="flex gap-3 mt-1">
                                  {activity.location && (
                                    <span className="text-xs text-[#94A3B8]">📍 {activity.location}</span>
                                  )}
                                  {activity.estimated_cost && (
                                    <span className="text-xs text-[#94A3B8]">💰 {activity.estimated_cost}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tips */}
                  {result.tips && result.tips.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                        <Lightbulb size={18} className="text-[#EFEC07]" />
                        Travel Tips
                      </h3>
                      <div className="space-y-2">
                        {result.tips.map((tip, idx) => (
                          <div key={idx} className="flex gap-2 text-sm text-[#475569]">
                            <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-[#3B82F6]" />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={handleStartOver} className="flex-1">
                      Start Over
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleCreateTrip}
                      disabled={creatingTrip}
                      className="flex-1"
                    >
                      {creatingTrip ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create This Trip"
                      )}
                    </Button>
                  </div>
                </NeuCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </main>
  );
}
