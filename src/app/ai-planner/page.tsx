"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import NeuInput from "@/components/ui/NeuInput";
import Button from "@/components/ui/Button";
import NeuCard from "@/components/ui/NeuCard";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { Sparkles, MapPin, Calendar, DollarSign, Loader2, ArrowRight } from "lucide-react";

type Step = "destination" | "details" | "result";

interface PlanResult {
  destination: string;
  duration: string;
  budget: string;
  vibe: string;
}

export default function AIPlannerPage() {
  const [step, setStep] = useState<Step>("destination");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [vibe, setVibe] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<PlanResult | null>(null);

  const vibeOptions = [
    { value: "relaxation", label: "Relaxation & Wellness", emoji: "🧘" },
    { value: "adventure", label: "Adventure & Thrill", emoji: "🏔️" },
    { value: "cultural", label: "Cultural Immersion", emoji: "🏛️" },
    { value: "luxury", label: "Luxury & Comfort", emoji: "✨" },
    { value: "budget", label: "Budget-Friendly", emoji: "💰" },
    { value: "spiritual", label: "Spiritual Journey", emoji: "🙏" },
  ];

  const handleDestinationNext = () => {
    if (destination.trim().length >= 2) {
      setStep("details");
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);

    // Simulate AI generation (in real app, call /api/explore/generate)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setResult({
      destination: destination.trim(),
      duration: duration || "3-5 days",
      budget: budget || "₹15,000 - ₹30,000",
      vibe: vibe || "Exploration",
    });
    setStep("result");
    setGenerating(false);
  };

  const handleStartOver = () => {
    setStep("destination");
    setDestination("");
    setDuration("");
    setBudget("");
    setVibe("");
    setResult(null);
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

                    {/* Vibe Selection */}
                    <div>
                      <label className="mb-3 block text-sm font-medium text-[#475569]">
                        Travel Style
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {vibeOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setVibe(option.value)}
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

                  <div className="mt-6 flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setStep("destination")}
                      disabled={generating}
                    >
                      Back
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
                          Generating...
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
                    <p className="text-[#64748B]">
                      Here's your AI-crafted trip plan
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="neu-inset rounded-xl p-4 flex items-center gap-4">
                      <MapPin size={20} className="text-[#3B82F6]" />
                      <div>
                        <p className="text-xs text-[#64748B]">Destination</p>
                        <p className="font-semibold text-[#0F172A]">{result.destination}</p>
                      </div>
                    </div>
                    <div className="neu-inset rounded-xl p-4 flex items-center gap-4">
                      <Calendar size={20} className="text-[#3B82F6]" />
                      <div>
                        <p className="text-xs text-[#64748B]">Duration</p>
                        <p className="font-semibold text-[#0F172A]">{result.duration}</p>
                      </div>
                    </div>
                    <div className="neu-inset rounded-xl p-4 flex items-center gap-4">
                      <DollarSign size={20} className="text-[#3B82F6]" />
                      <div>
                        <p className="text-xs text-[#64748B]">Estimated Budget</p>
                        <p className="font-semibold text-[#0F172A]">{result.budget}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={handleStartOver} className="flex-1">
                      Start Over
                    </Button>
                    <Link href={`/explore/${result.destination.toLowerCase().replace(/\s+/g, "-")}`} className="flex-1">
                      <Button variant="primary" className="w-full">
                        Explore {result.destination}
                      </Button>
                    </Link>
                  </div>
                </NeuCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
