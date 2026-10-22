'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingCTA from '@/components/FloatingCTA';
import PageLoader from '@/components/PageLoader';
import SparkleCursor from '@/components/SparkleCursor';
import PromotionalPopupModal from '@/components/PromotionalPopupModal';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/nimda');

  if (isAdminRoute) {
    return (
      <>
        <SparkleCursor />
        <main className="flex-grow">{children}</main>
      </>
    );
  }

  return (
    <>
      <PageLoader />
      <SparkleCursor />
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
