'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, CheckCircle2, MessageSquare, Phone, Send, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import EnquiryModal from '@/components/EnquiryModal';

import { usePathname } from 'next/navigation';

export interface PromotionalPopupData {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  badge_tag?: string;
  banner_image?: string;
  highlights?: string;
  cta_text?: string;
  cta_action?: 'whatsapp' | 'lead_form' | 'call' | string;
  whatsapp_number?: string;
  start_date?: string | null;
  end_date?: string | null;
  layout_style?: string;
  display_delay?: string;
  show_frequency?: string;
  status: 'Active' | 'Inactive';
}

const DEFAULT_POPUP_IMAGE =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80';

export default function PromotionalPopupModal() {
  const pathname = usePathname();
  const [activePopup, setActivePopup] = useState<PromotionalPopupData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [leadFormTitle, setLeadFormTitle] = useState('');

  useEffect(() => {
    // Don't show promotional popups inside admin CRM pages
    if (pathname?.startsWith('/admin')) {
      setIsOpen(false);
      return;
    }

    let timer: NodeJS.Timeout | null = null;

    async function checkAndLoadPopup() {
      try {
        const res = await api.getPublicPopups();
        if (!res || !res.success || !Array.isArray(res.data) || res.data.length === 0) {
          return;
        }

        // Find the active popup
        const activeList = res.data.filter(
          (p: PromotionalPopupData) => (p.status || 'Active') === 'Active'
        );

        if (activeList.length === 0) return;
        const popup = activeList[0];

        // Frequency check
        const freq = popup.show_frequency || 'Once per Session';
        if (freq === 'Once per Session') {
          const seen = sessionStorage.getItem(`sreehari_popup_${popup.id}`);
          if (seen) return;
        } else if (freq === 'Once per Day') {
          const lastSeen = localStorage.getItem(`sreehari_popup_day_${popup.id}`);
          const today = new Date().toDateString();
          if (lastSeen === today) return;
        }

        // Calculate responsive delay in milliseconds
        let delayMs = 1200;
        const delayStr = popup.display_delay || '3s (Default)';
        if (delayStr.includes('0s') || delayStr.toLowerCase().includes('immediate')) {
          delayMs = 200;
        } else if (delayStr.includes('5s')) {
          delayMs = 3500;
        } else if (delayStr.includes('10s')) {
          delayMs = 7000;
        } else if (delayStr.includes('3s')) {
          delayMs = 1500;
        }

        setActivePopup(popup);

        timer = setTimeout(() => {
          setIsOpen(true);
        }, delayMs);
      } catch (err) {
        // Silently ignore network error
      }
    }

    checkAndLoadPopup();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pathname]);

  const handleDismiss = () => {
    if (activePopup) {
      try {
        const freq = activePopup.show_frequency || 'Once per Session';
        if (freq === 'Once per Session') {
          sessionStorage.setItem(`sreehari_popup_${activePopup.id}`, '1');
        } else if (freq === 'Once per Day') {
          localStorage.setItem(`sreehari_popup_day_${activePopup.id}`, new Date().toDateString());
        }
      } catch {}
    }
    setIsOpen(false);
  };

  const handleCtaAction = () => {
    if (!activePopup) return;

    const action = activePopup.cta_action || 'whatsapp';
    const rawPhone = (activePopup.whatsapp_number || '+91 98424 01991').replace(/\D/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    handleDismiss();

    if (action === 'lead_form') {
      setLeadFormTitle(`Special Offer: ${activePopup.title}`);
      setIsLeadFormOpen(true);
    } else if (action === 'call') {
      window.location.href = `tel:${cleanPhone}`;
    } else {
      // Default: WhatsApp Direct Chat
      const message = encodeURIComponent(
        `Hi Sree Hari Realty Promoters, I would like to enquire about your promotional offer: "${activePopup.title}". Please share pricing and layout blueprint.`
      );
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    }
  };

  if (!isOpen && !isLeadFormOpen) return null;

  const highlightsList = (activePopup?.highlights || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const bannerImg =
    activePopup?.banner_image && activePopup.banner_image.trim() !== ''
      ? activePopup.banner_image
      : DEFAULT_POPUP_IMAGE;

  const isFullPoster = activePopup?.layout_style === 'Full Poster Card';
  const isTopBanner = activePopup?.layout_style === 'Top Banner + Content Card';
  const isSideBySide = !isFullPoster && !isTopBanner; // Default 'Auto Detect'

  const renderCtaIcon = () => {
    if (activePopup?.cta_action === 'lead_form') return <Send className="w-4 h-4 shrink-0" />;
    if (activePopup?.cta_action === 'call') return <Phone className="w-4 h-4 shrink-0" />;
    return <MessageSquare className="w-4 h-4 shrink-0" />;
  };

  return (
    <>
      {isOpen && activePopup && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in transition-all"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleDismiss();
          }}
        >
          {/* ========================================================= */}
          {/* 1. FULL POSTER CARD LAYOUT                                 */}
          {/* ========================================================= */}
          {isFullPoster && (
            <div className="relative w-full max-w-md bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-amber-300/30 animate-scale-up group">
              {/* Close Button Top Right */}
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Close offer popup"
                className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-transform hover:scale-105 cursor-pointer shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Badge Tag Top Left */}
              <div className="absolute top-3.5 left-3.5 z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#D61F69] to-pink-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-lg border border-pink-300/30">
                  <Sparkles className="w-3 h-3" />
                  {activePopup.badge_tag || 'FESTIVE OFFER'}
                </span>
              </div>

              {/* Full Height Poster Image */}
              <div className="relative w-full h-[460px] sm:h-[520px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bannerImg}
                  alt={activePopup.title}
                  className="w-full h-full object-cover"
                />

                {/* Dark Gradient Overlay for bottom text readibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent flex flex-col justify-end p-6 z-10 space-y-3.5">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                      {activePopup.category || 'Special Promotion'}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight font-serif drop-shadow-md">
                      {activePopup.title}
                    </h3>
                    {activePopup.subtitle && (
                      <p className="text-xs sm:text-sm text-white/90 line-clamp-2 leading-relaxed">
                        {activePopup.subtitle}
                      </p>
                    )}
                  </div>

                  {highlightsList.length > 0 && (
                    <div className="space-y-1.5 py-1">
                      {highlightsList.slice(0, 3).map((hl, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-white/95 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{hl}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    type="button"
                    onClick={handleCtaAction}
                    className="w-full py-3.5 px-5 bg-gradient-to-r from-[#D61F69] via-pink-600 to-[#006452] hover:opacity-95 text-white font-extrabold text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 border border-white/20 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    {renderCtaIcon()}
                    <span>{activePopup.cta_text || 'Claim Festive Offer'}</span>
                  </button>

                  <div className="text-center pt-0.5">
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="text-[11px] text-white/70 hover:text-white underline cursor-pointer"
                    >
                      No thanks, remind me later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. TOP BANNER + CONTENT CARD LAYOUT                        */}
          {/* ========================================================= */}
          {isTopBanner && (
            <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-amber-200 animate-scale-up group">
              {/* Close Button Top Right */}
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Close offer popup"
                className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-transform hover:scale-105 cursor-pointer shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Banner Header Image */}
              <div className="relative w-full h-52 sm:h-60 bg-gray-900 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bannerImg}
                  alt={activePopup.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                {/* Badge Tag */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006452] text-emerald-200 text-[11px] font-extrabold uppercase tracking-wider shadow-md border border-emerald-400/30">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    {activePopup.badge_tag || 'FESTIVE OFFER'}
                  </span>
                </div>
              </div>

              {/* Content Card Body */}
              <div className="p-6 sm:p-7 space-y-4 text-gray-900 bg-[#fef9e6]/50">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#D61F69] uppercase tracking-wider block">
                    {activePopup.category || 'Special Opportunity'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-gray-950 leading-snug font-serif">
                    {activePopup.title}
                  </h3>
                  {activePopup.subtitle && (
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {activePopup.subtitle}
                    </p>
                  )}
                </div>

                {highlightsList.length > 0 && (
                  <div className="space-y-2 py-1 border-t border-amber-200/60 pt-3">
                    {highlightsList.map((hl, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-800 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#006452] shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA Button */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleCtaAction}
                    className="w-full py-3.5 px-5 bg-[#006452] hover:bg-[#004f41] text-white font-bold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all hover:shadow-emerald-900/20 hover:-translate-y-0.5 cursor-pointer"
                  >
                    {renderCtaIcon()}
                    <span>{activePopup.cta_text || 'Claim Festive Offer'}</span>
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="text-[11px] text-gray-500 hover:text-gray-800 transition cursor-pointer"
                    >
                      Remind me later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. SIDE-BY-SIDE SPLIT LAYOUT (Auto Detect Default)         */}
          {/* ========================================================= */}
          {isSideBySide && (
            <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-amber-200/90 animate-scale-up grid grid-cols-1 md:grid-cols-12 group">
              {/* Close Button Top Right */}
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Close offer popup"
                className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-transform hover:scale-105 cursor-pointer shadow-md"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left Column: Vertical Poster Image */}
              <div className="md:col-span-5 relative h-52 md:h-auto min-h-[220px] md:min-h-[420px] bg-gray-950 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bannerImg}
                  alt={activePopup.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Badge Tag */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D61F69] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md border border-pink-300/30">
                    <Sparkles className="w-3 h-3" />
                    {activePopup.badge_tag || 'FESTIVE OFFER'}
                  </span>
                </div>
              </div>

              {/* Right Column: Detailed Content Area */}
              <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-[#fef9e6]/60">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[#006452] uppercase tracking-wider block">
                      {activePopup.category || 'Festival Deals & Plots'}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950 leading-tight font-serif">
                      {activePopup.title}
                    </h3>
                    {activePopup.subtitle && (
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                        {activePopup.subtitle}
                      </p>
                    )}
                  </div>

                  {highlightsList.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-amber-200/80">
                      {highlightsList.map((hl, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-[#006452] shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CTA Action Area */}
                <div className="pt-3 space-y-2.5 border-t border-amber-200/80">
                  <button
                    type="button"
                    onClick={handleCtaAction}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-[#006452] to-[#004f41] hover:from-[#005243] hover:to-[#004135] text-white font-extrabold text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 cursor-pointer border border-emerald-700"
                  >
                    {renderCtaIcon()}
                    <span>{activePopup.cta_text || 'Claim Festive Offer'}</span>
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="text-xs text-gray-500 hover:text-gray-900 transition underline cursor-pointer"
                    >
                      Remind me later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Embedded Enquiry / Lead Modal triggered if cta_action === 'lead_form' */}
      <EnquiryModal
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        title={leadFormTitle || 'Special Offer Site Visit Booking'}
        subtitle="Fill in your details below to lock in the special promotional offer and book a guided plot tour."
      />
    </>
  );
}
