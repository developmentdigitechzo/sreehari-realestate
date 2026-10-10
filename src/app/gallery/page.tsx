'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { galleryItems } from '@/data/gallery';
import { ShieldCheck, MapPin, Eye, Calendar, ArrowRight } from 'lucide-react';
import EnquiryModal from '@/components/EnquiryModal';

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const categories = [
    'All',
    'Park Avenue',
    'Sri Amman Nagar',
    'Aishwarya Nagar'
  ];

  const filteredItems =
    selectedCategory === 'All'
      ? galleryItems
      : galleryItems.filter(
          (item) => item.project === selectedCategory || item.category === selectedCategory
        );

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Page Header WITH HD PANORAMIC BACKGROUND & CINEMATIC GRADIENT */}
      <section className="relative min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] flex items-center overflow-hidden bg-gray-950 border-b border-amber-900/30">
        {/* Exact HD Panoramic Background Image */}
        <Image
          src="/hero_gallery.jpg"
          alt="Sree Hari Realty Promoters Gated Layout Gallery"
          fill
          priority
          quality={95}
          className="object-cover object-[70%_center] sm:object-center"
        />

        {/* Balanced Cinematic Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/35 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10 w-full">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-bold tracking-widest text-amber-300 uppercase border border-amber-300/30 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D61F69] animate-pulse" />
              <span>ON-GROUND QUALITY</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-md font-serif-title">
              Gated Layout <span className="text-[#D61F69] drop-shadow-[0_2px_12px_rgba(214,31,105,0.4)]">Gallery</span>
            </h1>

            <p className="text-white/90 text-xs sm:text-[15px] font-medium leading-relaxed max-w-xl drop-shadow-sm">
              Explore the real on-ground infrastructure, grand entrance arch, wide tar roads, and secured layout developments across our landmark projects: Park Avenue, Sri Amman Nagar, and Aishwarya Nagar.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Category Filter Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition uppercase tracking-wider ${
                selectedCategory === cat
                  ? 'bg-[#075E43] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Gallery Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item.image)}
              className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer bg-gray-100"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-[#C5A869] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-white/10">
                {item.category}
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                <span className="text-[10px] text-emerald-300 font-semibold block">
                  {item.project}
                </span>
                <h3 className="font-heading-sc text-sm font-bold text-white drop-shadow">
                  {item.title}
                </h3>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Bottom Site Visit Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#fef9e6] border border-emerald-200/80 rounded-3xl p-8 text-center space-y-4">
          <h2 className="font-heading-sc text-2xl font-bold text-[#04432F]">
            Want to Inspect These Plotted Developments in Person?
          </h2>
          <p className="text-xs text-gray-600 max-w-xl mx-auto">
            Experience the wide tar roads, high groundwater table, and peaceful surroundings firsthand with a complimentary chauffeur-driven site visit.
          </p>
          <button
            onClick={() => setIsEnquiryOpen(true)}
            className="bg-[#075E43] hover:bg-[#04432F] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow"
          >
            Schedule Free Weekend Site Visit
          </button>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full">
            <Image
              src={selectedImage}
              alt="Enlarged Layout Preview"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        title="Schedule Free Layout Inspection"
      />
    </div>
  );
}
