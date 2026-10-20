import type { Metadata } from 'next';
import React from 'react';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sreeharirealty.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Sree Hari Realty Promoters | Premium Gated Community Plots',
  description:
    'Sree Hari Realty Promoters offers premium DTCP and RERA approved gated community villa plots and land in prime growth corridors.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '256x256' },
    ],
    apple: [{ url: '/icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Sree Hari Realty Promoters | Premium Gated Community Plots',
    description:
      'Buy 100% DTCP & RERA approved gated community land and villa plots with clear titles and bank loan approvals.',
    url: siteUrl,
    siteName: 'Sree Hari Realty Promoters',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'Sree Hari Realty Promoters',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#fef9e6] text-gray-900 font-sans selection:bg-[#D61F69] selection:text-white">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}