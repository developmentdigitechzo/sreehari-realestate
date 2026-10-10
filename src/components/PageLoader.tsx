'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function PageLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Fast dismissal: display briefly for visual feedback on refresh, then dismiss ASAP
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 450);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 750);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#fef9e6] transition-opacity duration-300 ease-out select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-4 px-6">
        {/* Brand Lotus Logo with subtle ambient glow */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="absolute -top-3 w-32 h-32 bg-[#D61F69]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative w-44 sm:w-52 h-24 sm:h-28 flex items-center justify-center">
            <Image
              src="/logo_transparent.png"
              alt="Sree Hari Realty Promoters"
              width={400}
              height={320}
              priority
              quality={95}
              className="max-h-full w-auto object-contain"
            />
          </div>
        </div>

        {/* Loading Spinner & Label */}
        <div className="flex flex-col items-center gap-2.5 mt-1">
          <div className="relative w-8 h-8">
            {/* Background Track */}
            <div className="w-8 h-8 rounded-full border-2 border-[#006452]/20" />
            {/* Fast Dual-Color Spinning Ring */}
            <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-transparent border-t-[#D61F69] border-r-[#006452] animate-spin" />
          </div>

          <span className="text-[11px] font-extrabold text-[#006452] tracking-widest uppercase">
            Loading...
          </span>
        </div>
      </div>
    </div>
  );
}
