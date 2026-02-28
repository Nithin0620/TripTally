import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import PackageGeneratorSection from "@/components/PackageGeneratorSection";
import DiscoverSection from "@/components/DiscoverSection";
import TestimonialsSection from "@/components/TestimonialsSection";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeatureSection />
      <PackageGeneratorSection />
      <DiscoverSection />
      <TestimonialsSection />
    </main>
  );
}
