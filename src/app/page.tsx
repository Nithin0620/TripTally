"use client";

import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import PackageGeneratorSection from "@/components/PackageGeneratorSection";
import DiscoverSection from "@/components/DiscoverSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FlowFieldBackground from "@/components/FlowFieldBackground";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Animated Canvas 2D Flowfield Background */}
      <FlowFieldBackground />

      {/* Foreground Content Stack */}
      <div className="relative z-10">
        <HeroSection />
        <FeatureSection />
        <PackageGeneratorSection />
        <DiscoverSection />
        <TestimonialsSection />
      </div>
    </main>
  );
}
