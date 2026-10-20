'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { properties as fallbackProperties, Property, TAMIL_NADU_DISTRICTS } from '@/data/properties';
import PropertyCard from '@/components/PropertyCard';
import EnquiryModal from '@/components/EnquiryModal';
import { api } from '@/lib/api';
import { ShieldCheck, Filter, Search, MapPin, Maximize2, Tag, Building2, X, RotateCcw } from 'lucide-react';

export function mapProjectRecordToProperty(p: any): Property {
  const fallback = fallbackProperties.find((fp) => fp.slug === p.slug || fp.id === p.id);
  return {
    id: p.id,
    slug: p.slug,
    title: p.name || p.title || 'Plotted Community',
    tagline: p.tagline || (fallback ? fallback.tagline : 'Premium DTCP & TNRERA Approved Plotted Community'),
    location: p.location_area || (p.location_city ? `${p.location_city} Corridor` : (fallback ? fallback.location : 'Trichy')),
    city: p.location_city || (fallback ? fallback.city : 'Trichy'),
    mapUrl: p.google_maps_embed_url || p.map_url || (fallback ? fallback.mapUrl : ''),
    pricePerSqFt: Number(p.price_starting_lakhs) ? Math.round(Number(p.price_starting_lakhs) * 100000 / 1200) : (fallback ? fallback.pricePerSqFt : 0),
    totalPriceRange: p.price_range || (p.price_starting_lakhs ? `Plots from ₹${p.price_starting_lakhs} Lakhs` : (fallback ? fallback.totalPriceRange : 'Contact for Price')),
    plotSizes: p.plot_size_range || (fallback ? fallback.plotSizes : 'Standard Layout Plots'),
    availableUnits: p.available_plots_count !== undefined ? Number(p.available_plots_count) : (fallback ? fallback.availableUnits : 0),
    totalPlots: p.total_plots_count !== undefined ? Number(p.total_plots_count) : (fallback ? fallback.totalPlots : 0),
    dtcpNumber: p.dtcp_number || (fallback ? fallback.dtcpNumber : '100% DTCP Approved'),
    reraNumber: p.rera_number || (fallback ? fallback.reraNumber : 'TNRERA Approved Layout'),
    status: p.status === 'Ongoing' ? 'Featured' : (p.status === 'Sold Out' ? 'Sold Out' : (p.status || 'Ready to Invest')),
    badgeColor: fallback ? fallback.badgeColor : 'magenta',
    isFeatured: Boolean(p.is_featured),
    heroImage: p.banner_image || p.hero_image || (fallback ? fallback.heroImage : '/project_park_avenue_new.jpg'),
    images: Array.isArray(p.gallery_images) && p.gallery_images.length > 0
      ? p.gallery_images
      : (fallback ? fallback.images : [p.banner_image || '/project_park_avenue_new.jpg']),
    description: p.description || (fallback ? fallback.description : ''),
    highlights: Array.isArray(p.highlights) && p.highlights.length > 0
      ? p.highlights
      : (fallback ? fallback.highlights : []),
    amenitiesList: fallback ? fallback.amenitiesList : [],
    amenities: Array.isArray(p.amenities) && p.amenities.length > 0
      ? p.amenities
      : (fallback ? fallback.amenities : []),
    plotVariants: fallback ? fallback.plotVariants : [],
    locationAdvantages: Array.isArray(p.nearby_landmarks) && p.nearby_landmarks.length > 0
      ? p.nearby_landmarks
      : (fallback ? fallback.locationAdvantages : [])
  };
}

