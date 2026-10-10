'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Phone, ArrowRight, Menu, X } from 'lucide-react';
import { COMPANY_PHONE, COMPANY_PHONE_RAW } from '@/data/properties';
import BrandLogo from './BrandLogo';
import EnquiryModal from './EnquiryModal';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Properties', href: '/properties' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Blog', href: '/blog' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 shadow-sm">
        {/* Top Animated Free Site Visit Cab Bar with Clean White Background & Logo Green Text */}
        <div
          onClick={() => setIsEnquiryOpen(true)}
          className="bg-white text-xs py-1.5 px-3 sm:px-4 relative overflow-hidden border-b border-gray-200 select-none cursor-pointer group shadow-2xs"
          title="Click to Book Your Free Site Visit Cab"
        >
        <div className="w-full overflow-hidden flex items-center">
          <div className="animate-car-text-drive-rtl flex items-center gap-2 sm:gap-3">
            {/* Lead Forward-Facing Sleek Red SUV with Glowing Headlights Shining to the Left */}
            <div className="w-[125px] sm:w-[145px] h-[30px] sm:h-[34px] relative flex-shrink-0 flex items-center">
              <Image
                src="/red_car_left.svg"
                alt="Free Site Visit Red SUV with Forward Headlights"
                fill
                priority
                className="object-contain"
              />
            </div>
            {/* Trailing Wording Following the Lead Red SUV */}
            <span className="font-extrabold text-[#006452] text-xs sm:text-[14px] tracking-wide flex items-center gap-2 whitespace-nowrap">
              Click Here to Book Your Free Site Visit -- <span className="underline underline-offset-2 font-bold text-[#D61F69]">{COMPANY_PHONE}</span>
            </span>
          </div>
        </div>
      </div>

      <header
        className={`w-full bg-[#fef9e6] transition-all duration-300 border-b border-[#e4dab9] ${
          isScrolled
            ? 'shadow-md py-2.5 bg-[#fef9e6]/95 backdrop-blur-md'
            : 'py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo on Left */}
          <BrandLogo variant="light" />

          {/* Center Navigation Links (15px) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[15px] font-semibold tracking-normal transition-colors py-1 relative ${
                    isActive
                      ? 'text-[#D61F69] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#D61F69] after:rounded-full'
                      : 'text-gray-800 hover:text-[#D61F69]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Phone & Enquire Button */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-5">
            <a
              href={`tel:${COMPANY_PHONE_RAW}`}
              className="flex items-center gap-2 text-[15px] font-bold text-gray-800 hover:text-[#D61F69] transition"
            >
              <Phone className="w-4 h-4 text-[#D61F69]" />
              <span>{COMPANY_PHONE}</span>
            </a>

            <button
              onClick={() => setIsEnquiryOpen(true)}
              className="bg-[#D61F69] hover:bg-[#BE185D] text-white px-5 py-2.5 rounded-lg text-[14px] font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Enquire Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsEnquiryOpen(true)}
              className="bg-[#D61F69] text-white text-[11px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1"
            >
              <span>Enquire</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-[#D61F69]" />
              ) : (
                <Menu className="w-6 h-6 text-gray-800" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl px-4 pt-3 pb-6">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                      isActive
                        ? 'text-[#D61F69] bg-pink-50 font-extrabold'
                        : 'text-gray-700 hover:text-[#D61F69] hover:bg-gray-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
              <a
                href={`tel:${COMPANY_PHONE_RAW}`}
                className="flex items-center justify-center gap-2 bg-gray-50 text-gray-800 py-2.5 rounded-lg text-xs font-bold border border-gray-200"
              >
                <Phone className="w-3.5 h-3.5 text-[#D61F69]" />
                {COMPANY_PHONE}
              </a>
            </div>
          </div>
        )}
      </header>
    </div>

    {/* Header spacer to prevent content underneath fixed header */}
    <div className="h-[96px] sm:h-[105px] w-full" aria-hidden="true" />

    <EnquiryModal
      isOpen={isEnquiryOpen}
      onClose={() => setIsEnquiryOpen(false)}
      title="Enquire About Sree Hari Communities"
      subtitle="Connect with our team to find your perfect plot in a gated community."
    />
  </>
);
}
