'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { COMPANY_PHONE, COMPANY_PHONE_RAW, COMPANY_EMAIL, COMPANY_ADDRESS, COMPANY_WHATSAPP } from '@/data/properties';
import BrandLogo from './BrandLogo';
import { api } from '@/lib/api';

export default function Footer() {
  const [workingHours, setWorkingHours] = useState('Mon - Sat: 9:00 AM - 7:00 PM');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.getPublicSettings();
        if (res?.data?.working_hours) {
          setWorkingHours(res.data.working_hours);
        }
      } catch {}
    }
    loadSettings();
  }, []);
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
            <p className="text-[14px] text-gray-700 leading-relaxed max-w-sm pt-1">
              <strong>Sree Hari Realty Promoters</strong> is a premier land promoter and plotted township developer with a trusted 36-year legacy in Trichy. We deliver 100% DTCP & TNRERA approved gated community residential plots with transparent titles, prime highway connectivity, and masterplanned infrastructure built for a brighter tomorrow.
            </p>

            <div className="pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-200/90 shadow-2xs text-xs font-bold text-[#006452]">
                <ShieldCheck className="w-4 h-4 text-[#006452] shrink-0" />
                <span>DTCP & RERA Approved Layouts</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              {/* Facebook (#1877F2) */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xs hover:shadow-md hover:scale-110 transition-all duration-200 cursor-pointer"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Instagram (Sunset Gradient: #f09433 -> #dc2743 -> #bc1888) */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-xs hover:shadow-md hover:scale-110 transition-all duration-200 cursor-pointer"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* YouTube (#FF0000) */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-xs hover:shadow-md hover:scale-110 transition-all duration-200 cursor-pointer"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* LinkedIn (#0A66C2) */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#0A66C2] text-white flex items-center justify-center shadow-xs hover:shadow-md hover:scale-110 transition-all duration-200 cursor-pointer"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.761-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* WhatsApp (#25D366) */}
              <a
                href={`https://wa.me/${COMPANY_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs hover:shadow-md hover:scale-110 transition-all duration-200 cursor-pointer"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[15px] font-black text-[#006452] uppercase tracking-wider flex items-center gap-1.5">
              <span>Quick Links</span>
            </h4>
            <ul className="space-y-2 text-[15px] text-gray-700">
              <li>
                <Link href="/" className="hover:text-[#D61F69] hover:translate-x-0.5 inline-block transition duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#D61F69] hover:translate-x-0.5 inline-block transition duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-[#D61F69] hover:translate-x-0.5 inline-block transition duration-200">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#D61F69] hover:translate-x-0.5 inline-block transition duration-200">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#D61F69] hover:translate-x-0.5 inline-block transition duration-200">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#D61F69] hover:translate-x-0.5 inline-block transition duration-200">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#D61F69] hover:translate-x-0.5 inline-block transition duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Projects */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[15px] font-black text-[#006452] uppercase tracking-wider flex items-center gap-1.5">
              <span>Our Projects</span>
            </h4>
            <ul className="space-y-2 text-[15px] text-gray-700">
              <li>
                <Link href="/properties" className="hover:text-[#D61F69] transition flex items-center justify-between group">
                  <span className="group-hover:translate-x-0.5 transition duration-200">Park Avenue</span>
                  <span className="text-[10px] font-extrabold text-[#D61F69] bg-pink-50 px-1.5 py-0.5 rounded border border-pink-200">2026</span>
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-[#D61F69] transition flex items-center justify-between group">
                  <span className="group-hover:translate-x-0.5 transition duration-200">Sri Amman Nagar</span>
                  <span className="text-[10px] font-bold text-gray-500">Trichy</span>
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-[#D61F69] transition flex items-center justify-between group">
                  <span className="group-hover:translate-x-0.5 transition duration-200">Aishwarya Nagar</span>
                  <span className="text-[10px] font-bold text-gray-500">Thirumayam</span>
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-[#D61F69] font-bold transition flex items-center gap-1 text-[#D61F69] pt-1 group">
                  <span className="group-hover:translate-x-0.5 transition duration-200">View All Projects</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[15px] font-black text-[#006452] uppercase tracking-wider flex items-center gap-1.5">
              <span>Contact Us</span>
            </h4>
            <ul className="space-y-2.5 text-[15px] text-gray-700">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D61F69] flex-shrink-0" />
                <a href={`tel:${COMPANY_PHONE_RAW}`} className="hover:text-[#D61F69] font-bold text-gray-900 transition duration-200">
                  {COMPANY_PHONE}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D61F69] flex-shrink-0" />
                <a href={`mailto:${COMPANY_EMAIL}`} className="hover:text-[#D61F69] truncate transition duration-200">
                  {COMPANY_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D61F69] flex-shrink-0 mt-1" />
                <span className="leading-snug text-gray-800">
                  {COMPANY_ADDRESS}
                </span>
              </li>
              <li className="flex items-start gap-2 pt-1 border-t border-amber-200/60">
                <Clock className="w-4 h-4 text-[#D61F69] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-[#006452] uppercase font-bold tracking-wider block">
                    Working Hours
                  </span>
                  <span className="leading-snug text-gray-900 font-semibold text-xs sm:text-sm">
                    {workingHours}
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Project Hub Card (Subtle Warm Cream Gradient matching Project Cards) */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-b from-white via-[#fdfbf6] to-[#faf3e2] p-4 rounded-2xl border border-amber-200/90 shadow-xs hover:shadow-md transition-all duration-300 text-center relative overflow-hidden group">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#006452] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300 border border-emerald-100">
                <MapPin className="w-4 h-4 text-[#006452]" />
              </div>
              <span className="text-[14px] font-black text-[#006452] block">
                Sree Hari Projects
              </span>
              <p className="text-[12px] text-gray-600 leading-snug mt-1 mb-3">
                Prime growth corridors across Tamil Nadu
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-1.5 w-full bg-[#f7db49] hover:bg-[#ebd03b] text-gray-950 text-xs font-black py-2 px-3 rounded-full shadow-2xs transition-all duration-200 transform hover:scale-[1.02]"
              >
                <span>Book Site Visit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[14px] text-gray-600 font-medium">
          <p>© 2026 Sree Hari Realty Promoters. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-[#D61F69] transition">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="#" className="hover:text-[#D61F69] transition">
              Terms & Conditions
            </Link>
          </div>
          <p className="text-gray-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Designed for a Brighter Tomorrow
          </p>
        </div>
      </div>
    </footer>
  );
}
