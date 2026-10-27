import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { properties, Property } from '@/data/properties';
import PropertyDetailClient from './PropertyDetailClient';
import { api } from '@/lib/api';


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const res = await api.getPublicProjectBySlug(slug);
    if (res && res.success && res.data) {
      const p = res.data;
      return {
        title: p.meta_title ? `${p.meta_title} | Sree Hari Realty` : `${p.name || 'Project'} | Sree Hari Realty`,
        description: p.meta_description || p.description?.slice(0, 160) || p.tagline || 'Premium DTCP & TNRERA approved plots in Trichy'
      };
    }
  } catch {}
  const staticProperty = properties.find((p) => p.slug === slug);
  if (staticProperty) {
    return {
      title: `${staticProperty.title} | Sree Hari Realty`,
      description: staticProperty.description?.slice(0, 160) || staticProperty.tagline
    };
  }
  return {
    title: 'Property Details | Sree Hari Realty',
    description: 'Explore premium gated plotted communities and villa plots in Trichy'
  };
}

export async function generateStaticParams() {
  try {
    const res = await api.getPublicProjects();
    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((p: any) => ({ slug: p.slug }));
    }
  } catch {
    // fallback
  }
  return properties.map((property) => ({
    slug: property.slug,
  }));
}

function mapDatabaseProjectToProperty(p: any): Property {
  const fallback = properties.find((fp) => fp.slug === p.slug || fp.id === p.id);
  return {
    id: p.id,
    slug: p.slug,
    title: p.name || p.title || 'Plotted Community',
    tagline: p.tagline || (fallback ? fallback.tagline : 'Premium DTCP & TNRERA Approved Plotted Community'),
    location: p.location_area || (fallback ? fallback.location : 'Trichy'),
    city: p.location_city || (fallback ? fallback.city : 'Trichy'),
    mapUrl: p.google_maps_embed_url || p.map_url || (fallback ? fallback.mapUrl : ''),
    pricePerSqFt: fallback ? fallback.pricePerSqFt : 0,
    totalPriceRange: p.price_range || (fallback ? fallback.totalPriceRange : 'Contact for Price'),
    plotSizes: p.plot_size_range || (fallback ? fallback.plotSizes : 'Standard Layout Plots'),
    availableUnits: p.available_plots_count !== undefined ? Number(p.available_plots_count) : (fallback ? fallback.availableUnits : 0),
    totalPlots: p.total_plots_count !== undefined ? Number(p.total_plots_count) : (fallback ? fallback.totalPlots : 0),
    dtcpNumber: p.dtcp_number || (fallback ? fallback.dtcpNumber : '100% DTCP Approved'),
    reraNumber: p.rera_number || (fallback ? fallback.reraNumber : 'TNRERA Approved Layout'),
    status: p.status === 'Ongoing' ? 'Featured' : (p.status === 'Sold Out' ? 'Sold Out' : 'Ready to Invest'),
    badgeColor: fallback ? fallback.badgeColor : 'magenta',
    isFeatured: Boolean(p.is_featured),
    heroImage: p.banner_image || p.hero_image || (fallback ? fallback.heroImage : '/project_park_avenue_new.jpg'),
    images: Array.isArray(p.gallery_images) && p.gallery_images.length > 0
      ? p.gallery_images
      : (fallback ? fallback.images : [p.banner_image || '/project_park_avenue_new.jpg']),
    description: p.description || (fallback ? fallback.description : `Welcome to ${p.name || 'this community'}, a high-quality plotted development designed for modern living and rapid capital appreciation.`),
    highlights: Array.isArray(p.highlights) && p.highlights.length > 0
      ? p.highlights
      : (fallback ? fallback.highlights : [
          `${p.total_extent_acres ? p.total_extent_acres + ' Acres ' : ''}Gated Layout with ${p.dtcp_number || '100% DTCP'} Approval`,
          `Plot Sizes Ranging from ${p.plot_size_range || '1,200 to 2,400 Sq.Ft'}`,
          'Direct Blacktop Tar Roads & Sweet Potable Groundwater Access',
          'Fast Spot Registration & 100% Legally Verified Title Deeds'
        ]),
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

async function PropertyLoader({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. Attempt to fetch live project from database backend by slug
  let projectData: any = null;
  try {
    const res = await api.getPublicProjectBySlug(slug);
    if (res && res.success && res.data) {
      projectData = {
        ...mapDatabaseProjectToProperty(res.data),
        ...res.data
      };
    }
  } catch {
    // Backend fetch failed, check static fallback
  }

  // 2. If backend didn't return it, check static properties fallback
  if (!projectData) {
    const staticProperty = properties.find((p) => p.slug === slug);
    if (staticProperty) {
      projectData = staticProperty;
    }
  }

  // 3. If neither exists, 404
  if (!projectData) {
    notFound();
  }

  return <PropertyDetailClient property={projectData} />;
}

export default function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fef9e6] flex items-center justify-center text-sm font-bold text-[#006452]">Loading Property Details...</div>}>
      <PropertyLoader params={params} />
    </Suspense>
  );
}
