import React from 'react';
import { notFound } from 'next/navigation';
import { properties } from '@/data/properties';
import PropertyDetailClient from './PropertyDetailClient';

export function generateStaticParams() {
  return properties.map((property) => ({
    slug: property.slug,
  }));
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = properties.find((p) => p.slug === slug);

  if (!property) {
    notFound();
  }

  return <PropertyDetailClient property={property} />;
}
