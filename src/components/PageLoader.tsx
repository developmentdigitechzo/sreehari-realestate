'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function PageLoader() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsVisible(true);

    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 750);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1050);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!mounted || !isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#fef9e6] transition-opacity duration-300 ease-out select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-3 px-6">
        {/* Single Official Brand Lotus Logo with Ambient Glow */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="absolute top-0 w-36 h-36 bg-[#D61F69]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative w-52 sm:w-64 h-24 sm:h-28 flex items-center justify-center">
            <Image
              src="/logo_transparent.png"
              alt="Sree Hari Realty Promoters"
              width={400}
              height={200}
              priority
              quality={95}
              className="max-h-full w-auto object-contain drop-shadow-[0_4px_16px_rgba(214,31,105,0.25)]"
            />
          </div>
        </div>

        {/* Loading Spinner & Label */}
        <div className="flex flex-col items-center gap-2 mt-2">
          <div className="relative w-7 h-7">
            {/* Background Track */}
            <div className="w-7 h-7 rounded-full border-2 border-[#006452]/20" />
            {/* Fast Dual-Color Spinning Ring */}
            <div className="absolute inset-0 w-7 h-7 rounded-full border-2 border-transparent border-t-[#D61F69] border-r-[#006452] animate-spin" />
          </div>

          <span className="text-[10.5px] font-extrabold text-[#006452] tracking-widest uppercase">
            Loading...
          </span>
        </div>
      </div>
    </div>
  );
}