export default function PropertiesClient({ initialProjects }: { initialProjects?: any[] }) {
  const searchParams = useSearchParams();
  const initialLocation = searchParams.get('location') || 'All';
  const initialSize = searchParams.get('size') || 'All';
  const initialStatus = searchParams.get('status') || 'All';
  const initialProject = searchParams.get('project') || searchParams.get('slug') || 'All';

  const [allProperties, setAllProperties] = useState<Property[]>(() => {
    if (Array.isArray(initialProjects) && initialProjects.length > 0) {
      return initialProjects.map(mapProjectRecordToProperty);
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(
    !initialProjects || initialProjects.length === 0
  );
  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation);
  const [selectedSize, setSelectedSize] = useState<string>(initialSize);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedProject, setSelectedProject] = useState<string>(initialProject);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<string | undefined>(undefined);

  // Dynamically extract any unique locations from newly added projects
  const additionalProjectLocations = useMemo(() => {
    const defaultKeys = new Set(['thiruverumbur', 'airport mathur', 'airport', 'mathur', 'thirumayam']);
    const list: string[] = [];
    allProperties.forEach((p) => {
      const loc = (p.city || p.location || '').trim();
      if (loc && !defaultKeys.has(loc.toLowerCase()) && !list.includes(loc)) {
        list.push(loc);
      }
    });
    return list;
  }, [allProperties]);

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveProjects() {
      try {
        if (!initialProjects || initialProjects.length === 0) {
          setIsLoading(true);
        }
        const res = await api.getPublicProjects();
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: Property[] = res.data.map(mapProjectRecordToProperty);
          if (isMounted) setAllProperties(mapped);
        } else if (!initialProjects || initialProjects.length === 0) {
          if (isMounted) setAllProperties(fallbackProperties);
        }
      } catch {
        if (!initialProjects || initialProjects.length === 0) {
          if (isMounted) setAllProperties(fallbackProperties);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchLiveProjects();
    return () => {
      isMounted = false;
    };
  }, [initialProjects]);

  useEffect(() => {
    if (searchParams.get('location')) setSelectedLocation(searchParams.get('location')!);
    if (searchParams.get('size')) setSelectedSize(searchParams.get('size')!);
    if (searchParams.get('status')) setSelectedStatus(searchParams.get('status')!);
    if (searchParams.get('project')) setSelectedProject(searchParams.get('project')!);
    else if (searchParams.get('slug')) setSelectedProject(searchParams.get('slug')!);
  }, [searchParams]);

  const filteredProperties = useMemo(() => {
    return allProperties.filter((p) => {
      // Project Filter
      const matchProject =
        selectedProject === 'All' ||
        p.id === selectedProject ||
        p.slug === selectedProject;

      // Location Filter
      let matchLocation = true;
      if (selectedLocation !== 'All') {
        const sel = selectedLocation.toLowerCase();
        const pCity = (p.city || '').toLowerCase();
        const pLoc = (p.location || '').toLowerCase();
        if (sel === 'thiruverumbur') {
          matchLocation = pCity.includes('thiruverumbur') || pLoc.includes('thiruverumbur');
        } else if (sel === 'airport mathur') {
          matchLocation = pCity.includes('airport') || pCity.includes('mathur') || pLoc.includes('airport') || pLoc.includes('mathur');
        } else if (sel === 'thirumayam') {
          matchLocation = pCity.includes('thirumayam') || pLoc.includes('thirumayam');
        } else {
          matchLocation = pCity.includes(sel) || pLoc.includes(sel) || sel.includes(pCity);
        }
      }

      // Status Filter
      let matchStatus = true;
      if (selectedStatus !== 'All') {
        if (selectedStatus === 'available') {
          matchStatus = p.availableUnits > 0;
        } else if (selectedStatus === 'sold') {
          matchStatus = p.availableUnits === 0;
        } else {
          matchStatus = p.status === selectedStatus;
        }
      }

      // Plot Size Filter
      let matchSize = true;
      if (selectedSize !== 'All') {
        const hasVariants = Array.isArray(p.plotVariants) && p.plotVariants.length > 0;
        if (hasVariants) {
          if (selectedSize === '600-1200') {
            matchSize = p.plotVariants.some((v) => v.sqft <= 1200);
          } else if (selectedSize === '1200-1800') {
            matchSize = p.plotVariants.some((v) => v.sqft >= 1200 && v.sqft <= 1800);
          } else if (selectedSize === '1800-2400') {
            matchSize = p.plotVariants.some((v) => v.sqft >= 1800 && v.sqft <= 2400);
          } else if (selectedSize === '2400+') {
            matchSize = p.plotVariants.some((v) => v.sqft >= 2400);
          }
        } else {
          const str = (p.plotSizes || '').toLowerCase();
          if (selectedSize === '600-1200') {
            matchSize = str.includes('600') || str.includes('750') || str.includes('800') || str.includes('1000') || str.includes('1200');
          } else if (selectedSize === '1200-1800') {
            matchSize = str.includes('1200') || str.includes('1500') || str.includes('1800');
          } else if (selectedSize === '1800-2400') {
            matchSize = str.includes('1800') || str.includes('2000') || str.includes('2400');
          } else if (selectedSize === '2400+') {
            matchSize = str.includes('2400') || str.includes('2687') || str.includes('3000');
          }
        }
      }

      // Text Search
      const matchSearch =
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase());

      return matchProject && matchLocation && matchStatus && matchSize && matchSearch;
    });
  }, [allProperties, selectedProject, selectedLocation, selectedStatus, selectedSize, searchQuery]);

  const handleReset = () => {
    setSelectedProject('All');
    setSelectedLocation('All');
    setSelectedSize('All');
    setSelectedStatus('All');
    setSearchQuery('');
  };

  const handleEnquire = (projectName: string) => {
    setActiveProject(projectName);
    setIsEnquiryOpen(true);
  };

  const hasActiveFilters =
    selectedProject !== 'All' ||
    selectedLocation !== 'All' ||
    selectedSize !== 'All' ||
    selectedStatus !== 'All' ||
    searchQuery !== '';

  return (
    <div className="space-y-12 pb-16 bg-[#fef9e6] font-sans">
      {/* 1. Page Header Banner WITH HD PANORAMIC BACKGROUND & CINEMATIC GRADIENT */}
      <section className="relative min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] flex items-center overflow-hidden bg-gray-950 border-b border-amber-900/30">
        <Image
          src="/hero_properties_plotted_new.jpg"
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
        <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] p-5 sm:p-6 rounded-3xl shadow-sm border border-amber-100/90 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search project name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#fffdf8] border border-amber-200/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006452] text-gray-800"
              />
            </div>

            {/* Location / District Filter */}
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs font-semibold text-gray-800 bg-[#fffdf8] border border-amber-200/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006452] cursor-pointer"
              >
                <option value="All">All Locations</option>
                <optgroup label="Trichy">
                  <option value="Thiruverumbur">1. Thiruverumbur</option>
                  <option value="Airport Mathur">2. Airport Mathur</option>
                </optgroup>
                <optgroup label="Pudukkottai">
                  <option value="Thirumayam">1. Thirumayam</option>
                </optgroup>
                {additionalProjectLocations.length > 0 && (
                  <optgroup label="Other Locations">
                    {additionalProjectLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Plot Size Filter */}
            <div className="relative">
              <Maximize2 className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs font-semibold text-gray-800 bg-[#fffdf8] border border-amber-200/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006452] cursor-pointer"
              >
                <option value="All">All Plot Sizes</option>
                <option value="600-1200">600 - 1200 Sq.Ft</option>
                <option value="1200-1800">1200 - 1800 Sq.Ft</option>
                <option value="1800-2400">1800 - 2400 Sq.Ft</option>
                <option value="2400+">2400+ Sq.Ft (Large)</option>
              </select>
            </div>

            {/* Project Filter */}
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs font-semibold text-gray-800 bg-[#fffdf8] border border-amber-200/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006452] cursor-pointer"
              >
                <option value="All">All Projects</option>
                {allProperties.map((p) => (
                  <option key={p.id} value={p.slug || p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full bg-amber-100/70 hover:bg-amber-200/80 text-[#006452] font-extrabold py-2 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

          {/* Active Filter Tags & Count */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 pt-2 border-t border-amber-100/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-gray-900">
                Showing <strong>{isLoading ? '...' : filteredProperties.length}</strong> gated plotted communities
              </span>

              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5 pl-2">
                  {selectedProject !== 'All' && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-amber-200">
                      Project: {allProperties.find((p) => p.slug === selectedProject || p.id === selectedProject)?.title || selectedProject}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedProject('All')} />
                    </span>
                  )}
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
                  {selectedStatus !== 'All' && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-amber-200">
                      Status: {selectedStatus === 'available' ? 'Plots Available' : selectedStatus === 'sold' ? 'Sold Out' : selectedStatus}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedStatus('All')} />
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
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white/80 rounded-3xl p-5 border border-amber-100/90 shadow-sm animate-pulse space-y-4 h-[440px] flex flex-col justify-between"
              >
                <div className="h-60 bg-amber-100/60 rounded-2xl w-full" />
                <div className="space-y-2.5">
                  <div className="h-6 bg-amber-200/50 rounded-md w-3/4" />
                  <div className="h-4 bg-amber-100/60 rounded-md w-1/2" />
                  <div className="h-5 bg-amber-100/50 rounded-md w-2/3" />
                </div>
                <div className="h-10 bg-amber-200/60 rounded-full w-full mt-2" />
              </div>
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
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
          <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-3xl p-12 text-center border border-amber-100/90 space-y-4 max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-full bg-pink-50 text-[#D61F69] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#006452]">No Projects Found</h3>
              <p className="text-gray-500 text-xs">
                No plotted communities matched your selected filter combination.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="bg-[#f7db49] hover:bg-[#f6d73c] text-[#006452] text-xs font-extrabold px-6 py-2.5 rounded-full transition shadow-xs"
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
