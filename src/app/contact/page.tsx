'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  Navigation,
  Building2,
  ExternalLink
} from 'lucide-react';
import {
  COMPANY_PHONE,
  COMPANY_PHONE_RAW,
  COMPANY_PHONE_SECONDARY,
  COMPANY_PHONE_SECONDARY_RAW,
  COMPANY_WHATSAPP,
  COMPANY_EMAIL,
  COMPANY_ADDRESS,
  properties
} from '@/data/properties';

import { api } from '@/lib/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interestedProject: 'Sree Hari Garden',
    visitDate: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (formData.visitDate) {
        await api.submitPublicSiteVisit({
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email,
          project_name: formData.interestedProject,
          visit_date: formData.visitDate,
          notes: formData.message,
        });
      } else {
        await api.submitPublicLead({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: `Interested Project: ${formData.interestedProject}. ${formData.message || ''}`,
          source: 'Website Contact Page',
        });
      }

      // Also mirror locally
      try {
        const existing = JSON.parse(localStorage.getItem('sree_hari_leads') || '[]');
        existing.unshift({
          ...formData,
          timestamp: new Date().toISOString(),
          id: 'LEAD-CONTACT-' + Date.now(),
        });
        localStorage.setItem('sree_hari_leads', JSON.stringify(existing));
      } catch {
        // ignore
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppChat = () => {
    const text = encodeURIComponent(
      `Hi Sree Hari Realty Promoters,\n\nName: ${formData.name}\nPhone: ${formData.phone}\nInterested Project: ${formData.interestedProject}\nVisit Date: ${formData.visitDate || 'This Weekend'}\nMessage: ${formData.message || 'Looking for DTCP/RERA plot details in Trichy.'}`
    );
    window.open(`https://wa.me/${COMPANY_WHATSAPP}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-12 pb-16 font-sans">
      {/* 1. Page Header WITH HD PANORAMIC BACKGROUND & CINEMATIC GRADIENT */}
      <section className="relative min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] flex items-center overflow-hidden bg-gray-950 border-b border-amber-900/30">
        {/* Exact HD Panoramic Background Image */}
        <Image
          src="/hero_contact.jpg"
          alt="Sree Hari Realty Promoters Client Experience & Consultation Office"
          fill
          priority
          quality={95}
          className="object-cover object-[70%_center] sm:object-center"
        />

        {/* Balanced Cinematic Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/35 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10 w-full">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-bold tracking-widest text-amber-300 uppercase border border-amber-300/30 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D61F69] animate-pulse" />
              <span>GET IN TOUCH</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-md font-serif-title">
              Contact & Book <span className="text-[#D61F69] drop-shadow-[0_2px_12px_rgba(214,31,105,0.4)]">Site Visit</span>
            </h1>

            <p className="text-white/90 text-xs sm:text-[15px] font-medium leading-relaxed max-w-xl drop-shadow-sm">
              Visit our Trichy Head Office & Plot Booking Office or schedule a guided site tour to our DTCP & RERA approved gated communities. We are open all 7 days of the week.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Main Contact Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left: Official Contact & Office Info Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-b from-[#006452] via-[#005243] to-[#004135] text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border border-emerald-800">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-emerald-900/80 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold border border-emerald-700/60">
                  <Building2 className="w-3.5 h-3.5 text-[#ffa3c8]" />
                  <span>HEAD OFFICE & BOOKING OFFICE</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Sree Hari Realty Promoters
                </h2>
                <p className="text-sm text-emerald-100/90 leading-relaxed">
                  Leading DTCP & RERA approved gated community plot developers in Tiruchirappalli and prime Tamil Nadu growth corridors.
                </p>
              </div>

              <div className="space-y-5 pt-3 border-t border-emerald-700/70 text-[15px]">
                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-300 border border-white/10">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-300 uppercase font-bold block tracking-wider">
                      Office Address
                    </span>
                    <p className="text-[15px] text-white leading-snug mt-1 font-medium">
                      {COMPANY_ADDRESS}
                    </p>
                  </div>
                </div>

                {/* Primary & Secondary Phone */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-300 border border-white/10">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-300 uppercase font-bold block tracking-wider">
                      Booking Helpline Numbers
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mt-1">
                      <a
                        href={`tel:${COMPANY_PHONE_RAW}`}
                        className="text-[15px] font-extrabold text-white hover:text-amber-300 transition"
                      >
                        {COMPANY_PHONE}
                      </a>
                      <span className="hidden sm:inline text-emerald-400">|</span>
                      <a
                        href={`tel:${COMPANY_PHONE_SECONDARY_RAW}`}
                        className="text-[15px] font-extrabold text-white hover:text-amber-300 transition"
                      >
                        {COMPANY_PHONE_SECONDARY}
                      </a>
                    </div>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-300 border border-white/10">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-300 uppercase font-bold block tracking-wider">
                      WhatsApp Support
                    </span>
                    <a
                      href={`https://wa.me/${COMPANY_WHATSAPP}?text=Hi%20Sree%20Hari%20Realty%2C%20I%20want%20to%20enquire%20about%20plots.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[15px] font-extrabold text-white hover:text-amber-300 transition mt-1 inline-flex items-center gap-1.5"
                    >
                      <span>+91 73737 13559 (Chat on WhatsApp)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-300 border border-white/10">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-300 uppercase font-bold block tracking-wider">
                      Official Email
                    </span>
                    <a
                      href={`mailto:${COMPANY_EMAIL}`}
                      className="text-[15px] text-white hover:text-amber-300 transition mt-1 block"
                    >
                      {COMPANY_EMAIL}
                    </a>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-300 border border-white/10">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-300 uppercase font-bold block tracking-wider">
                      Working Hours
                    </span>
                    <p className="text-[15px] text-white mt-1 leading-snug">
                      Monday – Sunday: 9:00 AM – 7:30 PM <br />
                      <span className="text-xs text-emerald-200">(Site visits available all 7 days)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Get Directions Button */}
              <div className="pt-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    'Sree Hari Sweets, Melapudur Main Road, Tiruchirappalli, Tamil Nadu 620001'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#D61F69] hover:bg-[#BE185D] text-white font-bold py-3 px-5 rounded-2xl text-[14px] transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions to Office</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right: Lead & Site Visit Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-amber-200/80 space-y-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#D61F69] uppercase tracking-wider bg-pink-50 px-3 py-1 rounded-md border border-pink-100">
                QUICK RESPONSE FORM
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                Send an Enquiry or Book a Free Site Visit
              </h3>
              <p className="text-[15px] text-gray-600">
                Fill in your details below and our plot specialists will reach out promptly with pricing and blueprint layouts.
              </p>
            </div>

            {submitted ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#006452] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-extrabold text-gray-950">
                  Enquiry Submitted Successfully!
                </h4>
                <p className="text-[15px] text-gray-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{formData.name}</strong>. Our senior property executive will call you at <strong>{formData.phone}</strong> to confirm your site visit and share layout approval documents.
                </p>

                <div className="pt-3 max-w-xs mx-auto space-y-2.5">
                  <button
                    onClick={handleWhatsAppChat}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Open WhatsApp Chat
                  </button>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl text-xs transition cursor-pointer"
                  >
                    Send Another Enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 text-[15px] bg-[#fffdf5] border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D61F69] text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 73737 13559"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-3 text-[15px] bg-[#fffdf5] border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D61F69] text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 text-[15px] bg-[#fffdf5] border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D61F69] text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Select Project
                    </label>
                    <select
                      value={formData.interestedProject}
                      onChange={(e) =>
                        setFormData({ ...formData, interestedProject: e.target.value })
                      }
                      className="w-full p-3 text-[15px] bg-[#fffdf5] border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D61F69] text-gray-900"
                    >
                      {properties.map((p) => (
                        <option key={p.id} value={p.title}>
                          {p.title} ({p.location})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Preferred Site Visit Date
                  </label>
                  <input
                    type="date"
                    value={formData.visitDate}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                    className="w-full p-3 text-[15px] bg-[#fffdf5] border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D61F69] text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Your Requirements / Message
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g., Looking for a 1200 or 1500 sq.ft DTCP/RERA plot in Trichy with immediate registration..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3 text-[15px] bg-[#fffdf5] border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D61F69] text-gray-900 resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#D61F69] hover:bg-[#BE185D] text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Submitting...' : 'Submit Enquiry & Book Site Visit'}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 pt-1">
                  <ShieldCheck className="w-4 h-4 text-[#006452]" />
                  <span>100% DTCP & RERA Approved Plots • Free Doorstep Cab Site Pickup</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 3. Embedded Location Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#D61F69] uppercase tracking-wider block">
                LOCATION ON MAP
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-950">
                Sree Hari Realty Promoters Head Office
              </h3>
              <p className="text-[15px] text-gray-600 mt-0.5">
                {COMPANY_ADDRESS}
              </p>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                'Sree Hari Sweets, Melapudur Main Road, Tiruchirappalli, Tamil Nadu 620001'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#006452] hover:bg-[#004f41] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-sm self-start sm:self-auto cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Open in Google Maps</span>
            </a>
          </div>

          <div className="relative w-full h-[380px] sm:h-[420px] rounded-2xl overflow-hidden border border-amber-200/80 shadow-inner">
            <iframe
              title="Sree Hari Realty Promoters Melapudur Trichy Office"
              src="https://maps.google.com/maps?q=Sree+Hari+Sweets,+Melapudur+Main+Road,+Tiruchirappalli,+Tamil+Nadu+620001&t=&z=17&ie=UTF8&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
