import VisitorCounter from '@/components/VisitorCounter';
import CountdownTimer from '@/components/CountdownTimer';
import WaitlistSection from '@/components/WaitlistSection';
import HeroWithFade from '@/components/HeroWithFade';

export default function Home() {
  return (
    <HeroWithFade>
      <main className="min-h-screen bg-gradient-to-b from-[#02131B]/80 via-[#0A1F2E]/80 to-[#02131B]">
        {/* Navigation Bar */}
        <nav className="fixed top-0 w-full z-40 backdrop-blur-md bg-[#02131B]/95 border-b border-[#EFEC07]/20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold text-[#EFEC07]">TripTally</div>
            <div className="relative">
              <div className="absolute inset-0 bg-[#EFEC07]/30 rounded-full blur-md animate-pulse" />
              <div className="relative bg-[#EFEC07] hover:bg-[#EFEC07]/90 text-[#02131B] font-bold px-8 py-3 rounded-full border-2 border-[#EFEC07] shadow-lg hover:shadow-[0_0_30px_rgba(239,236,7,0.6)] transition-all duration-300 animate-pulse text-base">
                Coming Soon
              </div>
            </div>
          </div>
        </nav>

      {/* Visitor Counter Section - TOP */}
      <div className="pt-24 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#EFEC07]/60 text-sm uppercase tracking-widest font-semibold mb-4">👥 Community</p>
            <VisitorCounter />
          </div>
        </div>
      </div>

      {/* Countdown Timer Section */}
      <div className="py-8 px-6 border-y border-[#EFEC07]/10 bg-[#17394B]/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[#EFEC07]/60 text-sm uppercase tracking-widest font-semibold mb-6">⏱️ Launch Countdown</p>
            <CountdownTimer />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-[#EFEC07] mb-6 drop-shadow-lg">
            TripTally
          </h1>
          <p className="text-xl md:text-2xl text-[#FFFFFF] font-semibold mb-4">
            AI-Powered Travel Planning & Expense Management
          </p>
          <p className="text-base md:text-lg text-[#FFFFFF]/70 max-w-2xl mx-auto">
            Your intelligent companion for seamless group travel experiences
          </p>
        </div>

        {/* Main Description Card */}
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#17394B]/40 to-[#0A1F2E] rounded-3xl border border-[#EFEC07]/20 p-8 md:p-12 mb-12 backdrop-blur-sm hover:border-[#EFEC07]/40 transition-colors duration-300">
          <h2 className="text-3xl font-bold text-[#EFEC07] mb-6 text-center">
            About TripTally
          </h2>
          <p className="text-base md:text-lg text-[#FFFFFF]/90 leading-relaxed mb-8">
            TripTally is an <span className="font-semibold text-[#EFEC07]">AI-powered travel planning and expense management platform</span> designed 
            to simplify group trips from start to finish. The system enables users to create trips, collaborate with friends, plan detailed 
            itineraries, and track shared expenses effortlessly.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <FeatureCard
              icon="💰"
              title="Smart Expense Splitting"
              description="Automatic balance calculations with optimized settlement summaries for group expenses"
            />
            <FeatureCard
              icon="📸"
              title="OCR Bill Scanning"
              description="Scan physical bills to auto-extract details and generate clean digital invoices"
            />
            <FeatureCard
              icon="🤖"
              title="AI Itinerary Recommendations"
              description="Intelligent suggestions for activities, routes, and templates tailored to your preferences"
            />
            <FeatureCard
              icon="🗺️"
              title="Interactive Map Interface"
              description="Visualize day-wise itineraries with locations and route paths between activities"
            />
            <FeatureCard
              icon="👥"
              title="Collaborative Planning"
              description="Work together with friends to plan and organize every aspect of your trip"
            />
            <FeatureCard
              icon="📱"
              title="Cross-Platform"
              description="Access from web and mobile with seamless synchronization"
            />
          </div>

          <p className="text-base md:text-lg text-[#FFFFFF]/90 leading-relaxed">
            Built using the <span className="font-semibold text-[#EFEC07]">MERN stack</span> with optional React Native integration, 
            TripTally aims to deliver a <span className="font-semibold text-[#EFEC07]">seamless, intuitive, and smart travel collaboration experience</span>, 
            making group trips more organized, transparent, and enjoyable.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#17394B] via-[#1a4a5f] to-[#17394B] rounded-3xl shadow-2xl border border-[#EFEC07]/30 p-8 md:p-10 text-[#FFFFFF] mb-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center text-[#EFEC07]">Technology Stack</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <TechBadge name="Next.js 14" />
            <TechBadge name="TypeScript" />
            <TechBadge name="Supabase" />
            <TechBadge name="PostgreSQL" />
            <TechBadge name="Cloudinary" />
            <TechBadge name="OpenAI" />
            <TechBadge name="Tailwind CSS" />
            <TechBadge name="React Native" />
          </div>
        </div>

        {/* Waitlist CTA Section */}
        <div className="max-w-3xl mx-auto py-12 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#EFEC07] mb-6">Be Part of the Journey</h2>
          <p className="text-[#FFFFFF]/70 text-base md:text-lg mb-8">
            Join thousands of travelers preparing for smarter group trips
          </p>
          <WaitlistSection />
        </div>
      </div>

        {/* Footer */}
        <footer className="bg-[#02131B]/80 border-t border-[#EFEC07]/10 text-[#FFFFFF]/60 py-8 mt-12">
          <div className="container mx-auto px-6 text-center">
            <p>
              © {new Date().getFullYear()} TripTally. All rights reserved.
            </p>
            <p className="text-sm mt-2 text-[#EFEC07]/60">Coming Soon • Launching 2026</p>
          </div>
        </footer>
      </main>
    </HeroWithFade>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-[#17394B]/30 p-6 rounded-2xl border border-[#EFEC07]/20 hover:border-[#EFEC07]/40 hover:bg-[#17394B]/50 transition-all duration-300 backdrop-blur-sm">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-[#EFEC07] mb-2">{title}</h3>
      <p className="text-[#FFFFFF]/70 text-sm">{description}</p>
    </div>
  );
}

function TechBadge({ name }: { name: string }) {
  return (
    <div className="bg-[#02131B]/60 border border-[#EFEC07]/40 text-[#EFEC07] px-4 py-3 rounded-lg font-semibold text-sm hover:bg-[#02131B]/80 hover:border-[#EFEC07]/60 transition-all duration-300 min-h-12 flex items-center justify-center">
      {name}
    </div>
  );
}
