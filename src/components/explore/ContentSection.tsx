/**
 * ContentSection Component
 * Alternating image/text layout for premium explore pages
 * Supports fade-in animations on scroll
 */

interface ContentSectionProps {
  title: string;
  content: string;
  imageUrl: string;
  imagePosition?: 'left' | 'right';
  index?: number;
}

export default function ContentSection({
  title,
  content,
  imageUrl,
  imagePosition = 'left',
  index = 0,
}: ContentSectionProps) {
  const isLeft = imagePosition === 'left';

  return (
    <section
      className="py-16 md:py-24 animate-fadeIn"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div
        className={`flex flex-col ${
          isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
        } gap-10 items-center`}
      >
        {/* Image */}
        <div
          className="w-full md:w-1/2 animate-slideInLeft"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-96 object-cover rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Text */}
        <div
          className="w-full md:w-1/2 animate-slideInRight"
          style={{ animationDelay: `${(index + 1) * 0.1}s` }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#163427] mb-6">
            {title}
          </h2>
          <p className="text-[#4f6f5e] text-lg leading-relaxed mb-6">
            {content}
          </p>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#EFEC07] font-semibold hover:gap-3 transition-all cursor-pointer"
          >
            <span>Learn more</span>
            <svg
              className="w-5 h-5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
