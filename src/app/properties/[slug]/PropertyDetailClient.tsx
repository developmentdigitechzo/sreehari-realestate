'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Property,
  COMPANY_PHONE,
  COMPANY_PHONE_RAW,
  COMPANY_WHATSAPP,
} from '@/data/properties';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Phone,
  MessageSquare,
  CheckCircle2,
  Trees,
  Sun,
  Droplets,
  Milestone,
  Fence,
  Sparkles,
  Zap,
  Award,
  ArrowLeft,
  Send,
  CheckCircle,
} from 'lucide-react';
import EnquiryModal from '@/components/EnquiryModal';

export default function PropertyDetailClient({ property }: { property: Property }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryType, setEnquiryType] = useState('visit');

  const [inlineForm, setInlineForm] = useState({
    name: '',
    phone: '',
    email: '',
    preferredVariant: property.plotVariants[0]?.dimension || '',
    visitDate: '',
    message: '',
  });
  const [inlineSubmitted, setInlineSubmitted] = useState(false);
  const [inlineLoading, setInlineLoading] = useState(false);

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInlineLoading(true);

    const newLead = {
      ...inlineForm,
      propertyName: property.title,
      timestamp: new Date().toISOString(),
      id: 'LEAD-' + Date.now(),
    };

    try {
      const existingLeads = JSON.parse(localStorage.getItem('sree_hari_leads') || '[]');
      existingLeads.unshift(newLead);
      localStorage.setItem('sree_hari_leads', JSON.stringify(existingLeads));
    } catch {
      // ignore storage error
    }

    setTimeout(() => {
      setInlineLoading(false);
      setInlineSubmitted(true);
    }, 600);
  };

  const iconMap: Record<string, React.ReactNode> = {
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-[#075E43]" />,
    Milestone: <Milestone className="w-5 h-5 text-[#075E43]" />,
    Trees: <Trees className="w-5 h-5 text-[#075E43]" />,
    Sun: <Sun className="w-5 h-5 text-[#075E43]" />,
    Droplets: <Droplets className="w-5 h-5 text-[#075E43]" />,
    Fence: <Fence className="w-5 h-5 text-[#075E43]" />,
    Sparkles: <Sparkles className="w-5 h-5 text-[#075E43]" />,
    Zap: <Zap className="w-5 h-5 text-[#075E43]" />,
    Award: <Award className="w-5 h-5 text-[#075E43]" />,
  };

  const whatsappMessage = encodeURIComponent(
    `Hi Sree Hari Realty, I am interested in ${property.title} (${property.location}). Please send me the master layout plan and plot availability chart.`
  );

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Project Title & Quick Stats Banner */}
      <section className="bg-[#fef9e6] border-b border-gray-200/70 py-6 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Back to All Properties Button */}
          <div>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#075E43] hover:text-[#D61F69] bg-white px-4 py-1.5 rounded-full border border-emerald-200/90 shadow-2xs transition group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>← Back to All Properties</span>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#075E43] text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {property.status}
                </span>
                <span className="bg-emerald-100 text-[#075E43] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {property.dtcpNumber}
                </span>
                <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                  RERA: {property.reraNumber}
                </span>
              </div>

              <h1 className="bold-text text-2xl sm:text-4xl text-[#04432F]">
                {property.title}
              </h1>

              <p className="text-gray-600 text-xs sm:text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#075E43]" />
                {property.location}
              </p>
            </div>

            {/* Price Box */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-emerald-100 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
                  Price Per Sq.Ft
                </span>
                <span className="font-heading-sc text-2xl font-black text-[#075E43]">
                  ₹{property.pricePerSqFt.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-gray-500">/ sq.ft</span>
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-gray-500 block">Total Range</span>
                <span className="text-xs font-bold text-gray-800">{property.totalPriceRange}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Gallery & Interactive Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Gallery & Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Image Showcase */}
            <div className="space-y-3">
              <div className="relative h-[320px] sm:h-[420px] rounded-2xl overflow-hidden shadow-md bg-gray-100">
                <Image
                  src={property.images[activeImageIndex] || property.heroImage}
                  alt={property.title}
                  fill
                  priority
                  className="object-cover transition-all duration-300"
                />
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs">
                  Layout Photo {activeImageIndex + 1} of {property.images.length}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-2">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-20 rounded-xl overflow-hidden border-2 transition ${
                      activeImageIndex === idx
                        ? 'border-[#075E43] shadow-md scale-[1.02]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="border-r border-gray-100 last:border-0">
                <span className="text-[10px] text-gray-500 uppercase font-semibold block">
                  Plot Sizes
                </span>
                <span className="font-heading-sc text-sm font-bold text-gray-900 mt-0.5 block">
                  {property.plotSizes}
                </span>
              </div>
              <div className="border-r border-gray-100 last:border-0">
                <span className="text-[10px] text-gray-500 uppercase font-semibold block">
                  Available Units
                </span>
                <span className="font-heading-sc text-sm font-bold text-emerald-700 mt-0.5 block">
                  {property.availableUnits > 0
                    ? `${property.availableUnits} of ${property.totalPlots} Left`
                    : `100% Sold Out (${property.totalPlots} Plots Delivered)`}
                </span>
              </div>
              <div className="border-r border-gray-100 last:border-0">
                <span className="text-[10px] text-gray-500 uppercase font-semibold block">
                  Approval
                </span>
                <span className="font-heading-sc text-sm font-bold text-gray-900 mt-0.5 block">
                  DTCP & RERA
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold block">
                  Possession
                </span>
                <span className="font-heading-sc text-sm font-bold text-gray-900 mt-0.5 block">
                  Immediate
                </span>
              </div>
            </div>

            {/* About Layout Description */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 space-y-4">
              <h2 className="font-heading-sc text-xl font-bold text-gray-900">
                About {property.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {property.description}
              </p>

              <div className="pt-4 border-t border-gray-100 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  Key Layout Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {property.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-[#075E43] flex-shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gated Infrastructure & Amenities */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 space-y-6">
              <div>
                <span className="text-xs font-bold text-[#075E43] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-md">
                  Delivered Civil Infrastructure
                </span>
                <h2 className="font-heading-sc text-xl font-bold text-gray-900 mt-2">
                  Gated Township Amenities
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.amenities.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-100/80 flex items-center justify-center flex-shrink-0">
                      {iconMap[item.icon] || <ShieldCheck className="w-5 h-5 text-[#075E43]" />}
                    </div>
                    <div>
                      <h4 className="font-heading-sc text-xs font-bold text-gray-900">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plot Variations & Pricing Breakdown */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 space-y-6">
              <div>
                <span className="text-xs font-bold text-[#075E43] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-md">
                  Plot Inventory
                </span>
                <h2 className="font-heading-sc text-xl font-bold text-gray-900 mt-2">
                  Available Plot Dimensions & Pricing
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-emerald-50/80 text-[#075E43] border-b border-emerald-100">
                      <th className="p-3 font-bold uppercase tracking-wider">Dimension</th>
                      <th className="p-3 font-bold uppercase tracking-wider">Total Area</th>
                      <th className="p-3 font-bold uppercase tracking-wider">Facing</th>
                      <th className="p-3 font-bold uppercase tracking-wider">Approx. Price</th>
                      <th className="p-3 font-bold uppercase tracking-wider">Status</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {property.plotVariants.map((variant, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80 transition">
                        <td className="p-3 font-bold text-gray-900">{variant.dimension}</td>
                        <td className="p-3 text-gray-700 font-semibold">{variant.sqft} Sq.Ft</td>
                        <td className="p-3 text-gray-600">{variant.facing}</td>
                        <td className="p-3 font-bold text-[#075E43]">{variant.approxPrice}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              variant.status === 'Available'
                                ? 'bg-emerald-100 text-emerald-800'
                                : variant.status === 'Few Left'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {variant.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setEnquiryType(`Plot ${variant.dimension} (${variant.sqft} sqft)`);
                              setIsEnquiryOpen(true);
                            }}
                            className={`${
                              variant.status === 'Sold Out'
                                ? 'bg-stone-500 hover:bg-stone-600'
                                : 'bg-[#075E43] hover:bg-[#04432F]'
                            } text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition`}
                          >
                            {variant.status === 'Sold Out' ? 'Waitlist' : 'Enquire'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Location Connectivity & Advantages */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 space-y-4">
              <h2 className="font-heading-sc text-xl font-bold text-gray-900">
                Location Advantages & Connectivity
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.locationAdvantages.map((loc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                  >
                    <span className="font-semibold text-gray-800">{loc.landmark}</span>
                    <span className="font-bold text-[#075E43] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {loc.distance} ({loc.time})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sticky Action Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-emerald-100 space-y-6">
              <div className="space-y-1 text-center pb-4 border-b border-gray-100">
                <span className="accent-text text-lg text-[#075E43]">Schedule Your Free Visit</span>
                <h3 className="font-heading-sc text-xl font-bold text-gray-900">
                  Book Site Inspection
                </h3>
                <p className="text-[11px] text-gray-500">
                  Complimentary pickup and drop provided for you & your family.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setIsEnquiryOpen(true)}
                  className="w-full bg-[#075E43] hover:bg-[#04432F] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md"
                >
                  <Calendar className="w-4 h-4 text-[#C5A869]" />
                  Book Free Site Visit
                </button>

                <a
                  href={`https://wa.me/${COMPANY_WHATSAPP}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat on WhatsApp
                </a>

                <a
                  href={`tel:${COMPANY_PHONE_RAW}`}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-[#075E43] border border-emerald-300 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call: {COMPANY_PHONE}
                </a>
              </div>

              {/* Bank Loan Tie-ups Badge */}
              <div className="bg-[#fef9e6] p-4 rounded-xl border border-amber-200/60 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase">
                  <ShieldCheck className="w-4 h-4 text-[#075E43]" />
                  <span>Up to 80% Bank Loan Approved</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Pre-approved with HDFC, PNB, SIB, SBI & all leading banks with fast 7-day loan sanctions.
                </p>
              </div>

              <div className="pt-2 text-center text-[10px] text-gray-500">
                100% Legal Clearance • Immediate Registration • DTCP Approved
              </div>
            </div>

            {/* Direct Property Enquiry Form Card */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-pink-100 space-y-5">
              <div className="space-y-1 pb-3 border-b border-gray-100 text-center">
                <span className="accent-text text-lg text-[#D61F69]">Quick Property Enquiry</span>
                <h3 className="font-heading-sc text-xl font-bold text-gray-900">
                  Enquire for {property.title}
                </h3>
                <p className="text-[11px] text-gray-500">
                  Fill in your details below to receive layout map, price break-up & direct assistance.
                </p>
              </div>

              {inlineSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-2.5">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-[#075E43] flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-[#075E43]" />
                  </div>
                  <h4 className="font-bold text-[#075E43] text-sm">Enquiry Received!</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Thank you, <span className="font-bold text-gray-900">{inlineForm.name}</span>. Your enquiry for <span className="font-bold text-gray-900">{property.title}</span> has been stored. Our property advisor will call you at <span className="font-bold text-gray-900">{inlineForm.phone}</span> shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setInlineSubmitted(false);
                      setInlineForm({
                        name: '',
                        phone: '',
                        email: '',
                        preferredVariant: property.plotVariants[0]?.dimension || '',
                        visitDate: '',
                        message: '',
                      });
                    }}
                    className="mt-2 text-xs font-bold text-[#075E43] hover:underline block mx-auto"
                  >
                    Submit another enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInlineSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Full Name <span className="text-[#D61F69]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Kumar"
                      value={inlineForm.name}
                      onChange={(e) => setInlineForm({ ...inlineForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-[#D61F69] focus:ring-1 focus:ring-[#D61F69] outline-none transition bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Phone / WhatsApp Number <span className="text-[#D61F69]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={inlineForm.phone}
                      onChange={(e) => setInlineForm({ ...inlineForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-[#D61F69] focus:ring-1 focus:ring-[#D61F69] outline-none transition bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Preferred Plot
                      </label>
                      <select
                        value={inlineForm.preferredVariant}
                        onChange={(e) => setInlineForm({ ...inlineForm, preferredVariant: e.target.value })}
                        className="w-full px-2.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-[#D61F69] focus:ring-1 focus:ring-[#D61F69] outline-none transition bg-gray-50 focus:bg-white text-gray-700"
                      >
                        {property.plotVariants.map((v, i) => (
                          <option key={i} value={v.dimension}>
                            {v.dimension} ({v.sqft} sqft)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Preferred Visit Date
                      </label>
                      <input
                        type="date"
                        value={inlineForm.visitDate}
                        onChange={(e) => setInlineForm({ ...inlineForm, visitDate: e.target.value })}
                        className="w-full px-2.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-[#D61F69] focus:ring-1 focus:ring-[#D61F69] outline-none transition bg-gray-50 focus:bg-white text-gray-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Message / Requirement (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Corner plot preference or loan assistance inquiry"
                      value={inlineForm.message}
                      onChange={(e) => setInlineForm({ ...inlineForm, message: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#D61F69] focus:ring-1 focus:ring-[#D61F69] outline-none transition bg-gray-50 focus:bg-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={inlineLoading}
                    className="w-full bg-[#D61F69] hover:bg-[#b81857] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {inlineLoading ? (
                      <span>Submitting Enquiry...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Property Enquiry
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-gray-400">
                    🔒 Stored securely • Direct callback from Sree Hari Realty team
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        propertyName={property.title}
        title={`Enquire for ${property.title}`}
      />
    </div>
  );
}
