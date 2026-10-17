'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroBanner } from '@/lib/types';

interface HeroCarouselProps {
  banners?: HeroBanner[];
  autoplayInterval?: number; // in seconds (5, 6, 7)
  onOpenEnquiry: (projectName?: string) => void;
}

function renderHeroTitle(title?: string) {
  const cleanTitle = (title || 'A Better Place to Build Your Future').trim();

  // Standard Sree Hari headline with signature pink text shine on second line
  if (cleanTitle.toLowerCase().includes('build your future')) {
    const parts = cleanTitle.split(/build your future/i);
    const before = parts[0] || 'A Better Place to ';
    return (
      <>
        {before.trim()} <br />
        <span className="animate-text-shine">Build Your Future</span>
      </>
    );
  }

  // If title has newline explicitly
  if (cleanTitle.includes('\n')) {
    const lines = cleanTitle.split('\n');
    return (
      <>
        {lines[0]} <br />
        <span className="animate-text-shine">{lines.slice(1).join(' ')}</span>
      </>
    );
  }

  // If 4 or more words, split smoothly into two lines and give the second line pink accent
  const words = cleanTitle.split(' ');
  if (words.length >= 4) {
    const splitAt = Math.ceil(words.length / 2);
    const line1 = words.slice(0, splitAt).join(' ');
    const line2 = words.slice(splitAt).join(' ');
    return (
      <>
        {line1} <br />
        <span className="animate-text-shine">{line2}</span>
      </>
    );
  }

  return <span>{cleanTitle}</span>;
}

