/**
 * AttractionsSection Component
 * Grid layout for must-visit attractions with images and descriptions
 * Supports fade-in animations on scroll
 */

interface Attraction {
  name: string;
  description: string;
  image_placeholder: string;
}

interface AttractionsSectionProps {
  attractions: Attraction[];
  placeName: string;
}

function AttractionCard({
  attraction,
  index,
}: {
  attraction: Attraction;
  index: number;
}) {
  return (
    <div
      className="group animate-fadeInUp hover:-translate-y-2 transition-transform duration-300"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative rounded-2xl overflow-hidden h-64 mb-4">
        <img
          src={attraction.image_placeholder}
          alt={attraction.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <h3 className="text-xl font-bold text-[#163427] group-hover:text-[#EFEC07] transition-colors mb-2">
        {attraction.name}
      </h3>
      <p className="text-[#4f6f5e] text-sm">{attraction.description}</p>
    </div>
  );
}

export default function AttractionsSection({
  attractions,
  placeName,
}: AttractionsSectionProps) {
  return (
    <section className="py-20">
      <div className="mb-12 animate-fadeIn">
        <h2 className="text-4xl md:text-5xl font-bold text-[#163427] mb-3">
          🏛️ Must-Visit Attractions
        </h2>
        <div className="w-12 h-1 bg-gradient-to-r from-[#EFEC07] to-transparent rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {attractions.map((attraction, idx) => (
          <AttractionCard key={idx} attraction={attraction} index={idx} />
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
