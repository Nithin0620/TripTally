'use client';

import { useState, useEffect } from 'react';

export default function HeroWithFade({ children }: { children: React.ReactNode }) {
  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fadeStart = 0;
      const fadeEnd = 600;
      
      if (scrollY <= fadeStart) {
        setScrollOpacity(1);
      } else if (scrollY >= fadeEnd) {
        setScrollOpacity(0);
      } else {
        const opacity = 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart);
        setScrollOpacity(opacity);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative">
      {/* Background Image with Fade */}
      <div 
        className="fixed inset-0 z-0 transition-opacity duration-300"
        style={{ 
          opacity: scrollOpacity,
          backgroundImage: 'url(https://png.pngtree.com/thumb_back/fh260/background/20251205/pngtree-mountain-peak-achievement-and-freedom-image_20739060.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Very light overlay for clearer image */}
        <div className="absolute inset-0 bg-[#02131B]/20" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
