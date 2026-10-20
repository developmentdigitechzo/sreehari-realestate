import React, { Suspense } from 'react';
import ProjectDetailManagementClient from './ProjectDetailManagementClient';

export function generateStaticParams() {
  return [
    { id: 'proj-park-avenue' },
    { id: 'proj-sri-amman-nagar' },
    { id: 'proj-aishwarya-nagar' },
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: 'park-avenue' },
    { id: 'sri-amman-nagar' },
    { id: 'aishwarya-nagar' },
  ];
}

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400">
          Loading Project Details...
        </div>
      }
    >
      <ProjectDetailManagementClient projectId={id} />
    </Suspense>
  );
}
