'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingCTA from '@/components/FloatingCTA';
import PageLoader from '@/components/PageLoader';
import PromotionalPopupModal from '@/components/PromotionalPopupModal';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <main className="flex-grow">{children}</main>;
  }

  return (
    <>
      <PageLoader />
      <PromotionalPopupModal />
      <Suspense
        fallback={
          <div className="h-16 bg-[#fef9e6] border-b border-amber-100" />
        }
      >
        <Navbar />
      </Suspense>
      <main className="flex-grow">{children}</main>
      <Footer />
      <FloatingCTA />
    </>
  );
}