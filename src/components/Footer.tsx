'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { COMPANY_PHONE, COMPANY_PHONE_RAW, COMPANY_EMAIL, COMPANY_ADDRESS } from '@/data/properties';
import BrandLogo from './BrandLogo';

export default function Footer() {
  return (
    <footer className="bg-[#fef9e6] text-gray-700 pt-14 pb-8 border-t border-amber-200/70 font-sans relative overflow-hidden text-[15px]">
      {/* Subtle Brand Watermark in Footer background */}
      <div className="absolute right-[-30px] bottom-[-30px] w-80 h-80 opacity-[0.06] pointer-events-none">
        <Image src="/lotus_icon.png" alt="" fill className="object-contain" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-amber-200/80">
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-3.5">
            <BrandLogo variant="light" />
            <p className="text-[15px] text-gray-600 leading-relaxed max-w-sm pt-1">
              Thoughtfully planned gated communities with premium plots, modern amenities and a brighter tomorrow.
            </p>

            <div className="flex items-center gap-2.5 pt-2">
              {/* Facebook */}
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white border border-amber-200 flex items-center justify-center text-gray-600 hover:text-[#D61F69] hover:border-[#D61F69] transition shadow-xs"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white border border-amber-200 flex items-center justify-center text-gray-600 hover:text-[#D61F69] hover:border-[#D61F69] transition shadow-xs"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white border border-amber-200 flex items-center justify-center text-gray-600 hover:text-[#D61F69] hover:border-[#D61F69] transition shadow-xs"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white border border-amber-200 flex items-center justify-center text-gray-600 hover:text-[#D61F69] hover:border-[#D61F69] transition shadow-xs"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.761-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links (Exact match to Header Navigation) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[15px] font-extrabold text-gray-950 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-[15px] text-gray-700">
              <li>
                <Link href="/" className="hover:text-[#D61F69] transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#D61F69] transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-[#D61F69] transition">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#D61F69] transition">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#D61F69] transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#D61F69] transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#D61F69] transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Projects */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[15px] font-extrabold text-gray-950 uppercase tracking-wider">
              Our Projects
            </h4>
            <ul className="space-y-2 text-[15px] text-gray-700">
              <li>
                <Link href="/properties" className="hover:text-[#D61F69] transition flex items-center justify-between">
                  <span>Park Avenue</span>
                  <span className="text-[10px] font-extrabold text-[#D61F69] bg-pink-50 px-1.5 py-0.5 rounded border border-pink-200">2026</span>
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-[#D61F69] transition flex items-center justify-between">
                  <span>Sri Amman Nagar</span>
                  <span className="text-[10px] font-bold text-gray-500">Trichy</span>
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-[#D61F69] transition flex items-center justify-between">
                  <span>Aishwarya Nagar</span>
                  <span className="text-[10px] font-bold text-gray-500">Thirumayam</span>
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-[#D61F69] font-bold transition flex items-center gap-1 text-[#D61F69] pt-1">
                  <span>View All Projects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[15px] font-extrabold text-gray-950 uppercase tracking-wider">
              Contact Us
            </h4>
            <ul className="space-y-2.5 text-[15px] text-gray-700">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D61F69] flex-shrink-0" />
                <a href={`tel:${COMPANY_PHONE_RAW}`} className="hover:text-[#D61F69] font-bold text-gray-900">
                  {COMPANY_PHONE}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D61F69] flex-shrink-0" />
                <a href={`mailto:${COMPANY_EMAIL}`} className="hover:text-[#D61F69] truncate">
                  {COMPANY_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D61F69] flex-shrink-0 mt-1" />
                <span className="leading-snug text-gray-800">
                  {COMPANY_ADDRESS}
                </span>
              </li>
            </ul>
          </div>

          {/* Mini Map Card */}
          <div className="lg:col-span-2">
            <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs space-y-2 text-center">
              <div className="w-9 h-9 rounded-full bg-pink-50 text-[#D61F69] flex items-center justify-center mx-auto">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-[15px] font-bold text-gray-900 block">
                Sree Hari Projects
              </span>
              <p className="text-[13px] text-gray-600 leading-snug">
                Prime growth corridors across Tamil Nadu
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[14px] text-gray-600 font-medium">
          <p>© 2026 Sree Hari Realty Promoters. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-[#D61F69]">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="#" className="hover:text-[#D61F69]">
              Terms & Conditions
            </Link>
          </div>
          <p className="text-gray-500">Designed for a Brighter Tomorrow</p>
        </div>
      </div>
    </footer>
  );
}
