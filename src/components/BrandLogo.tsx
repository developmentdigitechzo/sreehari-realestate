'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export default function BrandLogo({ variant = 'light', className = '' }: BrandLogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center group ${className}`}>
      {/* Official 100% Transparent Seamless Opaque Logo */}
      <div className={`relative h-13 sm:h-15 md:h-[66px] w-auto aspect-[1942/1563] flex items-center justify-center ${
        variant === 'dark' ? 'bg-white/90 p-1.5 rounded-xl shadow-md backdrop-blur-sm' : ''
      }`}>
        <Image
          src="/logo_transparent.png"
          alt="SREE HARI REALTY PROMOTERS"
          width={1942}
          height={1563}
          priority
          className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105 select-none"
        />
      </div>
    </Link>
  );
}