export default function HeroCarousel({
  banners = [],
  autoplayInterval = 6,
  onOpenEnquiry,
}: HeroCarouselProps) {
  // Filter active banners and sort by order
  const activeBanners = (banners || [])
    .filter((b) => b.active)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const N = activeBanners.length;
  const hasMultiple = N > 1;

  // Infinite loop buffer: [Clone_Last, B0, B1, ..., BN-1, Clone_First]
  const slides = hasMultiple
    ? [activeBanners[N - 1], ...activeBanners, activeBanners[0]]
    : activeBanners;

  const [trackIndex, setTrackIndex] = useState(hasMultiple ? 1 : 0);
  const [enableTransition, setEnableTransition] = useState(true);
  const isTransitioningRef = useRef(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);


  const nextSlide = useCallback(() => {
    if (!hasMultiple || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setEnableTransition(true);
    setTrackIndex((prev) => prev + 1);
  }, [hasMultiple]);

  const prevSlide = useCallback(() => {
    if (!hasMultiple || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setEnableTransition(true);
    setTrackIndex((prev) => prev - 1);
  }, [hasMultiple]);

  // Handle seamless infinite loop jump on transition end
  const handleTransitionEnd = () => {
    isTransitioningRef.current = false;
    if (!hasMultiple) return;

    if (trackIndex >= N + 1) {
      // Reached cloned first slide at the end -> instantly reset to real first slide (index 1)
      setEnableTransition(false);
      setTrackIndex(1);
    } else if (trackIndex <= 0) {
      // Reached cloned last slide at the start -> instantly reset to real last slide (index N)
      setEnableTransition(false);
      setTrackIndex(N);
    }
  };

  // Re-enable transition smoothly after instant jump
  useEffect(() => {
    if (!enableTransition) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnableTransition(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [enableTransition]);

  // Autoplay timer - continuous forward loop every 5 to 7 seconds
  useEffect(() => {
    if (!hasMultiple) return;

    const intervalMs = Math.max(3, Math.min(10, autoplayInterval)) * 1000;
    const timer = setInterval(() => {
      nextSlide();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [hasMultiple, autoplayInterval, nextSlide]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 45) {
      nextSlide();
    } else if (distance < -45) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // =========================================================================
  // FALLBACK: When no active banners exist in CRM, render the original default hero
  // =========================================================================
  if (N === 0) {
    return (
      <section className="relative w-full overflow-hidden bg-transparent">
        <div className="relative w-full overflow-hidden block">
          <img
            src="/hero_gate_entrance.png"
            alt="Sree Hari Realty Promoters Gated Community Grand Entrance"
            className="w-full h-auto block select-none"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/35 sm:to-transparent pointer-events-none z-0" />

          <div className="absolute inset-0 z-10 w-full h-full flex items-center px-3 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 w-full flex items-center justify-start">
              <div className="max-w-full sm:max-w-xl lg:max-w-2xl text-left space-y-1 sm:space-y-3 lg:space-y-4">
                <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-md text-[8px] sm:text-[11px] font-bold tracking-widest text-amber-300 uppercase border border-amber-300/30 shadow-md">
                  <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>PREMIUM GATED COMMUNITY PLOTS</span>
                </div>

                <div className="space-y-0.5 sm:space-y-2">
                  <h1 className="text-sm sm:text-4xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-[1.15] drop-shadow-md">
                    A Better Place to <br />
                    <span className="animate-text-shine">Build Your Future</span>
                  </h1>
                  <p className="text-white/90 text-[10px] sm:text-[15px] font-medium max-w-xs sm:max-w-lg leading-snug sm:leading-relaxed line-clamp-1 sm:line-clamp-none drop-shadow-sm">
                    Thoughtfully planned plots. A greener community. A place to call your own with 100% DTCP & RERA approved peace of mind.
                  </p>
                </div>

                <div className="pt-0.5 sm:pt-2 flex items-center gap-2 sm:gap-3.5">
                  <Link
                    href="/properties"
                    className="bg-[#D61F69] hover:bg-[#BE185D] text-white px-2.5 sm:px-6 py-1 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    <span>Explore Plots</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => onOpenEnquiry()}
                    className="bg-white/95 hover:bg-white text-gray-950 px-2.5 sm:px-5 py-1 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all border border-white/40 shadow-sm hover:shadow-md flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D61F69]" />
                    <span>Book Site Visit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // CAROUSEL: SEAMLESS INFINITE LOOP (ZERO BLACK VOID, 100% NATURAL HEIGHT)
  // =========================================================================
  return (
    <section
      className="relative w-full overflow-hidden select-none bg-transparent"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Horizontal Sliding Track */}
      <div className="relative w-full overflow-hidden">
        <div
          onTransitionEnd={handleTransitionEnd}
          className={`flex w-full items-start will-change-transform ${
            enableTransition ? 'transition-transform duration-700 ease-in-out' : ''
          }`}
          style={{ transform: `translateX(-${trackIndex * 100}%)` }}
        >
          {slides.map((banner, idx) => {
            const isGraphic = banner.banner_type === 'graphic';

            // Button 1 (Primary)
            const b1Text = banner.button1_text || banner.button_text || 'Explore Plots';
            const b1Link = banner.button1_link || banner.button_link || '/properties';
            const b1IsEnquiry = !b1Link || b1Link === '#' || b1Link.toLowerCase() === 'enquiry';

            // Button 2 (Secondary / Optional)
            const showB2 = banner.button2_active !== false;
            const b2Text = banner.button2_text || 'Book Site Visit';
            const b2Link = banner.button2_link || 'enquiry';
            const b2IsEnquiry = !b2Link || b2Link === '#' || b2Link.toLowerCase() === 'enquiry';

            const handleFlyerClick = () => {
              if (banner.button1_link && !b1IsEnquiry) {
                window.location.href = banner.button1_link;
              } else {
                onOpenEnquiry(banner.project_name || banner.title);
              }
            };

            return (
              <div
                key={`${banner.id || idx}_${idx}`}
                className="w-full flex-shrink-0 relative overflow-hidden"
              >
                {isGraphic ? (
                  /* =========================================================
                     MODE A: GRAPHIC FLYER (Casagrand-Style Zero-Crop)
                     - Height is 100% natural to image - ZERO black space at bottom
                     ========================================================= */
                  <div
                    onClick={handleFlyerClick}
                    className="w-full cursor-pointer relative block"
                  >
                    <img
                      src={banner.image_url}
                      alt={banner.title || 'Sree Hari Realty Showcase'}
                      className="w-full h-auto block select-none"
                      loading="eager"
                    />
                  </div>
                ) : (
                  /* =========================================================
                     MODE B: PHOTO + DYNAMIC TEXT (NATURAL IMAGE HEIGHT)
                     - The image in normal flow defines 100% of the slide height
                     - Text overlay sits in absolute inset-0 - ZERO black void
                     ========================================================= */
                  <div className="relative w-full overflow-hidden block">
                    {/* Background Photo defining natural container height on all devices */}
                    <img
                      src={banner.image_url}
                      alt={banner.title || 'Sree Hari Realty'}
                      className="w-full h-auto block select-none"
                      loading="eager"
                    />

                    {/* Gradient overlay strictly contained within image bounds */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/40 sm:to-transparent pointer-events-none z-0" />

                    {/* Left-Aligned Text Content inside absolute inset-0 */}
                    <div className="absolute inset-0 z-10 w-full h-full flex items-center px-3 sm:px-6 lg:px-8">
                      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 w-full flex items-center justify-start">
                        <div className="max-w-full sm:max-w-xl lg:max-w-2xl text-left space-y-1 sm:space-y-3 lg:space-y-4">
                          {banner.badge_text && (
                            <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-md text-[8px] sm:text-[11px] font-bold tracking-widest text-amber-300 uppercase border border-amber-300/30 shadow-md">
                              <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              <span>{banner.badge_text}</span>
                            </div>
                          )}

                          <div className="space-y-0.5 sm:space-y-2">
                            <h1 className="text-sm sm:text-4xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-[1.15] drop-shadow-md">
                              {renderHeroTitle(banner.title)}
                            </h1>
                            {banner.subtitle && (
                              <p className="text-white/90 text-[10px] sm:text-[15px] font-medium max-w-xs sm:max-w-lg leading-snug sm:leading-relaxed line-clamp-1 sm:line-clamp-none drop-shadow-sm">
                                {banner.subtitle}
                              </p>
                            )}
                          </div>

                          <div className="pt-0.5 sm:pt-2 flex items-center gap-2 sm:gap-3.5">
                            {b1Text && (
                              b1IsEnquiry ? (
                                <button
                                  type="button"
                                  onClick={() => onOpenEnquiry(banner.project_name || banner.title)}
                                  className="bg-[#D61F69] hover:bg-[#BE185D] text-white px-2.5 sm:px-6 py-1 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:-translate-y-0.5 whitespace-nowrap"
                                >
                                  <span>{b1Text}</span>
                                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                </button>
                              ) : (
                                <Link
                                  href={b1Link}
                                  className="bg-[#D61F69] hover:bg-[#BE185D] text-white px-2.5 sm:px-6 py-1 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:-translate-y-0.5 whitespace-nowrap"
                                >
                                  <span>{b1Text}</span>
                                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                </Link>
                              )
                            )}

                            {showB2 && b2Text && (
                              b2IsEnquiry ? (
                                <button
                                  type="button"
                                  onClick={() => onOpenEnquiry(banner.project_name || banner.title)}
                                  className="bg-white/95 hover:bg-white text-gray-950 px-2.5 sm:px-5 py-1 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all border border-white/40 shadow-sm hover:shadow-md flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:-translate-y-0.5 whitespace-nowrap"
                                >
                                  <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D61F69]" />
                                  <span>{b2Text}</span>
                                </button>
                              ) : (
                                <Link
                                  href={b2Link}
                                  className="bg-white/95 hover:bg-white text-gray-950 px-2.5 sm:px-5 py-1 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all border border-white/40 shadow-sm hover:shadow-md flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:-translate-y-0.5 whitespace-nowrap"
                                >
                                  <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D61F69]" />
                                  <span>{b2Text}</span>
                                </Link>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous Slide"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all opacity-70 hover:opacity-100 shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next Slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all opacity-70 hover:opacity-100 shadow-lg cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        </>
      )}
    </section>
  );
}
