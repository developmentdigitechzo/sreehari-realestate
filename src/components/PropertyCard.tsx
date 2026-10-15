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
  // Extract clean price and status badge label
  const rawPrice = property.totalPriceRange || '';
  const statusMatch = rawPrice.match(/\(([^)]+)\)/);
  const cleanPrice = rawPrice.replace(/\s*\([^)]+\)/g, '').replace(/^Plots from\s*/i, '').trim();

  let statusLabel = statusMatch ? statusMatch[1] : '';
  if (!statusLabel) {
    statusLabel = property.availableUnits > 0 ? 'Plots Available' : 'Sold Out';
  }

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group relative block bg-gradient-to-b from-white via-white to-[#fffdf5] group-hover:to-[#fef9e6] rounded-3xl overflow-hidden border border-amber-100/90 hover:border-emerald-300/80 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.18)] hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer h-full flex flex-col"
    >
      {/* 1. Pure Clean Image Container with Subtle Sheen */}
      <div className="relative h-60 w-full overflow-hidden bg-stone-100 flex-shrink-0">
        <Image
          src={property.heroImage}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
        />
        {/* Soft Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        
        {/* Luxury Glass Sheen Sweep on Hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      </div>

      {/* 2. Content Panel: Title -> Location -> Amount -> Sq.Ft Units */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-transparent group-hover:bg-[#fffdf2]/70 transition-colors duration-300">
        <div className="space-y-2.5">
          {/* 2.1 Title FIRST - Brand Green by default */}
          <h3 className="text-xl font-extrabold text-[#006452] tracking-tight line-clamp-1 h-7 flex items-center transition-colors">
            {property.title}
          </h3>

          {/* 2.2 Location BELOW Title - Touch navigates to exact map location */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium h-5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const mapLink = property.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(property.title + ' ' + property.location)}`;
                window.open(mapLink, '_blank', 'noopener,noreferrer');
              }}
              className="flex items-center gap-1.5 text-left text-gray-600 hover:text-[#006452] transition-colors cursor-pointer group/loc max-w-full"
              title="Touch to navigate exact location in Google Maps"
            >
              <MapPin className="w-3.5 h-3.5 text-[#006452] group-hover/loc:text-[#D61F69] group-hover/loc:scale-110 transition-transform flex-shrink-0" />
              <span className="truncate group-hover/loc:underline underline-offset-2">{property.location}</span>
            </button>
          </div>

          {/* 2.3 Amount / Price Line */}
          <div className="flex items-center gap-1.5 pt-0.5 h-7">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex-shrink-0">
              Pricing:
            </span>
            <span className="text-base sm:text-[16px] font-black text-[#D61F69] tracking-tight whitespace-nowrap truncate">
              {cleanPrice}
            </span>
          </div>

          {/* 2.4 Sq.Ft Units & Status Badge - Fixed height row for straight horizontal alignment */}
          <div className="pt-0.5 flex items-center justify-between gap-2 h-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-800 bg-white/95 px-3 py-1.5 rounded-xl border border-amber-200/80 shadow-2xs flex-shrink-0 transition-transform duration-300 group-hover:border-amber-300">
              <Maximize2 className="w-3.5 h-3.5 text-[#006452]" />
              <span>{property.plotSizes}</span>
            </span>

            {statusLabel && (
              <span
                className={`inline-flex items-center text-[11px] font-extrabold px-2.5 py-1 rounded-xl border shadow-2xs flex-shrink-0 transition-all duration-300 ${
                  statusLabel.toLowerCase().includes('sold')
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : statusLabel.toLowerCase().includes('complete')
                    ? 'bg-stone-100 text-stone-700 border-stone-200'
                    : 'bg-emerald-50 text-[#006452] border-emerald-200 group-hover:bg-emerald-100/70'
                }`}
              >
                {statusLabel}
              </span>
            )}
          </div>
        </div>

        {/* 3. Bottom Row Action CTA - Warm Yellow Pill Button (#f7db49) */}
        <div className="pt-3 border-t border-amber-100/80 group-hover:border-amber-200 transition-colors flex items-center">
          <div className="inline-flex items-center gap-2 bg-[#f7db49] text-[#006452] font-extrabold text-xs px-5 py-2.5 rounded-full shadow-xs group-hover:shadow-[0_4px_16px_rgba(247,219,73,0.5)] group-hover:bg-[#f6d73c] transition-all duration-300 ease-out">
            <span>Explore Plots</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
