import CTASection from "@/components/landing/CTASection";
import FAQSection from "@/components/landing/FAQSection";
import FeatureSection from "@/components/landing/FeatureSection";
import HeroSection from "@/components/landing/HeroSection";
import ProcessSection from "@/components/landing/ProcessSection";
import WaveDivider from "@/components/landing/WaveDivider";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-white">
      <HeroSection />
      <WaveDivider colorClass="text-[#FFF2E6]" />

      <section className="bg-[#FFF2E6] px-4 pb-8 pt-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 rounded-3xl bg-white/80 p-4 backdrop-blur-sm sm:gap-4 sm:p-5">
          <Button href="/dashboard" className="text-xs sm:text-sm">
            Start Planning
          </Button>
          <Button href="/templates" variant="secondary" className="text-xs sm:text-sm">
            View Templates
          </Button>
          <Button href="/auth/login" variant="secondary" className="text-xs sm:text-sm">
            Sign In
          </Button>
          <Button href="/auth/register" variant="secondary" className="text-xs sm:text-sm">
            Create Account
          </Button>
        </div>
      </section>

      <FeatureSection />
      <WaveDivider colorClass="text-white" />
      <ProcessSection />
      <WaveDivider colorClass="text-[#FFF2E6]" />
      <FAQSection />
      <WaveDivider colorClass="text-[#6A446C]" />
      <CTASection />
    </main>
  );
}
