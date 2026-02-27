export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Coming Soon Badge */}
      <div className="fixed top-8 right-8 z-50">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-lg animate-pulse">
          Coming Soon
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-fade-in">
            TripTally
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 font-semibold mb-4">
            AI-Powered Travel Planning & Expense Management
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your intelligent companion for seamless group travel experiences
          </p>
        </div>

        {/* Main Description */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            About TripTally
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            TripTally is an <span className="font-semibold text-blue-600">AI-powered travel planning and expense management platform</span> designed 
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

          <p className="text-lg text-gray-700 leading-relaxed">
            Built using the <span className="font-semibold text-purple-600">MERN stack</span> with optional React Native integration, 
            TripTally aims to deliver a <span className="font-semibold">seamless, intuitive, and smart travel collaboration experience</span>, 
            making group trips more organized, transparent, and enjoyable.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-xl p-8 md:p-10 text-white mb-12">
          <h3 className="text-2xl font-bold mb-6 text-center">Technology Stack</h3>
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

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-gray-600 mb-6 text-lg">
            🚀 Currently in development. Stay tuned for the launch!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              disabled
              className="px-8 py-4 bg-gray-300 text-gray-500 rounded-full font-semibold text-lg cursor-not-allowed"
            >
              Sign Up (Coming Soon)
            </button>
            <button
              disabled
              className="px-8 py-4 bg-gray-300 text-gray-500 rounded-full font-semibold text-lg cursor-not-allowed"
            >
              Learn More (Coming Soon)
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} TripTally. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TechBadge({ name }: { name: string }) {
  return (
    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold">
      {name}
    </div>
  );
}
