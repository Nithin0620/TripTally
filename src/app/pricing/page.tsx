import PricingSection from "@/components/PricingSection";

export default function PricingPage() {
  return (
    <main className="min-h-screen pt-20">
      <div className="py-12 text-center">
        <h1 className="mb-4 text-5xl font-black text-white md:text-6xl">
          Choose Your Plan
        </h1>
        <p className="text-xl text-white/70">
          Start free, upgrade when you're ready.
        </p>
      </div>
      <PricingSection />
    </main>
  );
}
