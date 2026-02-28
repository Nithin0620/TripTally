import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import PackageGeneratorSection from "@/components/PackageGeneratorSection";
import DiscoverSection from "@/components/DiscoverSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeatureSection />
      <PackageGeneratorSection />
      <DiscoverSection />
      <TestimonialsSection />
      <PricingSection />
    </main>
  );
}
