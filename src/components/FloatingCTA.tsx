'use client';

import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { COMPANY_PHONE_RAW, COMPANY_WHATSAPP } from '@/data/properties';

export default function FloatingCTA() {
  return (
    <>
      {/* Desktop Floating WhatsApp Badge */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:flex flex-col gap-3">
        <a
          href={`https://wa.me/${COMPANY_WHATSAPP}?text=Hi%20Sree%20Hari%20Realty%2C%20I%20am%20interested%20in%20your%20gated%20community%20plots.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-1 font-semibold text-xs border-2 border-white group"
          aria-label="Chat on WhatsApp"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <span className="tracking-wide">Chat on WhatsApp</span>
        </a>
      </div>

      {/* Mobile Bottom Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-2xl px-3 py-2 flex items-center gap-2">
        <a
          href={`tel:${COMPANY_PHONE_RAW}`}
          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 text-[#075E43] py-2.5 rounded-lg font-bold text-xs border border-emerald-300 active:bg-emerald-100"
        >
          <Phone className="w-4 h-4 text-[#075E43]" />
          <span>Call Now</span>
        </a>

        <a
          href={`https://wa.me/${COMPANY_WHATSAPP}?text=Hi%20Sree%20Hari%20Realty%2C%20I%20am%20interested%20in%20your%20gated%20community%20plots.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#075E43] text-white py-2.5 rounded-lg font-bold text-xs shadow-md active:bg-[#04432F]"
        >
          <MessageSquare className="w-4 h-4 text-[#C5A869]" />
          <span>WhatsApp Plot Enquiry</span>
        </a>
      </div>
    </>
  );
}
