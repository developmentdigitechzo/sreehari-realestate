'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { faqs, FAQItem } from '@/data/faqs';
import { ChevronDown, ChevronUp, HelpCircle, ShieldCheck, Phone, MessageSquare } from 'lucide-react';
import { COMPANY_PHONE, COMPANY_PHONE_RAW, COMPANY_WHATSAPP } from '@/data/properties';
import EnquiryModal from '@/components/EnquiryModal';

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const categories = [
    'All',
    'Legal & Approvals',
    'Booking & Registration',
    'Bank Loans',
    'Infrastructure & Amenities',
  ];

  const filteredFaqs =
    activeCategory === 'All'
      ? faqs
      : faqs.filter((f) => f.category === activeCategory);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Page Header WITH HD PANORAMIC BACKGROUND & CINEMATIC GRADIENT */}
      <section className="relative min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] flex items-center overflow-hidden bg-gray-950 border-b border-amber-900/30">
        {/* Exact HD Panoramic Background Image */}
        <Image
          src="/hero_faq_new.jpg"
          alt="Sree Hari Realty Promoters Legal Clarity & Guidance"
          fill
          priority
          quality={95}
          className="object-cover object-[center_60%] sm:object-center"
        />

        {/* Balanced Cinematic Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/35 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10 w-full">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-bold tracking-widest text-amber-300 uppercase border border-amber-300/30 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D61F69] animate-pulse" />
              <span>CLEAR & TRANSPARENT ANSWERS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-md font-serif-title">
              Frequently Asked <span className="text-[#D61F69] drop-shadow-[0_2px_12px_rgba(214,31,105,0.4)]">Questions</span>
            </h1>

            <p className="text-white/90 text-xs sm:text-[15px] font-medium leading-relaxed max-w-xl drop-shadow-sm">
              Find detailed guidance on DTCP & RERA guidelines, legal parent documents, patta transfer procedures, 80% bank loan sanctioning, and township amenities.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Category Filter & Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setOpenIndex(null);
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition uppercase tracking-wider cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#006452] text-white shadow-md'
                  : 'bg-gradient-to-b from-white via-white to-[#fffdf5] text-gray-700 hover:border-amber-300 border border-amber-100/90 shadow-2xs'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-2xl border border-amber-100/90 overflow-hidden shadow-2xs transition-all duration-300 hover:border-emerald-300/80 hover:shadow-md"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-amber-50/40 transition cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading-sc text-sm sm:text-base font-bold text-[#006452]">
                    {faq.question}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-[#006452] flex items-center justify-center flex-shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-700 leading-relaxed border-t border-amber-100/80 bg-[#fffdfa]/80">
                    <p>{faq.answer}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-[#006452] uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Category: {faq.category}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Direct Support Callout */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#006452] text-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl border border-emerald-800">
          <span className="accent-text text-xl text-amber-300">Have More Specific Queries?</span>
          <h2 className="font-heading-sc text-xl sm:text-2xl font-extrabold text-white">
            Speak Directly with Our Legal & Property Advisory Desk
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto">
            Get personalized assistance with blueprint verification, loan pre-clearance, and family site visit arrangements.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <a
              href={`https://wa.me/${COMPANY_WHATSAPP}?text=Hi%20Sree%20Hari%20Realty%2C%20I%20have%20a%20few%20questions%20regarding%20plot%20purchase.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3.5 rounded-full font-extrabold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask on WhatsApp</span>
            </a>

            <a
              href={`tel:${COMPANY_PHONE_RAW}`}
              className="bg-[#f7db49] hover:bg-[#f6d73c] text-[#006452] px-6 py-3.5 rounded-full font-extrabold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5"
            >
              <Phone className="w-4 h-4 text-[#006452]" />
              <span>Call: {COMPANY_PHONE}</span>
            </a>
          </div>
        </div>
      </section>

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        title="Ask a Property Question"
      />
    </div>
  );
}
