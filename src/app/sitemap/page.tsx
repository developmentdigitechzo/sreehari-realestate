import React, { Suspense } from 'react';
import SitemapClient from './SitemapClient';

export const metadata = {
  title: 'HTML Sitemap | Sree Hari Realty Promoters',
  description: 'Complete directory of all public pages, residential gated community plot projects, and real estate guidance articles by Sree Hari Realty.',
};

export default function SitemapPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center text-sm font-bold text-[#006452]">
          Loading Site Directory...
        </div>
      }
    >
      <SitemapClient />
    </Suspense>
  );
}
