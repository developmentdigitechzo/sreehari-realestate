'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight, Maximize2 } from 'lucide-react';
import { Property } from '@/data/properties';

interface PropertyCardProps {
  property: Property;
  onEnquire?: (propertyName: string) => void;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  // Extract clean price without parentheses
  const rawPrice = property.totalPriceRange.replace('Plots from ', '');
  const statusMatch = rawPrice.match(/\(([^)]+)\)/);
  const cleanPrice = rawPrice.replace(/\s*\([^)]+\)/g, '').trim();

  // Determine status badge label
  let statusLabel = statusMatch ? statusMatch[1] : '';
  if (!statusLabel) {
    statusLabel = property.availableUnits > 0 ? 'Plots Available' : 'Sold Out';
  }

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group relative block bg-gradient-to-b from-white via-white to-[#fffef2] group-hover:to-[#fef9e6] rounded-3xl overflow-hidden border border-amber-100/90 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 cursor-pointer h-full flex flex-col"
    >
      {/* 1. Pure Clean Image Container */}
      <div className="relative h-60 w-full overflow-hidden bg-stone-100 flex-shrink-0">
        <Image
          src={property.heroImage}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
        />
        {/* Soft Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>

      {/* 2. Content Panel: Title -> Location -> Amount -> Sq.Ft Units */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-transparent group-hover:bg-[#fffdf2]/70 transition-colors duration-300">
        <div className="space-y-2.5">
          {/* 2.1 Title FIRST - Fixed height for straight alignment */}
          <h3 className="text-xl font-extrabold text-gray-950 group-hover:text-[#006452] transition-colors tracking-tight line-clamp-1 h-7 flex items-center">
            {property.title}
          </h3>

          {/* 2.2 Location BELOW Title - Fixed height for straight alignment */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium h-5">
            <MapPin className="w-3.5 h-3.5 text-[#006452] flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>

          {/* 2.3 Amount / Price Line - Fixed height with clean non-wrapping price */}
          <div className="flex items-center gap-1.5 pt-0.5 h-7">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">
              Starting:
            </span>
            <span className="text-base sm:text-[17px] font-black text-[#D61F69] tracking-tight whitespace-nowrap truncate">
              {cleanPrice}
            </span>
          </div>

          {/* 2.4 Sq.Ft Units & Status Badge - Fixed height row for straight horizontal alignment */}
          <div className="pt-0.5 flex items-center justify-between gap-2 h-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-800 bg-white/95 px-3 py-1.5 rounded-xl border border-amber-200/80 shadow-2xs flex-shrink-0">
              <Maximize2 className="w-3.5 h-3.5 text-[#006452]" />
              <span>{property.plotSizes}</span>
            </span>

            {statusLabel && (
              <span
                className={`inline-flex items-center text-[11px] font-extrabold px-2.5 py-1 rounded-xl border shadow-2xs flex-shrink-0 ${
                  statusLabel.toLowerCase().includes('sold')
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : statusLabel.toLowerCase().includes('complete')
                    ? 'bg-stone-100 text-stone-700 border-stone-200'
                    : 'bg-emerald-50 text-[#006452] border-emerald-200'
                }`}
              >
                {statusLabel}
              </span>
            )}
          </div>
        </div>

        {/* 3. Bottom Row Action CTA */}
        <div className="pt-3 border-t border-amber-100/80 group-hover:border-amber-200 transition-colors flex items-center justify-between">
          <span className="text-xs font-bold text-[#006452] group-hover:text-[#D61F69] transition-colors flex items-center gap-1">
            Explore Plots
          </span>

          {/* Consistent Brand Green Arrow Button */}
          <div className="w-9 h-9 rounded-full bg-[#006452] text-white flex items-center justify-center transition-all duration-300 shadow-sm group-hover:bg-[#D61F69] group-hover:scale-105 group-hover:translate-x-0.5 flex-shrink-0">
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
