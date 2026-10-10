'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { properties, Property, TAMIL_NADU_DISTRICTS } from '@/data/properties';
import PropertyCard from '@/components/PropertyCard';
import EnquiryModal from '@/components/EnquiryModal';
import { ShieldCheck, Filter, Search, MapPin, Maximize2, Tag, X, RotateCcw } from 'lucide-react';

function PropertiesContent() {
  const searchParams = useSearchParams();
  const initialLocation = searchParams.get('location') || 'All';
  const initialSize = searchParams.get('size') || 'All';
  const initialBudget = searchParams.get('budget') || 'All';

  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation);
  const [selectedSize, setSelectedSize] = useState<string>(initialSize);
  const [selectedBudget, setSelectedBudget] = useState<string>(initialBudget);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (searchParams.get('location')) setSelectedLocation(searchParams.get('location')!);
    if (searchParams.get('size')) setSelectedSize(searchParams.get('size')!);
    if (searchParams.get('budget')) setSelectedBudget(searchParams.get('budget')!);
  }, [searchParams]);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // Location Filter
      const matchLocation =
        selectedLocation === 'All' ||
        p.city.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        p.location.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        selectedLocation.toLowerCase().includes(p.city.toLowerCase());

      // Status Filter
      const matchStatus = selectedStatus === 'All' || p.status === selectedStatus;

      // Plot Size Filter
      let matchSize = true;
      if (selectedSize !== 'All') {
        if (selectedSize === '600-1200') {
          matchSize = p.plotVariants.some((v) => v.sqft <= 1200);
        } else if (selectedSize === '1200-1800') {
          matchSize = p.plotVariants.some((v) => v.sqft >= 1200 && v.sqft <= 1800);
        } else if (selectedSize === '1800-2400') {
          matchSize = p.plotVariants.some((v) => v.sqft >= 1800 && v.sqft <= 2400);
        } else if (selectedSize === '2400+') {
          matchSize = p.plotVariants.some((v) => v.sqft >= 2400);
        }
      }

      // Budget Filter
      let matchBudget = true;
      if (selectedBudget !== 'All') {
        if (selectedBudget === 'under-15') {
          matchBudget = p.plotVariants.some((v) => {
            const num = parseInt(v.approxPrice.replace(/[^0-9]/g, ''), 10);
            return num < 1500000;
          });
        } else if (selectedBudget === '15-25') {
          matchBudget = p.plotVariants.some((v) => {
            const num = parseInt(v.approxPrice.replace(/[^0-9]/g, ''), 10);
            return num >= 1500000 && num <= 2500000;
          });
        } else if (selectedBudget === '25-40') {
          matchBudget = p.plotVariants.some((v) => {
            const num = parseInt(v.approxPrice.replace(/[^0-9]/g, ''), 10);
            return num >= 2500000 && num <= 4000000;
          });
        } else if (selectedBudget === '40+') {
          matchBudget = p.plotVariants.some((v) => {
            const num = parseInt(v.approxPrice.replace(/[^0-9]/g, ''), 10);
            return num >= 4000000;
          });
        }
      }

      // Text Search
      const matchSearch =
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase());

      return matchLocation && matchStatus && matchSize && matchBudget && matchSearch;
    });
  }, [selectedLocation, selectedStatus, selectedSize, selectedBudget, searchQuery]);

  const handleReset = () => {
    setSelectedLocation('All');
    setSelectedSize('All');
    setSelectedBudget('All');
    setSelectedStatus('All');
    setSearchQuery('');
  };

  const handleEnquire = (projectName: string) => {
    setActiveProject(projectName);
    setIsEnquiryOpen(true);
  };

  const hasActiveFilters =
    selectedLocation !== 'All' ||
    selectedSize !== 'All' ||
    selectedBudget !== 'All' ||
    selectedStatus !== 'All' ||
    searchQuery !== '';

  return (
    <div className="space-y-12 pb-16 bg-[#fef9e6] font-sans">
      {/* 1. Page Header Banner WITH HD PANORAMIC BACKGROUND & CINEMATIC GRADIENT */}
      <section className="relative min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] flex items-center overflow-hidden bg-gray-950 border-b border-amber-900/30">
        {/* Exact HD Panoramic Background Image */}
        <Image
          src="/hero_properties.jpg"
          alt="Sree Hari Realty Promoters Gated Communities Portfolio"
          fill
          priority
          quality={95}
          className="object-cover object-[center_35%] sm:object-[60%_35%]"
        />

        {/* Balanced Cinematic Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/35 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10 w-full">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-bold tracking-widest text-amber-300 uppercase border border-amber-300/30 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D61F69] animate-pulse" />
              <span>VERIFIED LAND & VILLA PLOTS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-md font-serif-title">
              Our Plotted <span className="text-[#D61F69] drop-shadow-[0_2px_12px_rgba(214,31,105,0.4)]">Communities</span>
            </h1>

            <p className="text-white/90 text-xs sm:text-sm font-medium leading-relaxed max-w-xl drop-shadow-sm">
              Explore our verified portfolio of 100% DTCP & TNRERA approved gated layouts across Trichy, Pudukkottai, and high-growth corridors with blacktop roads, sweet groundwater, and spot registration.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Comprehensive Search & Filter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-amber-100/90 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search project name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D61F69] text-gray-800"
              />
            </div>

            {/* Location / District Filter */}
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs font-semibold text-gray-800 bg-stone-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D61F69] cursor-pointer"
              >
                <option value="All">All Locations</option>
                {TAMIL_NADU_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            {/* Plot Size Filter */}
            <div className="relative">
              <Maximize2 className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs font-semibold text-gray-800 bg-stone-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D61F69] cursor-pointer"
              >
                <option value="All">All Plot Sizes</option>
                <option value="600-1200">600 - 1200 Sq.Ft</option>
                <option value="1200-1800">1200 - 1800 Sq.Ft</option>
                <option value="1800-2400">1800 - 2400 Sq.Ft</option>
                <option value="2400+">2400+ Sq.Ft (Large)</option>
              </select>
            </div>

            {/* Budget Range Filter */}
            <div className="relative">
              <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs font-semibold text-gray-800 bg-stone-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D61F69] cursor-pointer"
              >
                <option value="All">All Budgets</option>
                <option value="under-15">Under ₹15 Lakhs</option>
                <option value="15-25">₹15 Lakhs - ₹25 Lakhs</option>
                <option value="25-40">₹25 Lakhs - ₹40 Lakhs</option>
                <option value="40+">₹40 Lakhs & Above</option>
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full bg-stone-100 hover:bg-stone-200 text-gray-700 font-bold py-2 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

          {/* Active Filter Tags & Count */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 pt-2 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-gray-900">
                Showing <strong>{filteredProperties.length}</strong> gated plotted communities
              </span>

              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5 pl-2">
                  {selectedLocation !== 'All' && (
                    <span className="inline-flex items-center gap-1 bg-pink-50 text-[#D61F69] px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-pink-200">
                      Location: {selectedLocation}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedLocation('All')} />
                    </span>
                  )}
                  {selectedSize !== 'All' && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#006452] px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-emerald-200">
                      Size: {selectedSize} Sq.Ft
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSize('All')} />
                    </span>
                  )}
                  {selectedBudget !== 'All' && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-amber-200">
                      Budget: {selectedBudget}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedBudget('All')} />
                    </span>
                  )}
                </div>
              )}
            </div>

            <span className="flex items-center gap-1 text-[#006452] font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% DTCP & RERA Certified
            </span>
          </div>
        </div>
      </section>

      {/* 3. Properties Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onEnquire={handleEnquire}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-amber-100 space-y-4 max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-full bg-pink-50 text-[#D61F69] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">No Projects Found</h3>
              <p className="text-gray-500 text-xs">
                No plotted communities matched your selected filter combination.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="bg-[#D61F69] hover:bg-[#BE185D] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow"
            >
              View All Communities
            </button>
          </div>
        )}
      </section>

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        propertyName={activeProject}
      />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fef9e6] flex items-center justify-center">Loading Properties...</div>}>
      <PropertiesContent />
    </Suspense>
  );
}
