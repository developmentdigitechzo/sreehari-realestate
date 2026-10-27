import React, { Suspense } from 'react';
import { api } from '@/lib/api';
import HomeClient from './HomeClient';


export default async function HomePage() {
  let initialProjects: any[] = [];
  try {
    const res = await api.getPublicProjects();
    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
      initialProjects = res.data;
    }
  } catch {
    // Keep empty to let client load if server fetch was unreachable
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fef9e6] flex items-center justify-center text-sm font-bold text-[#006452]">Loading Sree Hari Realty...</div>}>
      <HomeClient initialProjects={initialProjects} />
    </Suspense>
  );
}
